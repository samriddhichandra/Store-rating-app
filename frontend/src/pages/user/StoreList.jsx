import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';

export default function StoreList() {
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const fetchStores = async () => {
    setLoading(true);
    const params = {};
    if (filters.name) params.name = filters.name;
    if (filters.address) params.address = filters.address;
    const res = await api.get('/stores', { params });
    setStores(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleRate = async (storeId, rating) => {
    setSavingId(storeId);
    try {
      await api.post('/ratings', { storeId, rating });
      setStores((prev) =>
        prev.map((s) => (s.id === storeId ? { ...s, myRating: rating } : s)),
      );
      // Refresh to pick up the new overall average for this store
      fetchStores();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="page-shell max-w-5xl">
      <p className="eyebrow">Discover and rate</p>
      <h1 className="font-display text-3xl font-bold text-ink mt-2 mb-1">Stores</h1>
      <p className="text-slate-400 text-sm mb-6">Search stores and submit or update your rating.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchStores();
        }}
        className="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 card-glow animate-fade-in-up"
      >
        <input
          className="input-field"
          placeholder="Search by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="Search by address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
        <button type="submit" className="btn-secondary">
          Search
        </button>
      </form>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-6 w-2/3 mb-3" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">No stores match your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stores.map((store, i) => (
            <div key={store.id} className="card p-5 surface-hover card-glow animate-fade-in-up"
                 style={{ animationDelay: `${i * 0.08}s` }}>
              <h3 className="font-display font-semibold text-ink text-lg">{store.name}</h3>
              <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">{store.address}</p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-slate-500">Overall rating</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating value={Math.round(store.overallRating || 0)} readOnly size="sm" />
                    <span className="text-sm text-slate-400">{store.overallRating ?? 'No ratings'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    {store.myRating ? 'Your rating' : 'Rate this store'}
                  </p>
                  <div className="mt-0.5">
                    <StarRating
                      value={store.myRating || 0}
                      onChange={(val) => handleRate(store.id, val)}
                      readOnly={savingId === store.id}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
