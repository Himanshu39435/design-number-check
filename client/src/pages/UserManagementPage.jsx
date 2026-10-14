import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus } from 'lucide-react';
import api from '../api/client';

const roles = ['customer', 'staff', 'admin'];

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Users could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const addUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.post('/auth/users', { email, role });
      setUsers((current) => {
        const withoutExisting = current.filter((user) => user.id !== data.data.id);
        return [...withoutExisting, data.data].sort((a, b) => a.email.localeCompare(b.email));
      });
      setEmail('');
      setRole('customer');
      setMessage('User designation saved.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'User could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const updateRole = async (user, nextRole) => {
    setError('');
    setMessage('');
    try {
      const { data } = await api.put(`/auth/users/${user.id}`, { role: nextRole });
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, ...data.data } : item));
      setMessage(`${user.email} is now ${nextRole}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Designation could not be updated.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-700">Administration</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">User Designations</h1>
        <p className="mt-2 text-sm text-slate-600">Assign each login email as customer, staff, or admin.</p>
      </div>

      <form onSubmit={addUser} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <UserPlus size={19} className="text-primary-700" />
          Add or assign a user
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="user@example.com"
            className="min-h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 outline-none focus:border-primary-500"
          />
          <select value={role} onChange={(event) => setRole(event.target.value)} className="min-h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 outline-none focus:border-primary-500">
            {roles.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
          </select>
          <button type="submit" disabled={saving} className="min-h-11 rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? 'Saving...' : 'Save designation'}
          </button>
        </div>
      </form>

      {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</div>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4 font-semibold text-slate-900">
          <ShieldCheck size={19} className="text-primary-700" />
          Registered users
        </div>
        {loading ? (
          <p className="p-5 text-sm text-slate-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No users have logged in yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">{user.email}</p>
                  {user.protected && <p className="mt-1 text-xs text-slate-500">Protected bootstrap admin</p>}
                </div>
                <select
                  value={user.role}
                  disabled={user.protected}
                  onChange={(event) => updateRole(user, event.target.value)}
                  className="min-h-10 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {roles.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
