import dotenv from 'dotenv';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDirectory, '../../../.env') });

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/narang-textile',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  duplicateThreshold: Number(process.env.DUPLICATE_THRESHOLD || 95),
  possibleDuplicateThreshold: Number(process.env.POSSIBLE_DUPLICATE_THRESHOLD || 85),
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB || 10),
  apiBaseUrl: process.env.VITE_API_URL || 'http://localhost:5000/api',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  smtpFrom: process.env.SMTP_FROM || '',
  adminLoginEmail: process.env.ADMIN_LOGIN_EMAIL || '',
  customerLoginEmail: process.env.CUSTOMER_LOGIN_EMAIL || '',
  staffLoginEmail: process.env.STAFF_LOGIN_EMAIL || '',
  authSessionSecret: process.env.AUTH_SESSION_SECRET || randomBytes(32).toString('hex')
};
