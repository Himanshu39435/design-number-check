import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import User from '../models/User.js';

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_DELAY_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const pendingOtps = new Map();
const lastSentAt = new Map();

function getTransport() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPassword || !env.smtpFrom) {
    const error = new Error('Email OTP is not configured. Set the SMTP environment variables.');
    error.status = 503;
    throw error;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: { user: env.smtpUser, pass: env.smtpPassword }
  });
}

async function getAccount(email) {
  const configuredAccounts = [
    { email: env.adminLoginEmail, role: 'admin', label: 'Admin' },
    { email: env.customerLoginEmail, role: 'customer', label: 'Customer' },
    { email: env.staffLoginEmail, role: 'staff', label: 'Staff' }
  ];
  const configuredAccount = configuredAccounts.find(
    (account) => account.email && account.email.trim().toLowerCase() === email
  );
  if (configuredAccount) {
    return configuredAccount;
  }

  const account = await User.findOne({ email }).lean();
  if (!account) return null;
  return {
    role: account.role,
    label: account.role[0].toUpperCase() + account.role.slice(1)
  };
}

function hashOtp(email, otp) {
  return createHash('sha256').update(`${email}:${otp}`).digest();
}

export async function sendLoginOtp(email) {
  const now = Date.now();
  const lastSent = lastSentAt.get(email);

  if (lastSent && now - lastSent < RESEND_DELAY_MS) {
    const error = new Error('Please wait a minute before requesting another code.');
    error.status = 429;
    throw error;
  }

  const transport = getTransport();

  const otp = String(randomInt(100000, 1000000));
  await transport.sendMail({
    from: env.smtpFrom,
    to: email,
    subject: 'Your Himanshu Textile login verification code',
    text: `Your login verification code is ${otp}. It expires in 5 minutes. If you did not request it, you can ignore this email.`,
    html: `<p>Your Himanshu Textile login verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:5px">${otp}</p><p>This code expires in 5 minutes. If you did not request it, you can ignore this email.</p>`
  });

  pendingOtps.set(email, {
    hash: hashOtp(email, otp),
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0
  });
  lastSentAt.set(email, now);
}

export async function verifyLoginOtp(email, otp) {
  const pending = pendingOtps.get(email);
  if (!pending || Date.now() > pending.expiresAt || pending.attempts >= MAX_ATTEMPTS) {
    pendingOtps.delete(email);
    const error = new Error('The code is invalid or expired. Request a new code and try again.');
    error.status = 400;
    throw error;
  }

  const submittedHash = hashOtp(email, otp);
  if (!timingSafeEqual(pending.hash, submittedHash)) {
    pending.attempts += 1;
    if (pending.attempts >= MAX_ATTEMPTS) pendingOtps.delete(email);
    const error = new Error('The code is incorrect. Please check it and try again.');
    error.status = 400;
    throw error;
  }

  let account = await getAccount(email);
  if (!account) {
    const user = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: { email, role: 'customer' } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    account = {
      role: user.role,
      label: user.role[0].toUpperCase() + user.role.slice(1)
    };
  }

  pendingOtps.delete(email);
  lastSentAt.delete(email);
  return {
    id: `${account.role}-${email}`,
    role: account.role,
    label: account.label,
    email
  };
}

export function normalizeLoginEmail(value) {
  return String(value || '').trim().toLowerCase();
}
