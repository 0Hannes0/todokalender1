/**
 * StarDisplayRow — renders N filled stars, optional half star, and empty stars up to max.
 * Uses SVG paths with currentColor so color is controlled via Tailwind text-* classes.
 *
 * Props:
 *   stars    {number}  - e.g. 6.5
 *   max      {number}  - e.g. 7 (default)
 *   size     {number}  - icon size in px (default 18)
 *   className {string} - extra classes on the wrapper
 */
export function StarDisplayRow({ stars = 0, max = 7, size = 18, className = '' }) {
  const filled = Math.floor(stars)
  const hasHalf = (stars - filled) >= 0.5
  const empty = max - filled - (hasHalf ? 1 : 0)

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: filled }).map((_, i) => (
        <StarIcon key={`f${i}`} type="full" size={size} />
      ))}
      {hasHalf && <StarIcon type="half" size={size} />}
      {Array.from({ length: Math.max(0, empty) }).map((_, i) => (
        <StarIcon key={`e${i}`} type="empty" size={size} />
      ))}
    </div>
  )
}

function StarIcon({ type, size }) {
  const s = size
  // Star path centered in viewBox 0 0 24 24
  const path = "M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.2L12 16.9l-6.2 4 2.4-7.2L2 9.2h7.6L12 2z"

  if (type === 'full') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
      </svg>
    )
  }

  if (type === 'half') {
    const clipId = `half-${Math.random().toString(36).slice(2)}`
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
        {/* Empty star outline */}
        <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        {/* Filled left half */}
        <path d={path} fill="currentColor" clipPath={`url(#${clipId})`} />
      </svg>
    )
  }

  // empty
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d={path} stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
    </svg>
  )
}
