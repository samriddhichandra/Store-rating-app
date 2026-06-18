import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// ── Image sources ──
const images = [
  '/c-e-un-dipinto-ad-acquerello-di-una-libreria-con-libri-in-mostra-ai-generativi_958124-38005.avif',
  '/c19731b53c08b6c289a37326ce4ed158.jpg',
  '/illustrated-cozy-bookstore-storefront-brick-600nw-2713880273.webp',
  '/images.jpg',
  '/quirky-illustration-whimsical-coffee-shop-vintage-aesthetic-building-features-red-white-striped-awning-large-370537600.webp',
];

// ── Collage groups: each group clusters images together ──
// Each group has a position, and images within the group are positioned relative to it
const collageGroups = [
  {
    // Top-left cluster
    top: 3, left: 2,
    items: [
      { size: 180, top: 0, left: 0, index: 0 },
      { size: 130, top: 80, left: 140, index: 1 },
    ],
  },
  {
    // Right cluster
    top: 10, left: 72,
    items: [
      { size: 160, top: 0, left: 0, index: 2 },
      { size: 120, top: 120, left: -40, index: 3 },
    ],
  },
  {
    // Bottom-left cluster
    top: 55, left: 8,
    items: [
      { size: 140, top: 0, left: 0, index: 1 },
      { size: 110, top: 90, left: 100, index: 4 },
    ],
  },
  {
    // Bottom-right cluster
    top: 50, left: 78,
    items: [
      { size: 150, top: 0, left: 0, index: 3 },
      { size: 100, top: 110, left: 80, index: 0 },
    ],
  },
  {
    // Center-left scattered
    top: 35, left: 3,
    items: [
      { size: 100, top: 0, left: 0, index: 4 },
    ],
  },
  {
    // Mid-right
    top: 38, left: 70,
    items: [
      { size: 95, top: 0, left: 0, index: 2 },
    ],
  },
];

// Generate deterministic per-image properties
function seeded(seed) {
  const s = (seed * 9301 + 49297) % 233280;
  return s / 233280;
}

const imageProps = images.map((src, i) => {
  const s = seeded(i * 137 + 42);
  return {
    src,
    rotate: -12 + seeded(i * 51 + 99) * 24,
    animationType: i % 2 === 0 ? 'collageFloat1' : 'collageFloat2',
    duration: 14 + s * 8,
    delay: i * 0.8,
    zOffset: Math.floor(s * 4),
    scale: 0.88 + s * 0.24,
    borderHue: i,
  };
});

// ── Floating particles ──
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  size: 2 + seeded(i * 7) * 4,
  left: seeded(i * 13) * 100,
  duration: 10 + seeded(i * 3) * 14,
  delay: seeded(i * 5) * 20,
  hue: seeded(i * 11) > 0.5 ? 'cyan' : 'amber',
}));

// ── SVG decorative illustrations ──
const IllustrationSparkle = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const IllustrationChart = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const IllustrationGlobe = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const IllustrationHeart = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

// ── Larger hero illustrations ──
const HeroStoreIllustration = () => (
  <svg className="w-32 h-32 sm:w-40 sm:h-40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="80" width="120" height="90" rx="8" fill="currentColor" opacity="0.1" />
    <rect x="50" y="90" width="40" height="50" rx="4" fill="currentColor" opacity="0.2" />
    <rect x="100" y="90" width="40" height="50" rx="4" fill="currentColor" opacity="0.15" />
    <path d="M70 90L85 70L100 90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <circle cx="85" cy="65" r="4" fill="currentColor" opacity="0.5" />
    <rect x="60" y="140" width="20" height="30" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="120" y="140" width="20" height="30" rx="2" fill="currentColor" opacity="0.15" />
    <circle cx="150" cy="50" r="15" fill="currentColor" opacity="0.1" />
    <path d="M145 50L150 55L155 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
  </svg>
);

const HeroRatingIllustration = () => (
  <svg className="w-28 h-28 sm:w-36 sm:h-36" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="60" fill="currentColor" opacity="0.08" />
    <path d="M100 60L115 85H140L120 100L128 125L100 110L72 125L80 100L60 85H85L100 60Z" fill="currentColor" stroke="currentColor" strokeWidth="2" opacity="0.4" />
    <circle cx="100" cy="100" r="8" fill="currentColor" opacity="0.3" />
    <path d="M100 92V108M92 100H108" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const HeroUsersIllustration = () => (
  <svg className="w-24 h-24 sm:w-32 sm:h-32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="70" cy="80" r="25" fill="currentColor" opacity="0.15" />
    <path d="M45 140C45 115 55 105 70 105C85 105 95 115 95 140" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
    <circle cx="130" cy="70" r="22" fill="currentColor" opacity="0.12" />
    <path d="M108 135C108 112 117 103 130 103C143 103 152 112 152 135" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
    <circle cx="100" cy="50" r="18" fill="currentColor" opacity="0.1" />
    <path d="M82 95C82 76 90 68 100 68C110 68 118 76 118 95" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.2" />
  </svg>
);

  const illustrationStyles = [
    { icon: <IllustrationSparkle />, color: 'from-cyan-400/20 to-cyan-500/10', size: 'w-12 h-12' },
    { icon: <IllustrationChart />, color: 'from-amber-400/20 to-amber-500/10', size: 'w-12 h-12' },
    { icon: <IllustrationGlobe />, color: 'from-cyan-400/20 to-cyan-500/10', size: 'w-12 h-12' },
    { icon: <IllustrationHeart />, color: 'from-amber-400/20 to-amber-500/10', size: 'w-12 h-12' },
  ];

  const heroIllustrations = [
    { Component: HeroStoreIllustration, top: '15%', left: '5%', delay: '0s', hue: 'cyan' },
    { Component: HeroRatingIllustration, top: '60%', left: '85%', delay: '2s', hue: 'amber' },
    { Component: HeroUsersIllustration, top: '70%', left: '10%', delay: '4s', hue: 'cyan' },
  ];

// ── SVG mini-icons for feature highlights ──
const featureIcons = {
  rate: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  insights: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  dashboard: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  ),
  shield: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
};

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [loaded, setLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  // If user is already logged in, redirect to their dashboard
  useEffect(() => {
    if (user) {
      const roleHome = {
        ADMIN: '/admin',
        NORMAL_USER: '/stores',
        STORE_OWNER: '/owner',
      };
      navigate(roleHome[user.role] || '/login', { replace: true });
    }
  }, [user, navigate]);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const parallaxX = (mousePos.x - 0.5) * 40;
  const parallaxY = (mousePos.y - 0.5) * 40;

  const isLight = theme === 'light';

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper" ref={containerRef}>
      {/* ── Background gradient orbs ── */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent blur-3xl"
          style={{ animation: 'float 20s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-amber-500/10 via-transparent to-transparent blur-3xl"
          style={{ animation: 'float 25s ease-in-out 5s infinite' }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-gradient-to-bl from-cyan-400/8 via-transparent to-transparent blur-3xl"
          style={{ animation: 'float 18s ease-in-out 10s infinite' }}
        />
      </div>

      {/* ── Drift particles ── */}
      <div className="fixed inset-0 z-[1] pointer-events-none" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full animate-particle"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              bottom: '-10px',
              '--dur': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              background: p.hue === 'cyan'
                ? 'radial-gradient(circle, rgba(34, 211, 238, 0.4), transparent 70%)'
                : 'radial-gradient(circle, rgba(245, 158, 11, 0.3), transparent 70%)',
              boxShadow: p.hue === 'cyan'
                ? '0 0 6px rgba(34, 211, 238, 0.2)'
                : '0 0 6px rgba(245, 158, 11, 0.15)',
            }}
          />
        ))}
      </div>

      {/* ── Larger hero illustrations ── */}
      <div className="fixed inset-0 z-[2] pointer-events-none" aria-hidden="true">
        {heroIllustrations.map((ill, i) => (
          <div
            key={`hero-${i}`}
            className="absolute animate-float-drift"
            style={{
              top: ill.top,
              left: ill.left,
              animationDelay: ill.delay,
              animationDuration: `${18 + i * 4}s`,
              opacity: 0.12,
              color: ill.hue === 'cyan' ? (isLight ? '#b45309' : '#22d3ee') : (isLight ? '#d97706' : '#f59e0b'),
            }}
          >
            <ill.Component />
          </div>
        ))}
      </div>

      {/* ── Decorative illustration badges floating around ── */}
      <div className="fixed inset-0 z-[2] pointer-events-none" aria-hidden="true">
        {illustrationStyles.map((ill, i) => {
          const x = 10 + (i * 23) % 80;
          const y = 8 + (i * 17) % 80;
          return (
            <div
              key={i}
              className="absolute animate-float-drift"
              style={{
                top: `${y}%`,
                left: `${x}%`,
                animationDelay: `${i * 3}s`,
                animationDuration: `${14 + i * 3}s`,
                opacity: 0.2 + i * 0.04,
              }}
            >
              <div className={`${ill.size} rounded-2xl bg-gradient-to-br ${ill.color} flex items-center justify-center backdrop-blur-sm border border-white/10`}
                style={{ color: isLight ? '#d97706' : '#67e8f9' }}
              >
                {ill.icon}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Dynamic collage groups ── */}
      <div className="fixed inset-0 z-[3] pointer-events-none" aria-hidden="true">
        {collageGroups.map((group, gi) => {
          const groupParallaxX = parallaxX * (0.6 + (gi % 3) * 0.2);
          const groupParallaxY = parallaxY * (0.6 + (gi % 2) * 0.3);

          return (
            <div
              key={gi}
              className="absolute"
              style={{
                top: `${group.top}%`,
                left: `${group.left}%`,
                transform: `translate(${groupParallaxX}px, ${groupParallaxY}px)`,
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {group.items.map((item, ii) => {
                const props = imageProps[item.index];
                const opacity = loaded
                  ? 0.25 + ((gi + ii) % 3) * 0.12 + (gi < 2 ? 0.08 : 0)
                  : 0;
                return (
                  <div
                    key={ii}
                    className={`absolute rounded-2xl overflow-hidden shadow-2xl animate-border-glow`}
                    style={{
                      top: `${item.top}px`,
                      left: `${item.left}px`,
                      width: `${item.size}px`,
                      height: `${item.size * 0.68}px`,
                      opacity,
                      transform: `rotate(${props.rotate}deg) scale(${props.scale})`,
                      animation: `${props.animationType} ${props.duration}s ease-in-out ${props.delay + gi * 0.3}s infinite`,
                      zIndex: props.zOffset,
                      transition: 'opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      border: '1px solid rgba(103, 232, 249, 0.08)',
                      filter: `brightness(${0.7 + (gi * 0.04)}) saturate(${0.6 + (gi * 0.06)})`,
                    }}
                  >
                    <img
                      src={props.src}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onLoad={() => setImagesLoaded((c) => c + 1)}
                      onError={(e) => {
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                    {/* Theme-aware image overlays */}
                    <div className={`absolute inset-0 ${
                      isLight
                        ? 'bg-gradient-to-tr from-amber-900/10 via-transparent to-amber-900/5'
                        : 'bg-gradient-to-tr from-slate-900/60 via-transparent to-slate-900/30'
                    }`} />
                    <div className={`absolute inset-0 ${
                      isLight
                        ? 'bg-gradient-to-b from-transparent via-transparent to-amber-900/10'
                        : 'bg-gradient-to-b from-transparent via-transparent to-slate-900/40'
                    }`} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── Content overlay ── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* ── Theme Toggle Button (top-right) ── */}
        <div className="fixed top-6 right-6 z-20">
          <button
            onClick={toggleTheme}
            className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 backdrop-blur-md"
            style={{
              background: isLight
                ? 'rgba(217, 119, 6, 0.10)'
                : 'rgba(255, 255, 255, 0.06)',
              color: isLight ? '#d97706' : '#fbbf24',
              border: isLight
                ? '1px solid rgba(217, 119, 6, 0.20)'
                : '1px solid rgba(255, 255, 255, 0.10)',
            }}
            aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            title={isLight ? 'Dark mode' : 'Light mode'}
          >
            {isLight ? (
              /* Moon icon for switching to dark */
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
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
            )}
          </button>
        </div>

        <div
          className={`transition-all duration-1200 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          style={{ transitionDuration: '1.2s' }}
        >


          {/* Title */}
          <h1 className="font-display text-5xl sm:text-7xl font-bold leading-tight animate-title-glow"
            style={{ color: 'var(--color-ink)' }}
          >
            Store<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-300 light:from-amber-500 light:via-yellow-500 light:to-amber-400">Pulse</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed font-light"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Discover. Rate. Elevate. The smart way to explore stores, share feedback, and make every visit count.
          </p>

          {/* Feature highlights — no emojis, using SVGs */}
          <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-xl mx-auto">
            {[
              { icon: featureIcons.rate, label: 'Rate Stores' },
              { icon: featureIcons.insights, label: 'Live Insights' },
              { icon: featureIcons.shield, label: 'Owner Dashboard' },
              { icon: featureIcons.dashboard, label: 'Admin Control' },
            ].map((f, i) => (
              <div
                key={f.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm backdrop-blur-sm transition-all duration-300 hover:scale-105"
                style={{
                  background: isLight
                    ? 'rgba(217, 119, 6, 0.08)'
                    : 'rgba(255, 255, 255, 0.06)',
                  border: isLight
                    ? '1px solid rgba(217, 119, 6, 0.15)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isLight ? '#78350f' : '#cbd5e1',
                  animation: `reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.4 + i * 0.12}s forwards`,
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isLight
                    ? 'rgba(217, 119, 6, 0.15)'
                    : 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = isLight
                    ? 'rgba(217, 119, 6, 0.4)'
                    : 'rgba(103, 232, 249, 0.3)';
                  if (isLight) e.currentTarget.style.color = '#92400e';
                  else e.currentTarget.style.color = '#67e8f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isLight
                    ? 'rgba(217, 119, 6, 0.08)'
                    : 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = isLight
                    ? '1px solid rgba(217, 119, 6, 0.15)'
                    : '1px solid rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = isLight ? '#78350f' : '#cbd5e1';
                }}
              >
                <span className={isLight ? 'text-amber-600/80' : 'text-cyan-400/80'}>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="btn-primary text-lg px-10 py-3.5 rounded-xl shadow-2xl shadow-cyan-500/20 hover:shadow-amber-500/25"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="btn-secondary text-lg px-10 py-3.5 rounded-xl"
            >
              Create Account
            </button>
          </div>

          {/* Status indicator */}
          <p className="mt-6 text-xs flex items-center justify-center gap-2"
            style={{ color: isLight ? 'rgba(120, 90, 40, 0.6)' : 'rgba(148, 163, 184, 0.8)' }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Platform ready &middot; Start exploring
          </p>
        </div>
      </div>

      {/* ── Bottom gradient fade ── */}
      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-paper to-transparent z-[3] pointer-events-none" />
    </div>
  );
}