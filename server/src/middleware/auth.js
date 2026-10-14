import { createHmac, timingSafeEqual } from 'node:crypto';
import User from '../models/User.js';
import { env } from '../config/env.js';

const SESSION_DURATION_SECONDS = 60 * 60 * 24;

function encode(value) {
  return Buffer.from(value).toString('base64url');
}

function sign(value) {
  if (!env.authSessionSecret) {
    const error = new Error('Login sessions are not configured. Set AUTH_SESSION_SECRET.');
    error.status = 503;
    throw error;
  }

  return createHmac('sha256', env.authSessionSecret).update(value).digest('base64url');
}

export function createSessionToken(email) {
  const payload = encode(JSON.stringify({
    email,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
  }));
  const content = `v1.${payload}`;
  return `${content}.${sign(content)}`;
}

export async function requireAuth(req, res, next) {
  try {
    const authorization = req.get('authorization') || '';
    const match = authorization.match(/^Bearer (.+)$/i);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Please login to continue.' });
    }

    const [version, payload, providedSignature] = match[1].split('.');
    if (version !== 'v1' || !payload || !providedSignature) {
      return res.status(401).json({ success: false, message: 'Your login session is invalid. Please login again.' });
    }

    const content = `${version}.${payload}`;
    const expectedSignature = sign(content);
    const expectedBuffer = Buffer.from(expectedSignature);
    const providedBuffer = Buffer.from(providedSignature);
    if (
      expectedBuffer.length !== providedBuffer.length ||
      !timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      return res.status(401).json({ success: false, message: 'Your login session is invalid. Please login again.' });
    }

    let session;
    try {
      session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    } catch {
      return res.status(401).json({ success: false, message: 'Your login session is invalid. Please login again.' });
    }

    if (!session.email || session.expiresAt <= Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ success: false, message: 'Your login session has expired. Please login again.' });
    }

    const email = String(session.email).toLowerCase();
    const configuredAccounts = [
      { email: env.adminLoginEmail, role: 'admin', label: 'Admin', id: 'bootstrap-admin' },
      { email: env.customerLoginEmail, role: 'customer', label: 'Customer', id: 'bootstrap-customer' },
      { email: env.staffLoginEmail, role: 'staff', label: 'Staff', id: 'bootstrap-staff' }
    ];
    const configuredAccount = configuredAccounts.find(
      (account) => account.email && email === account.email.trim().toLowerCase()
    );

    if (configuredAccount) {
      req.user = {
        id: configuredAccount.id,
        email,
        role: configuredAccount.role,
        label: configuredAccount.label
      };
    } else {
      const account = await User.findOne({ email }).lean();
      if (!account) {
        return res.status(401).json({ success: false, message: 'This account is no longer active. Please login again.' });
      }
      req.user = {
        id: String(account._id),
        email: account.email,
        role: account.role,
        label: account.role[0].toUpperCase() + account.role.slice(1)
      };
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
    }
    return next();
  };
}
