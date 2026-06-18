import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingCollage from '../components/FloatingCollage';

const ROLE_HOME = {
  ADMIN: '/admin',
  NORMAL_USER: '/stores',
  STORE_OWNER: '/owner',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Floating image collage background */}
      <FloatingCollage page="login" />
      
      {/* Floating background particles */}
      <div className="particle-dot w-48 h-48 top-[10%] left-[5%] opacity-20" style={{ animationDelay: '0s' }} />
      <div className="particle-dot w-32 h-32 bottom-[20%] right-[8%] opacity-15" style={{ animationDelay: '2s', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2), transparent 70%)' }} />
      <div className="particle-dot w-40 h-40 top-[40%] right-[15%] opacity-10" style={{ animationDelay: '4s' }} />

      <div className="w-full max-w-5xl grid gap-8 md:grid-cols-[1.05fr_0.95fr] items-center animate-scale-in relative z-10">
        <section className="hidden md:block">
          <p className="eyebrow">Store intelligence</p>
          <h1 className="font-display text-5xl font-bold leading-tight mt-4 animate-slide-left">
            Rate better places with sharper signals.
          </h1>
          <p className="text-slate-300 mt-4 max-w-md animate-slide-left" style={{ animationDelay: '0.15s' }}>
            A polished workspace for customers, store owners, and admins to track ratings with clarity.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-8 max-w-lg stagger-children">
            {['Live ratings', 'Owner insight', 'Admin control'].map((item) => (
              <div key={item} className="card p-4 text-sm text-slate-300 surface-hover">
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="w-full max-w-sm mx-auto">
          <div className="text-center mb-8 animate-fade-in-up">
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Sign in to rate and discover stores</p>
          </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-4 surface-hover card-glow animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {error && (
            <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2 border border-danger/20 animate-fade-in">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink/75 mb-1">Email</label>
            <input
              type="email"
              required
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
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
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

          <p className="text-center text-sm text-slate-400 mt-5 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          New here?{' '}
          <Link to="/signup" className="text-primary-light font-semibold hover:underline transition-colors">
            Create an account
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
