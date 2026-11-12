import { useEffect, useRef, useState } from 'react'

const CLOSE_MS = 250

/**
 * Animated bottom sheet with a drag handle. `children` may be a function that
 * receives `close` (animates out, then calls onClose).
 */
export default function BottomSheet({ label, title, onClose, children }) {
  const [entered, setEntered] = useState(false)
  const [closing, setClosing] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const drag = useRef({ startY: 0, lastY: 0, lastT: 0, v: 0 })

  useEffect(() => {
    let r2
    const r1 = requestAnimationFrame(() => (r2 = requestAnimationFrame(() => setEntered(true))))
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
      document.body.style.overflow = prev
    }
  }, [])

  const close = () => {
    if (closing) return
    setClosing(true)
    setDragY(0)
    setTimeout(onClose, CLOSE_MS)
  }

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // swipe-down on the handle / header
  const onDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = { startY: e.clientY, lastY: e.clientY, lastT: e.timeStamp, v: 0 }
    setDragging(true)
  }
  const onMove = (e) => {
    if (!dragging) return
    const d = drag.current
    const dt = e.timeStamp - d.lastT
    if (dt > 0) d.v = (e.clientY - d.lastY) / dt
    d.lastY = e.clientY
    d.lastT = e.timeStamp
    setDragY(Math.max(0, e.clientY - d.startY))
  }
  const onUp = () => {
    if (!dragging) return
    setDragging(false)
    if (dragY > 100 || drag.current.v > 0.6) close()
    else setDragY(0)
  }

  const visible = entered && !closing
  const panelStyle = dragging || dragY ? { transform: `translateY(${dragY}px)` } : undefined

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={label}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        style={panelStyle}
        className={`relative max-h-[92dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-canvas px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl ${
          dragging ? '' : 'transition-transform duration-250 ease-out'
        } ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{ touchAction: 'none' }}
          className="-mx-5 cursor-grab px-5 pt-3 pb-1"
        >
          <div className="mx-auto h-1.5 w-11 rounded-full bg-handle" />
          <h2 className="pt-4 pb-3 text-[28px] leading-tight font-extrabold tracking-tight">{title}</h2>
        </div>
        {typeof children === 'function' ? children(close) : children}
      </div>
    </div>
  )
}
