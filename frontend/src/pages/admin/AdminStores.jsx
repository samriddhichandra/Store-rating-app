import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import StarRating from '../../components/StarRating';

export default function AdminStores() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    setLoading(true);
    const params = { ...filters, sortBy, order };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    const res = await api.get('/stores', { params });
    setStores(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, order]);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address', render: (r) => <span className="line-clamp-1 max-w-xs block">{r.address}</span> },
    {
      key: 'rating',
      label: 'Rating',
      render: (r) => (
        <div className="flex items-center gap-2">
          <StarRating value={Math.round(r.overallRating || 0)} readOnly size="sm" />
          <span className="text-slate-400 text-xs">
            {r.overallRating ?? '—'} {r.ratingsCount ? `(${r.ratingsCount})` : ''}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="page-shell">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="eyebrow">Store registry</p>
          <h1 className="font-display text-3xl font-bold text-ink mt-2">Stores</h1>
          <p className="text-slate-400 text-sm">Browse and register stores on the platform.</p>
        </div>
        <Link to="/admin/stores/new" className="btn-primary">
          + Add store
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchStores();
        }}
        className="card p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 card-glow animate-fade-in-up"
      >
        <input
          className="input-field"
          placeholder="Filter by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="Filter by email"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="Filter by address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
        <button type="submit" className="btn-secondary">
          Apply filters
        </button>
      </form>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      ) : (
        <SortableTable
          columns={columns}
          data={stores}
          sortBy={sortBy}
          order={order}
          onSort={(key, ord) => {
            setSortBy(key);
            setOrder(ord);
          }}
          emptyText="No stores match these filters."
        />
      )}
    </div>
  );
}
