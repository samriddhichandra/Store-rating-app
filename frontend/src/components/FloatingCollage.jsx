/**
 * Floating collage of store-themed images that float, rotate, and parallax
 * to create a dynamic, visually rich background atmosphere.
 * Enhanced with theme-aware overlays, smoother animations, and decorative glows.
 */
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const images = [
  '/c-e-un-dipinto-ad-acquerello-di-una-libreria-con-libri-in-mostra-ai-generativi_958124-38005.avif',
  '/c19731b53c08b6c289a37326ce4ed158.jpg',
  '/illustrated-cozy-bookstore-storefront-brick-600nw-2713880273.webp',
  '/images.jpg',
  '/quirky-illustration-whimsical-coffee-shop-vintage-aesthetic-building-features-red-white-striped-awning-large-370537600.webp',
];

/**
 * Returns deterministic pseudo-random values from a seed so that placements
 * stay stable across renders.
 */
function seeded(seed) {
  const s = (seed * 9301 + 49297) % 233280;
  return s / 233280;
}

const placements = images.map((src, i) => {
  const s = seeded(i * 137 + 42);
  const s2 = seeded(i * 73 + 11);
  const s3 = seeded(i * 51 + 99);

  const top = 5 + s * 85; // 5-90 %
  const left = s2 * 92; // 0-92 %
  const size = 80 + s3 * 160; // 80-240 px
  const delay = i * 1.2;
  const duration = 12 + s * 8; // 12-20 s
  const rotate = -15 + s3 * 30; // -15° to 15°
  const zIndex = Math.floor(s * 5);
  const scale = 0.85 + s * 0.25;

  return { src, top, left, size, delay, duration, rotate, zIndex, scale };
});

export default function FloatingCollage({ page = 'login' }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [loaded, setLoaded] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  // Different layout densities per page
  const visible = page === 'login' ? placements : placements.slice(0, 3);

  const parallaxIntensity = page === 'login' ? 25 : 15;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {visible.map((p, i) => {
        const offsetX = (mousePos.x - 0.5) * parallaxIntensity;
        const offsetY = (mousePos.y - 0.5) * parallaxIntensity;
        const opacity = loaded
          ? 0.25 + (i % 3) * 0.15 + (i < 2 ? 0.08 : 0)
          : 0;

        return (
          <div
            key={p.src}
            className="absolute rounded-2xl overflow-hidden shadow-2xl animate-border-glow"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 0.72}px`,
              transform: `translate(${offsetX}px, ${offsetY}px) rotate(${p.rotate}deg) scale(${p.scale})`,
              animation: `collageFloat${(i % 2) + 1} ${p.duration}s ease-in-out ${p.delay}s infinite`,
              zIndex: p.zIndex,
              opacity,
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1s ease',
              border: isLight
                ? '1px solid rgba(217, 119, 6, 0.10)'
                : '1px solid rgba(103, 232, 249, 0.08)',
              filter: `brightness(${0.65 + (i * 0.05)}) saturate(${0.5 + (i * 0.08)})`,
            }}
          >
            <img
              src={p.src}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={(e) => {
                e.target.parentElement.style.display = 'none';
              }}
            />
            {/* Theme-aware image overlays */}
            <div className={`absolute inset-0 ${
              isLight
                ? 'bg-gradient-to-tr from-amber-900/15 via-transparent to-amber-900/8'
                : 'bg-gradient-to-tr from-slate-900/50 via-transparent to-slate-900/25'
            }`} />
            <div className={`absolute inset-0 ${
              isLight
                ? 'bg-gradient-to-b from-transparent via-transparent to-amber-900/12'
                : 'bg-gradient-to-b from-transparent via-transparent to-slate-900/35'
            }`} />
            {/* Subtle color accent overlay */}
            <div className={`absolute inset-0 ${
              isLight
                ? 'bg-gradient-to-r from-transparent via-amber-50/5 to-transparent'
                : 'bg-gradient-to-r from-transparent via-cyan-900/10 to-transparent'
            }`} />
          </div>
        );
      })}
    </div>
  );
}
