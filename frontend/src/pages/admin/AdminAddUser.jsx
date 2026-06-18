import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]/\\;']).{8,16}$/;

export default function AdminAddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'NORMAL_USER' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (form.name.length < 20 || form.name.length > 60) return 'Name must be between 20 and 60 characters.';
    if (form.address.length > 400) return 'Address must not exceed 400 characters.';
    if (!PASSWORD_REGEX.test(form.password)) {
      return 'Password must be 8-16 characters, with at least one uppercase letter and one special character.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/users', form);
      navigate('/admin/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 relative">
      {/* Floating particles */}
      <div className="particle-dot w-36 h-36 top-[10%] right-[5%] opacity-15" style={{ animationDelay: '0s' }} />
      <div className="particle-dot w-24 h-24 bottom-[20%] left-[5%] opacity-10" style={{ animationDelay: '3s', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2), transparent 70%)' }} />
      
      <Link to="/admin/users" className="text-sm text-primary font-semibold hover:underline transition-colors">
        ← Back to users
      </Link>
      <h1 className="font-display text-2xl font-bold text-ink mt-3 mb-1 animate-fade-in-up">Add user</h1>
      <p className="text-ink/55 text-sm mb-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>Create a normal user, store owner, or admin account.</p>

      <form onSubmit={handleSubmit} className="card p-7 space-y-4 card-glow animate-scale-in" style={{ animationDelay: '0.1s' }}>
        {error && (
          <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2 border border-danger/20 animate-fade-in">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-ink/75 mb-1">Full name</label>
          <input
            type="text"
            required
            className="input-field"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="At least 20 characters"
          />
          <p className="text-xs text-ink/40 mt-1">{form.name.length}/60 characters (min 20)</p>
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
          <label className="block text-sm font-medium text-ink/75 mb-1">Password</label>
          <input
            type="password"
            required
            className="input-field"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <p className="text-xs text-ink/40 mt-1">8-16 characters, 1 uppercase, 1 special character</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/75 mb-1">Role</label>
          <select
            className="input-field"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="NORMAL_USER">Normal User</option>
            <option value="STORE_OWNER">Store Owner</option>
            <option value="ADMIN">System Administrator</option>
          </select>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating...' : 'Create user'}
        </button>
      </form>
    </div>
  );
}
