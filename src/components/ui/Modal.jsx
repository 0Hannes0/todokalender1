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
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div
        ref={overlayRef}
        className="relative z-10 w-full sm:w-auto sm:min-w-[420px] sm:max-w-lg mx-4 mb-4 sm:mb-0 rounded-2xl overflow-hidden animate-slide-up border border-border shadow-2xl shadow-bg"
        style={{ background: 'linear-gradient(145deg, #2e1820 0%, #231219 100%)' }}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}
