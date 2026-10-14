import React, { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import api from '../api/client';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [error, setError] = useState('');

  const getErrorMessage = (requestError, fallback) =>
    requestError.response?.data?.message || requestError.message || fallback;

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setOtpSent(false);
    setOtp('');
    setInfoMessage('');
    setError('');
  };

  const handleSendOtp = async () => {
    setError('');
    setInfoMessage('');
    setSendingOtp(true);

    try {
      const { data } = await api.post('/auth/send-otp', { email });
      setInfoMessage(data.message);
      setOtpSent(true);
      setOtp('');
    } catch (requestError) {
      setOtpSent(false);
      setError(getErrorMessage(requestError, 'Unable to send the verification code.'));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setVerifyingOtp(true);

    try {
      await onLogin(email, otp);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to verify the code. Please try again.'));
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-[30px] border border-slate-200 bg-slate-900 p-6 shadow-soft sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Secure Access</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Login</h1>
          </div>
          <div className="inline-flex rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3 text-white">
            <LockKeyhole size={20} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-200">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleEmailChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-primary-500 focus:outline-none"
              placeholder="Enter your registered email"
            />
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={sendingOtp || !email}
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sendingOtp ? 'Sending code...' : 'Send verification code'}
          </button>

          {otpSent ? (
            <div>
              <label htmlFor="login-otp" className="mb-2 block text-sm font-medium text-slate-200">
                Email verification code
              </label>
              <input
                id="login-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-primary-500 focus:outline-none"
                placeholder="Enter the 6-digit code"
              />
            </div>
          ) : null}

          {infoMessage ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {infoMessage}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!otpSent || verifyingOtp || otp.length !== 6}
            className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {verifyingOtp ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
