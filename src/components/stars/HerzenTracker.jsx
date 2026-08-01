/**
 * HerzenTracker — shows earned ❤️ hearts with a /10 threshold marker.
 *
 * Props:
 *   hearts  {number} - hearts earned this month
 *   max     {number} - threshold for reward (default 10)
 */
export function HerzenTracker({ hearts = 0, max = 10 }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-text-3 font-medium">Herzen</span>
      <div className="flex items-center gap-0.5 flex-wrap">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={`text-base leading-none transition-opacity ${i < hearts ? 'opacity-100' : 'opacity-20'}`}
          >
            ❤️
          </span>
        ))}
        {hearts > max && (
          <span className="text-xs text-accent font-semibold ml-1">+{hearts - max}</span>
        )}
      </div>
      <span className="text-xs text-text-3">{hearts}/{max}</span>
      {hearts >= max && (
        <span className="text-xs font-medium text-accent">🎁 Überraschung!</span>
      )}
    </div>
  )
}
