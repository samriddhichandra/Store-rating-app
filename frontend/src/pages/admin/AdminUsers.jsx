import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';

const ROLE_BADGE = {
  ADMIN: 'bg-primary/15 text-primary-light border border-primary/25',
  NORMAL_USER: 'bg-white/10 text-slate-300 border border-white/10',
  STORE_OWNER: 'bg-accent/15 text-accent-light border border-accent/20',
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const params = { ...filters, sortBy, order };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    const res = await api.get('/users', { params });
    setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, order]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address', render: (r) => <span className="line-clamp-1 max-w-xs block">{r.address}</span> },
    {
      key: 'role',
      label: 'Role',
      render: (r) => (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ROLE_BADGE[r.role]}`}>
          {r.role.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: false,
      render: (r) => (r.role === 'STORE_OWNER' ? (r.rating ?? '—') : '—'),
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (r) => (
        <button onClick={() => navigate(`/admin/users/${r.id}`)} className="text-primary-light text-sm font-semibold hover:underline">
          View
        </button>
      ),
    },
  ];

  return (
    <div className="page-shell">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="eyebrow">People directory</p>
          <h1 className="font-display text-3xl font-bold text-ink mt-2">Users</h1>
          <p className="text-slate-400 text-sm">Manage normal users, store owners, and admins.</p>
        </div>
        <Link to="/admin/users/new" className="btn-primary">
          + Add user
        </Link>
      </div>

      <form onSubmit={handleFilterSubmit} className="card p-4 mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3 card-glow animate-fade-in-up">
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
        <select
          className="input-field"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="NORMAL_USER">Normal User</option>
          <option value="STORE_OWNER">Store Owner</option>
        </select>
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
          data={users}
          sortBy={sortBy}
          order={order}
          onSort={(key, ord) => {
            setSortBy(key);
            setOrder(ord);
          }}
          emptyText="No users match these filters."
        />
      )}
    </div>
  );
}
