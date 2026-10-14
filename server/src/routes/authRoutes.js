import express from 'express';
import {
  normalizeLoginEmail,
  sendLoginOtp,
  verifyLoginOtp
} from '../services/emailOtpService.js';
import { createSessionToken, requireAuth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import { env } from '../config/env.js';

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, data: req.user });
});

router.post('/send-otp', async (req, res, next) => {
  const email = normalizeLoginEmail(req.body?.email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  try {
    await sendLoginOtp(email);
    return res.json({
      success: true,
      message: 'If this email is registered, a verification code has been sent.'
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  const email = normalizeLoginEmail(req.body?.email);
  const otp = String(req.body?.otp || '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address and 6-digit code.' });
  }

  try {
    const user = await verifyLoginOtp(email, otp);
    const token = createSessionToken(email);
    return res.json({ success: true, data: { ...user, token } });
  } catch (error) {
    return next(error);
  }
});

router.get('/users', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ email: 1 }).lean();
    const data = users.map((user) => ({
      id: String(user._id),
      email: user.email,
      role: user.role
    }));

    if (req.user.id === 'bootstrap-admin') {
      data.unshift({
        id: 'bootstrap-admin',
        email: req.user.email,
        role: 'admin',
        protected: true
      });
    }

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.post('/users', requireAuth, requireRole('admin'), async (req, res, next) => {
  const email = normalizeLoginEmail(req.body?.email);
  const role = String(req.body?.role || '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }
  if (!['admin', 'customer', 'staff'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Choose a valid designation.' });
  }
  if (env.adminLoginEmail && email === env.adminLoginEmail.trim().toLowerCase()) {
    return res.status(409).json({ success: false, message: 'The main admin email is protected.' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    return res.status(201).json({
      success: true,
      data: { id: String(user._id), email: user.email, role: user.role }
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/users/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  const role = String(req.body?.role || '');
  if (!['admin', 'customer', 'staff'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Choose a valid designation.' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }
    return res.json({
      success: true,
      data: { id: String(user._id), email: user.email, role: user.role }
    });
  } catch (error) {
    return next(error);
  }
});

router.delete('/users/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }
    return res.json({ success: true, message: 'Account removed.' });
  } catch (error) {
    return next(error);
  }
});

export default router;
