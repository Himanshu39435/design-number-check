import React from 'react';
import { Home, Search, PlusSquare, Folder, Bell, User, LogOut, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: Home, allowedRoles: ['admin', 'customer', 'staff'] },
  { to: '/search-photo', label: 'Search Photo', icon: Search, allowedRoles: ['admin', 'customer', 'staff'] },
  { to: '/add-design', label: 'Add Design', icon: PlusSquare, allowedRoles: ['admin', 'staff'] },
  { to: '/designs', label: 'Designs', icon: Folder, allowedRoles: ['admin', 'customer', 'staff'] },
  { to: '/users', label: 'Users', icon: Users, allowedRoles: ['admin'] }
];

export default function Layout({ children, user, onLogout }) {
  const visibleNavItems = navItems.filter(({ allowedRoles }) => allowedRoles.includes(user?.role));

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col xl:w-72 xl:p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary-700">Narang Textile</h1>
            <p className="mt-1 text-sm text-slate-500">Design Manager</p>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{user?.label || 'User'}</p>
                <p className="truncate text-xs text-slate-500">{user?.email || 'No email'}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {visibleNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <LogOut size={16} />
              Logout
            </button>

            <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-4 text-white shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary-100">Quick</p>
                  <h2 className="mt-1 text-lg font-semibold">Add New Design</h2>
                </div>
                <Bell size={18} />
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {visibleNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-xl px-2 py-2 text-[10px] font-medium ${
                  isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-600'
                }`
              }
            >
              <Icon size={18} />
              <span className="mt-1">{label === 'Add Design' ? 'Add' : label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
