import { useEffect, useState } from 'react';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';

function StatCard({ label, value, accent }) {
  return (
    <div className="card p-6 surface-hover card-glow animate-scale-in">
      <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className={`font-display text-4xl font-bold mt-2 animate-fade-in-up ${accent ? 'text-accent' : 'text-primary-light'}`}
          style={{ animationDelay: '0.3s' }}>
        {value}
      </p>
    </div>
  );
}

function StarDisplay({ value }) {
  if (value == null) {
    return <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>N/A</span>;
  }
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = [];
  for (let i = 0; i < full; i++) stars.push('★');
  if (half) stars.push('½');
  while (stars.length < 5) stars.push('☆');
  return <span className="text-accent tracking-wider">{stars.join('')} <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>{value.toFixed(2)}</span></span>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('userName');
  const [order, setOrder] = useState('ASC');

  useEffect(() => {
    api
      .get('/dashboard/admin')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get('/dashboard/user-ratings')
      .then((res) => setRatings(res.data))
      .finally(() => setRatingsLoading(false));
  }, []);

  const handleSort = (key) => {
    if (sortBy === key) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(key);
      setOrder('ASC');
    }
  };

  const sortedRatings = [...ratings].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return order === 'ASC' ? -1 : 1;
    if (aVal > bVal) return order === 'ASC' ? 1 : -1;
    return 0;
  });

  const columns = [
    { key: 'userName', label: 'User Name', sortable: true },
    { key: 'userEmail', label: 'User Email', sortable: true },
    { key: 'storeName', label: 'Store', sortable: true },
    { key: 'userRating', label: 'User Rating', sortable: true, render: (row) => <StarDisplay value={row.userRating} /> },
    { key: 'averageRating', label: 'Avg Store Rating', sortable: true, render: (row) => <StarDisplay value={row.averageRating} /> },
  ];

  return (
    <div className="page-shell">
      <p className="eyebrow">Admin command center</p>
      <h1 className="font-display text-3xl font-bold text-ink mt-2 mb-1">Dashboard</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>Platform-wide overview of users, stores, and ratings.</p>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading stats...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <StatCard label="Total Users" value={stats?.totalUsers ?? 0} />
          <StatCard label="Total Stores" value={stats?.totalStores ?? 0} />
          <StatCard label="Total Ratings Submitted" value={stats?.totalRatings ?? 0} accent />
        </div>
      )}

      <h2 className="font-display text-xl font-bold text-ink mb-4">Users Who Rated Their Store</h2>
      {ratingsLoading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading ratings...</p>
      ) : (
        <SortableTable
          columns={columns}
          data={sortedRatings}
          sortBy={sortBy}
          order={order}
          onSort={handleSort}
          emptyText="No ratings found."
        />
      )}
    </div>
  );
}
