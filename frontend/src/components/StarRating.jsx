import { useState } from 'react';

/**
 * Signature rating control. In read-only mode it renders a filled/outline
 * star strip with the numeric average. In interactive mode it lets a
 * normal user click 1-5 to submit/modify their rating.
 */
export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value || 0;
  const dims = size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            onClick={() => !readOnly && onChange?.(star)}
            className={readOnly ? 'cursor-default' : 'cursor-pointer transition-transform hover:scale-110'}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <svg
              viewBox="0 0 24 24"
              className={dims}
              fill={filled ? '#F59E0B' : 'rgba(15, 23, 42, 0.35)'}
              stroke={filled ? '#FDE68A' : 'rgba(148, 163, 184, 0.58)'}
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L12 16.9l-5.2 2.6.99-5.78-4.21-4.1 5.82-.85L12 3.5z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
