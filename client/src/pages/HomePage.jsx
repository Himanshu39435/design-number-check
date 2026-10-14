import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, CalendarDays, Copy, ArrowRight } from 'lucide-react';
import api from '../api/client';
import DesignCard from '../components/DesignCard';

export default function HomePage({ user }) {
  const [stats, setStats] = useState({ total: 0, designsAddedToday: 0, designsAddedThisMonth: 0, possibleDuplicateAttempts: 0, recentDesigns: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await api.get('/designs/dashboard/stats');
        setStats(data.data || stats);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-10 2xl:p-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-700">Overview</p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1>
        </div>
        {['admin', 'staff'].includes(user?.role) && (
          <Link to="/add-design" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-soft sm:w-auto">
            <Plus size={18} />
            Add New Design
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Designs', value: stats.total, icon: TrendingUp },
          { label: 'Added Today', value: stats.designsAddedToday, icon: CalendarDays },
          { label: 'This Month', value: stats.designsAddedThisMonth, icon: CalendarDays },
          { label: 'Possible Duplicates', value: stats.possibleDuplicateAttempts, icon: Copy }
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm leading-snug text-slate-500">{label}</span>
              <div className="rounded-xl bg-primary-100 p-2 text-primary-700"><Icon size={17} /></div>
            </div>
            <div className="mt-4 text-3xl font-bold text-slate-900">{loading ? '…' : value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Recently Added Designs</h2>
          <Link to="/designs" className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary-700">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {(stats.recentDesigns || []).map((design) => (
            <div key={design._id} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200">
              <img src={design.imageUrl} alt={design.designNumber} loading="lazy" className="h-28 w-full object-cover sm:h-36" />
              <div className="p-3">
                <p className="break-words text-sm font-semibold text-slate-800">{design.designNumber}</p>
                {design.size && <p className="mt-1 text-xs text-slate-500">Size: {design.size}</p>}
                <p className="mt-1 text-sm text-primary-700">₹{Number(design.rate || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
