import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminAddStore() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/users', { params: { role: 'STORE_OWNER' } }).then((res) => setOwners(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name.length > 60) {
      setError('Store name must not exceed 60 characters.');
      return;
    }
    if (form.address.length > 400) {
      setError('Address must not exceed 400 characters.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.ownerId) delete payload.ownerId;
      await api.post('/stores', payload);
      navigate('/admin/stores');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create store.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 relative">
      {/* Floating particles */}
      <div className="particle-dot w-36 h-36 top-[10%] right-[5%] opacity-15" style={{ animationDelay: '0s' }} />
      <div className="particle-dot w-24 h-24 bottom-[20%] left-[5%] opacity-10" style={{ animationDelay: '3s', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2), transparent 70%)' }} />
      
      <Link to="/admin/stores" className="text-sm text-primary font-semibold hover:underline transition-colors">
        ← Back to stores
      </Link>
      <h1 className="font-display text-2xl font-bold text-ink mt-3 mb-1 animate-fade-in-up">Add store</h1>
      <p className="text-ink/55 text-sm mb-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>Register a new store on the platform.</p>

      <form onSubmit={handleSubmit} className="card p-7 space-y-4 card-glow animate-scale-in" style={{ animationDelay: '0.1s' }}>
        {error && (
          <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2 border border-danger/20 animate-fade-in">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-ink/75 mb-1">Store name</label>
          <input
            type="text"
            required
            maxLength={60}
            className="input-field"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/75 mb-1">Email</label>
          <input
            type="email"
            required
            className="input-field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/75 mb-1">Address</label>
          <textarea
            required
            rows={2}
            maxLength={400}
            className="input-field"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/75 mb-1">
            Store owner <span className="text-ink/40 font-normal">(optional)</span>
          </label>
          <select
            className="input-field"
            value={form.ownerId}
            onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
          >
            <option value="">No owner assigned yet</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.email})
              </option>
            ))}
          </select>
          <p className="text-xs text-ink/40 mt-1">
            Only users created with the "Store Owner" role appear here.
          </p>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating...' : 'Create store'}
        </button>
      </form>
    </div>
  );
}
