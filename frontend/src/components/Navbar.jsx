import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ROLE_LABEL = {
  ADMIN: 'System Administrator',
  NORMAL_USER: 'User',
  STORE_OWNER: 'Store Owner',
};

const NAV_BY_ROLE = {
  ADMIN: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/stores', label: 'Stores' },
  ],
  NORMAL_USER: [{ to: '/stores', label: 'Stores' }],
  STORE_OWNER: [{ to: '/owner', label: 'Dashboard' }],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;
  const links = NAV_BY_ROLE[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-xl animate-fade-in transition-colors duration-300"
      style={{
        borderColor: 'var(--nav-border)',
        background: 'var(--nav-bg)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <nav className="hidden sm:flex items-center gap-1">
            {links.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                style={{ animationDelay: `${i * 0.05}s` }}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/15 text-primary-light shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                      : 'text-white/65 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90"
            style={{
              background: theme === 'dark'
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(217, 119, 6, 0.10)',
              color: theme === 'dark' ? '#fbbf24' : '#d97706',
            }}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              /* Sun icon for switching to light */
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              /* Moon icon for switching to dark */
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <div className="text-right hidden sm:block animate-fade-in">
            <p className="text-sm font-medium leading-tight transition-colors duration-300"
              style={{ color: 'var(--color-ink)' }}
            >
              {user.name}
            </p>
            <p className="text-xs leading-tight transition-colors duration-300"
              style={{ color: 'var(--color-primary)' }}
            >
              {ROLE_LABEL[user.role]}
            </p>
          </div>
          <NavLink
            to="/update-password"
            className="text-sm px-2 py-1.5 rounded-md transition-all duration-200 hover:bg-white/5"
            style={{
              color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(120, 90, 40, 0.7)',
            }}
            title="Update password"
          >
            Password
          </NavLink>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold px-3 py-1.5 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: theme === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(217, 119, 6, 0.12)',
              color: theme === 'dark' ? '#fff' : '#78350f',
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}