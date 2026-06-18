import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import SortableTable from '../../components/SortableTable';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('submittedAt');
  const [order, setOrder] = useState('DESC');

  useEffect(() => {
    api
      .get('/stores/owner/dashboard')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="px-6 py-10" style={{ color: 'var(--color-text-muted)' }}>Loading dashboard...</p>;

  const storeNames = (data?.stores || []).map((s) => s.name).join(', ') || 'No store assigned yet';

  // Client-side sorting
  const sortedRaters = [...(data?.raters || [])].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'name':
        aVal = a.user?.name?.toLowerCase() ?? '';
        bVal = b.user?.name?.toLowerCase() ?? '';
        break;
      case 'email':
        aVal = a.user?.email?.toLowerCase() ?? '';
        bVal = b.user?.email?.toLowerCase() ?? '';
        break;
      case 'rating':
        aVal = a.rating ?? 0;
        bVal = b.rating ?? 0;
        break;
      case 'submittedAt':
        aVal = new Date(a.submittedAt).getTime();
        bVal = new Date(b.submittedAt).getTime();
        break;
      default:
        return 0;
    }
    if (aVal < bVal) return order === 'ASC' ? -1 : 1;
    if (aVal > bVal) return order === 'ASC' ? 1 : -1;
    return 0;
  });

  const columns = [
    { key: 'name', label: 'User', render: (r) => r.user?.name },
    { key: 'email', label: 'Email', render: (r) => r.user?.email },
    {
      key: 'rating',
      label: 'Rating',
      render: (r) => <StarRating value={r.rating} readOnly size="sm" />,
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      render: (r) => new Date(r.submittedAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="page-shell max-w-5xl">
      <p className="eyebrow">Owner insights</p>
      <h1 className="font-display text-3xl font-bold text-ink mt-2 mb-1">Store dashboard</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>{storeNames}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 stagger-children">
        <div className="card p-6 surface-hover card-glow">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Average rating</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-display text-4xl font-bold text-accent-dark">
              {data?.averageRating ?? 'No ratings'}
            </span>
            <StarRating value={Math.round(data?.averageRating || 0)} readOnly />
          </div>
        </div>
        <div className="card p-6 surface-hover card-glow">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Total ratings received</p>
          <p className="font-display text-4xl font-bold text-primary-light mt-2">{data?.raters?.length ?? 0}</p>
        </div>
      </div>

      <h2 className="font-display font-semibold text-lg text-ink mb-3 animate-fade-in-up">Customers who rated your store</h2>
      <SortableTable
        columns={columns}
        data={sortedRaters}
        sortBy={sortBy}
        order={order}
        onSort={(key, ord) => {
          setSortBy(key);
          setOrder(ord);
        }}
        emptyText="No ratings submitted yet."
      />
    </div>
  );
}
