import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingCollage from '../components/FloatingCollage';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]/\\;']).{8,16}$/;

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (form.name.length < 20 || form.name.length > 60) {
      return 'Name must be between 20 and 60 characters.';
    }
    if (form.address.length > 400) {
      return 'Address must not exceed 400 characters.';
    }
    if (!PASSWORD_REGEX.test(form.password)) {
      return 'Password must be 8-16 characters, with at least one uppercase letter and one special character.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await signup(form);
      navigate('/stores');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Floating image collage background */}
      <FloatingCollage page="signup" />
      
      {/* Floating background particles */}
      <div className="particle-dot w-48 h-48 top-[15%] right-[5%] opacity-20" style={{ animationDelay: '0s' }} />
      <div className="particle-dot w-36 h-36 bottom-[10%] left-[8%] opacity-15" style={{ animationDelay: '3s', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2), transparent 70%)' }} />
      <div className="particle-dot w-28 h-28 top-[50%] left-[20%] opacity-10" style={{ animationDelay: '5s' }} />
      
      <div className="w-full max-w-sm animate-scale-in relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Create your account to start rating stores</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-4 surface-hover card-glow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
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
            <p className="text-xs text-slate-500 mt-1">{form.name.length}/60 characters (min 20)</p>
          </div>
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
            <label className="block text-sm font-medium text-ink/75 mb-1">Address</label>
            <textarea
              required
              rows={2}
              maxLength={400}
              className="input-field"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Your address"
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
              placeholder="Create a password"
            />
            <p className="text-xs text-slate-500 mt-1">8-16 characters, 1 uppercase, 1 special character</p>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-5 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-primary-light font-semibold hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
