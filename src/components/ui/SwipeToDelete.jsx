import { useRef, useState } from 'react'

const THRESHOLD = 72

export function SwipeToDelete({ onDelete, children }) {
  const [offset, setOffset] = useState(0)
  const [swiped, setSwiped] = useState(false)
  const startX = useRef(null)
  const startY = useRef(null)
  const tracking = useRef(false)
  const moved = useRef(false)

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    tracking.current = true
    moved.current = false
  }

  function onTouchMove(e) {
    if (!tracking.current) return
    const dx = e.touches[0].clientX - startX.current
    const dy = Math.abs(e.touches[0].clientY - startY.current)
    if (dy > 10 && Math.abs(dx) < dy) { tracking.current = false; return }
    if (dx > 0) { setOffset(0); return }
    moved.current = true
    setOffset(Math.max(-THRESHOLD - 20, dx))
  }

  function onTouchEnd() {
    tracking.current = false
    if (offset < -THRESHOLD / 2) {
      setOffset(-THRESHOLD)
      setSwiped(true)
    } else {
      setOffset(0)
      setSwiped(false)
    }
  }

  function close() {
    setOffset(0)
    setSwiped(false)
  }

  return (
    <div className="relative" style={{ isolation: 'isolate' }}>
      {/* Delete button — only visible when swiped */}
      {swiped && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 rounded-xl z-0"
          style={{ width: THRESHOLD }}
        >
          <button
            onClick={() => { close(); onDelete() }}
            className="w-full h-full flex items-center justify-center focus:outline-none"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Swipeable content */}
      <div
        className="relative z-10"
        style={{
          transform: `translateX(${offset}px)`,
          transition: tracking.current ? 'none' : 'transform 200ms ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={swiped ? close : undefined}
      >
        {children}
      </div>
    </div>
  )
}
