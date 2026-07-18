import { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

export function Modal({ onClose, children, title }) {
  const overlayRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    const focusable = overlayRef.current?.querySelectorAll(
      'button, input, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable?.length) focusable[0].focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab' && focusable?.length) {
        const first = focusable[0], last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [onClose])

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Sheet — full-width bottom sheet on mobile, floating card on sm+ */}
      <div
        ref={overlayRef}
        className="
          relative z-10 w-full bg-surface overflow-hidden
          rounded-t-2xl sm:rounded-2xl
          shadow-2xl border border-border
          sm:w-auto sm:min-w-[440px] sm:max-w-lg sm:mx-4
          animate-sheet-up sm:animate-slide-up
          max-h-[90dvh] flex flex-col
        "
      >
        {/* Drag handle — mobile only */}
        <div className="flex sm:hidden justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border-2" />
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
