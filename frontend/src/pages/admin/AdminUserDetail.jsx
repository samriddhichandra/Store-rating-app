import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';

const ROLE_LABEL = {
  ADMIN: 'System Administrator',
  NORMAL_USER: 'Normal User',
  STORE_OWNER: 'Store Owner',
};

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/users/${id}`)
      .then((res) => setUser(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="px-6 py-10 text-ink/50">Loading...</p>;
  if (!user) return <p className="px-6 py-10 text-ink/50">User not found.</p>;

  return (
    <div className="max-w-md mx-auto px-4 py-10 relative">
      {/* Floating particles */}
      <div className="particle-dot w-36 h-36 top-[10%] right-[5%] opacity-15" style={{ animationDelay: '0s' }} />
      <div className="particle-dot w-24 h-24 bottom-[20%] left-[5%] opacity-10" style={{ animationDelay: '3s', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2), transparent 70%)' }} />
      
      <Link to="/admin/users" className="text-sm text-primary font-semibold hover:underline transition-colors">
        ← Back to users
      </Link>

      <div className="card p-7 mt-4 card-glow animate-scale-in">
        <h1 className="font-display text-xl font-bold text-ink animate-fade-in-up">{user.name}</h1>
        <span className="inline-block mt-1 text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {ROLE_LABEL[user.role]}
        </span>

        <dl className="mt-6 space-y-4 text-sm">
          <div className="animate-slide-left" style={{ animationDelay: '0.2s' }}>
            <dt className="text-ink/45">Email</dt>
            <dd className="text-ink font-medium">{user.email}</dd>
          </div>
          <div className="animate-slide-left" style={{ animationDelay: '0.25s' }}>
            <dt className="text-ink/45">Address</dt>
            <dd className="text-ink font-medium">{user.address}</dd>
          </div>
          {user.role === 'STORE_OWNER' && (
            <div className="animate-slide-left" style={{ animationDelay: '0.3s' }}>
              <dt className="text-ink/45 mb-1">Store rating</dt>
              <dd className="flex items-center gap-2">
                <StarRating value={Math.round(user.rating || 0)} readOnly size="sm" />
                <span className="text-ink/60">{user.rating ?? 'No ratings yet'}</span>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
