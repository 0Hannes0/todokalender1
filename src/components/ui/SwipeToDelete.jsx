import { useRef, useState } from 'react'

const THRESHOLD = 72 // px to swipe before delete reveals

export function SwipeToDelete({ onDelete, children }) {
  const [offset, setOffset] = useState(0)
  const [swiped, setSwiped] = useState(false)
  const startX = useRef(null)
  const startY = useRef(null)
  const tracking = useRef(false)

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    tracking.current = true
  }

  function onTouchMove(e) {
    if (!tracking.current) return
    const dx = e.touches[0].clientX - startX.current
    const dy = Math.abs(e.touches[0].clientY - startY.current)
    // Cancel if scrolling vertically
    if (dy > 10 && Math.abs(dx) < dy) { tracking.current = false; return }
    if (dx > 0) { setOffset(0); return } // no right swipe
    const clamped = Math.max(-THRESHOLD - 20, dx)
    setOffset(clamped)
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
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete button behind */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 rounded-xl"
        style={{ width: THRESHOLD }}>
        <button onClick={() => { close(); onDelete() }}
          className="w-full h-full flex items-center justify-center focus:outline-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Swipeable content */}
      <div
        className="relative z-10 transition-transform"
        style={{ transform: `translateX(${offset}px)`, transitionDuration: tracking.current ? '0ms' : '200ms' }}
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
