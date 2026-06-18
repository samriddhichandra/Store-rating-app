import { useState } from 'react';
import api from '../api/axios';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]/\\;']).{8,16}$/;

export default function UpdatePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage(null);

    if (!PASSWORD_REGEX.test(form.newPassword)) {
      setError('New password must be 8-16 characters, with at least one uppercase letter and one special character.');
      return;
    }

    setSubmitting(true);
    try {
      await api.patch('/auth/update-password', form);
      setMessage('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 relative">
      {/* Floating particles */}
      <div className="particle-dot w-36 h-36 top-[5%] right-[5%] opacity-15" style={{ animationDelay: '0s' }} />
      <div className="particle-dot w-24 h-24 bottom-[15%] left-[5%] opacity-10" style={{ animationDelay: '4s', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2), transparent 70%)' }} />
      
      <h1 className="font-display text-2xl font-bold text-ink mb-1 animate-fade-in-up">Update password</h1>
      <p className="text-ink/55 text-sm mb-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>Keep your account secure with a strong password.</p>

      <form onSubmit={handleSubmit} className="card p-7 space-y-4 card-glow animate-scale-in" style={{ animationDelay: '0.1s' }}>
        {error && (
          <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2 border border-danger/20 animate-fade-in">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-success/10 text-success text-sm rounded-md px-3 py-2 border border-success/20 animate-fade-in">
            {message}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-ink/75 mb-1">Current password</label>
          <input
            type="password"
            required
            className="input-field"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/75 mb-1">New password</label>
          <input
            type="password"
            required
            className="input-field"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
          <p className="text-xs text-ink/40 mt-1">8-16 characters, 1 uppercase, 1 special character</p>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
