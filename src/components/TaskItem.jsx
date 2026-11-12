import { useRef, useState } from 'react'
import { ClockIcon, TrashIcon } from './icons'
import { formatDateHeading, formatTime } from '../lib/dates'

const REVEAL = 88 // px of the delete action revealed by a swipe

function Checkbox({ done, onToggle, title }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={`${done ? 'Mark as not done' : 'Mark as done'}: ${title}`}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className="-m-2 flex size-11 shrink-0 items-center justify-center"
    >
      <span
        className={`flex size-6 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
          done ? 'scale-100 border-primary bg-primary' : 'border-[#cfc8d8] bg-white'
        }`}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: done ? 0 : 24,
              transition: 'stroke-dashoffset 0.25s ease-out',
            }}
          />
        </svg>
      </span>
    </button>
  )
}

export default function TaskItem({ task, overdue = false, todayISO, leaving = false, onToggle, onEdit, onDelete }) {
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const g = useRef({ x: 0, y: 0, base: 0, mode: null, moved: false })

  const showDate = task.date && task.date !== todayISO
  const rowBg = overdue ? 'bg-peach' : 'bg-canvas'

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    g.current = { x: e.clientX, y: e.clientY, base: dx, mode: null, moved: false }
  }
  const onPointerMove = (e) => {
    const s = g.current
    if (s.mode === 'v') return
    const mx = e.clientX - s.x
    const my = e.clientY - s.y
    if (!s.mode) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return
      s.mode = Math.abs(mx) > Math.abs(my) ? 'h' : 'v'
      if (s.mode === 'v') return
      e.currentTarget.setPointerCapture?.(e.pointerId)
      setDragging(true)
    }
    s.moved = true
    setDx(Math.max(-REVEAL - 24, Math.min(0, s.base + mx)))
  }
  const endDrag = () => {
    const s = g.current
    if (s.mode === 'h') {
      setDragging(false)
      setDx((cur) => (cur < -REVEAL / 2 ? -REVEAL : 0))
    }
    // let the click handler (fires right after pointerup) see `moved`, then reset
    setTimeout(() => {
      g.current.moved = false
      g.current.mode = null
    }, 0)
  }

  const onClick = () => {
    if (g.current.moved) return
    if (dx !== 0) return setDx(0)
    onEdit()
  }

  return (
    <li
      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in ${
        leaving ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
      }`}
    >
      <div className="relative overflow-hidden">
        {dx < 0 && (
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${task.title}`}
            style={{ width: REVEAL }}
            className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-0.5 bg-danger text-[13px] font-semibold text-white"
          >
            <TrashIcon />
            Delete
          </button>
        )}
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              onEdit()
            }
          }}
          onClick={onClick}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ transform: `translateX(${dx}px)`, touchAction: 'pan-y' }}
          className={`relative flex min-h-16 select-none items-center gap-3 px-1 py-3 ${rowBg} ${
            dragging ? '' : 'transition-transform duration-200 ease-out'
          }`}
        >
          <Checkbox done={task.done} onToggle={onToggle} title={task.title} />
          <div className="min-w-0 flex-1">
            {overdue && (
              <div className="mb-0.5 flex items-center gap-2">
                <span className="rounded-md bg-danger/10 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-danger">
                  Overdue
                </span>
                {showDate && <span className="text-xs text-muted">{formatDateHeading(task.date, todayISO)}</span>}
              </div>
            )}
            <p
              className={`break-words text-[17px] leading-snug font-semibold tracking-tight transition-colors duration-200 ${
                task.done ? 'text-muted line-through decoration-muted/70' : 'text-ink'
              }`}
            >
              {task.title}
            </p>
            {!overdue && showDate && (
              <p className="mt-0.5 text-xs text-muted">{formatDateHeading(task.date, todayISO)}</p>
            )}
          </div>
          {task.time && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-muted">
              <ClockIcon />
              {formatTime(task.time)}
            </span>
          )}
        </div>
      </div>
    </li>
  )
}
