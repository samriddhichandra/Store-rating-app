/**
 * BackgroundEffects — Adds grid patterns, noise texture, floating decorative
 * shapes, and ambient glow orbs to create a rich, premium atmosphere.
 * Place this once at the top-level App layout.
 */
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

// ── Seeded pseudo-random (deterministic across renders) ──
function seeded(seed) {
  const s = (seed * 9301 + 49297) % 233280;
  return s / 233280;
}

// ── Decorative floating shapes ──
const shapes = Array.from({ length: 8 }, (_, i) => {
  const s = seeded(i * 31 + 7);
  const s2 = seeded(i * 53 + 11);
  const s3 = seeded(i * 71 + 19);
  const type = i % 4; // 0=circle, 1=diamond, 2=ring, 3=hex
  const size = 40 + s * 110;
  return {
    id: i,
    type,
    size,
    top: 5 + s * 85,
    left: s2 * 90,
    delay: i * 2.5,
    duration: 15 + s3 * 15,
    rotation: s3 * 360,
    hue: i % 2 === 0 ? 'cyan' : 'amber',
    opacity: 0.06 + s * 0.08,
    zIndex: Math.floor(s * 3),
  };
});

// ── Glow orbs ──
const glowOrbs = [
  { top: 15, left: 10, size: 350, hue: 'cyan', delay: 0 },
  { top: 70, left: 80, size: 280, hue: 'amber', delay: 4 },
  { top: 45, left: 50, size: 200, hue: 'cyan', delay: 8 },
  { top: 10, left: 75, size: 180, hue: 'amber', delay: 2 },
  { top: 80, left: 15, size: 220, hue: 'cyan', delay: 6 },
];

export default function BackgroundEffects() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <>
      {/* ── Grid pattern base layer ── */}
      <div
        className={`fixed inset-0 z-0 pointer-events-none bg-grid-gradient ${isLight ? 'animate-grid-pulse' : ''}`}
        aria-hidden="true"
      />

      {/* ── Dot grid overlay ── */}
      <div
        className={`fixed inset-0 z-[1] pointer-events-none bg-dot-grid ${isLight ? 'animate-grid-pulse' : ''}`}
        style={{ animationDelay: '2s' }}
        aria-hidden="true"
      />

      {/* ── Diagonal grid accent ── */}
      <div
        className={`fixed inset-0 z-[1] pointer-events-none ${isLight ? 'opacity-40' : 'opacity-20'}`}
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 60px,
              var(--grid-color-accent) 60px,
              var(--grid-color-accent) 61px
            )
          `,
        }}
        aria-hidden="true"
      />

      {/* ── Glow orbs behind everything ── */}
      <div className="fixed inset-0 z-[1] pointer-events-none" aria-hidden="true">
        {glowOrbs.map((orb, i) => (
          <div
            key={i}
            className="glow-orb animate-glow-pulse"
            style={{
              top: `${orb.top}%`,
              left: `${orb.left}%`,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              background: orb.hue === 'cyan'
                ? isLight
                  ? 'radial-gradient(circle, rgba(245, 158, 11, 0.06), transparent 70%)'
                  : 'radial-gradient(circle, rgba(34, 211, 238, 0.08), transparent 70%)'
                : isLight
                  ? 'radial-gradient(circle, rgba(217, 119, 6, 0.05), transparent 70%)'
                  : 'radial-gradient(circle, rgba(245, 158, 11, 0.06), transparent 70%)',
              animationDelay: `${orb.delay}s`,
              animationDuration: `${6 + (i % 3) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* ── Decorative floating shapes ── */}
      <div className="fixed inset-0 z-[2] pointer-events-none" aria-hidden="true">
        {shapes.map((shape) => {
          const isCyan = shape.hue === 'cyan';
          const borderColor = isLight
            ? isCyan ? 'rgba(217, 119, 6, 0.15)' : 'rgba(180, 83, 9, 0.12)'
            : isCyan ? 'rgba(34, 211, 238, 0.12)' : 'rgba(245, 158, 11, 0.1)';
          const bgColor = isLight
            ? isCyan ? 'rgba(217, 119, 6, 0.04)' : 'rgba(180, 83, 9, 0.03)'
            : isCyan ? 'rgba(34, 211, 238, 0.04)' : 'rgba(245, 158, 11, 0.03)';

          return (
            <div
              key={shape.id}
              className="deco-shape"
              style={{
                top: `${shape.top}%`,
                left: `${shape.left}%`,
                width: `${shape.size}px`,
                height: `${shape.size}px`,
                opacity: shape.opacity,
                zIndex: shape.zIndex,
                animation: `floatDrift ${shape.duration}s ease-in-out ${shape.delay}s infinite`,
              }}
            >
              {shape.type === 0 && (
                // Circle
                <div
                  className="w-full h-full rounded-full border animate-morph-circle"
                  style={{
                    borderColor,
                    background: bgColor,
                  }}
                />
              )}
              {shape.type === 1 && (
                // Diamond
                <div
                  className="w-full h-full border animate-morph-diamond"
                  style={{
                    borderColor,
                    background: bgColor,
                    transformOrigin: 'center',
                  }}
                />
              )}
              {shape.type === 2 && (
                // Ring (double circle)
                <div className="relative w-full h-full flex items-center justify-center">
                  <div
                    className="absolute rounded-full border animate-spin-slow"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderColor,
                      borderWidth: '2px',
                      borderStyle: 'solid',
                    }}
                  />
                  <div
                    className="absolute rounded-full border animate-spin-slow-reverse"
                    style={{
                      width: '65%',
                      height: '65%',
                      borderColor: isCyan ? 'rgba(34, 211, 238, 0.08)' : 'rgba(245, 158, 11, 0.07)',
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                    }}
                  />
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: '20%',
                      height: '20%',
                      background: borderColor,
                    }}
                  />
                </div>
              )}
              {shape.type === 3 && (
                // Hexagon-like (rounded rect with rotation)
                <div
                  className="w-full h-full border animate-tilt"
                  style={{
                    borderColor,
                    background: bgColor,
                    borderRadius: '30%',
                    transform: `rotate(${shape.rotation}deg)`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Ripple rings that pulse outward occasionally ── */}
      <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={`ripple-${i}`}
            className="absolute rounded-full border animate-ripple"
            style={{
              top: `${20 + i * 25}%`,
              left: `${15 + i * 30}%`,
              width: `${60 + i * 40}px`,
              height: `${60 + i * 40}px`,
              borderColor: isLight
                ? 'rgba(217, 119, 6, 0.08)'
                : 'rgba(34, 211, 238, 0.06)',
              animationDelay: `${i * 4}s`,
            }}
          />
        ))}
      </div>

      {/* ── Noise texture overlay ── */}
      <div className="noise-overlay" aria-hidden="true" />
    </>
  );
}