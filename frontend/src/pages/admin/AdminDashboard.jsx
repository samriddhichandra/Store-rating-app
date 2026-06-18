import { useEffect, useState } from 'react';
import api from '../../api/axios';

function StatCard({ label, value, accent }) {
  return (
    <div className="card p-6 surface-hover card-glow animate-scale-in">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className={`font-display text-4xl font-bold mt-2 animate-fade-in-up ${accent ? 'text-accent' : 'text-primary-light'}`}
          style={{ animationDelay: '0.3s' }}>
        {value}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/admin')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <p className="eyebrow">Admin command center</p>
      <h1 className="font-display text-3xl font-bold text-ink mt-2 mb-1">Dashboard</h1>
      <p className="text-slate-400 text-sm mb-8">Platform-wide overview of users, stores, and ratings.</p>

      {loading ? (
        <p className="text-slate-400">Loading stats...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard label="Total Users" value={stats?.totalUsers ?? 0} />
          <StatCard label="Total Stores" value={stats?.totalStores ?? 0} />
          <StatCard label="Total Ratings Submitted" value={stats?.totalRatings ?? 0} accent />
        </div>
      )}
    </div>
  );
}
