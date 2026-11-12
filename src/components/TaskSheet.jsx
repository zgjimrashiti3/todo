import { useEffect, useRef, useState } from 'react'
import { addDays, isValidDate, toISO } from '../lib/dates'
import { MAX_TITLE, validateTitle } from '../lib/tasks'
import { TrashIcon } from './icons'

const MODES = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'pick', label: 'Pick a date' },
  { id: 'none', label: 'No date' },
]
const CLOSE_MS = 250

function initialMode(task, defaultMode, todayISO) {
  if (!task) return defaultMode
  if (!task.date) return 'none'
  if (task.date === todayISO) return 'today'
  if (task.date === addDays(todayISO, 1)) return 'tomorrow'
  return 'pick'
}

/** Bottom sheet for creating / editing a task. `task` is null when creating. */
export default function TaskSheet({ task, defaultMode = 'today', onSave, onDelete, onClose }) {
  const todayISO = toISO(new Date())
  const [title, setTitle] = useState(task?.title ?? '')
  const [mode, setMode] = useState(() => initialMode(task, defaultMode, todayISO))
  const [picked, setPicked] = useState(task?.date ?? todayISO)
  const [time, setTime] = useState(task ? (task.time ?? '') : '09:00')
  const [error, setError] = useState(null)
  const [confirming, setConfirming] = useState(false)

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

  const dateFor = () => (mode === 'today' ? todayISO : mode === 'tomorrow' ? addDays(todayISO, 1) : mode === 'pick' ? picked : null)

  const submit = (e) => {
    e.preventDefault()
    const { value, error: err } = validateTitle(title)
    if (err) return setError(err)
    const date = dateFor()
    if (mode === 'pick' && !isValidDate(date)) return setError('Please pick a date.')
    onSave({ title: value, date, time: date && time ? time : null })
    close()
  }

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
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={task ? 'Edit task' : 'New task'}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-ink/50 transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />
      <form
        onSubmit={submit}
        noValidate
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
          <div className="mx-auto h-1.5 w-11 rounded-full bg-black/15" />
          <h2 className="pt-4 pb-3 text-[28px] leading-tight font-extrabold tracking-tight">
            {task ? 'Edit task' : 'New task'}
          </h2>
        </div>

        <label className="mb-1.5 block text-sm font-semibold text-muted" htmlFor="task-name">
          Task name
        </label>
        <input
          id="task-name"
          autoFocus
          value={title}
          maxLength={MAX_TITLE}
          onChange={(e) => {
            setTitle(e.target.value)
            if (error) setError(null)
          }}
          placeholder="What needs to be done?"
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={!!error}
          className={`h-12 w-full rounded-xl border-2 bg-white px-4 text-base font-medium outline-none transition-colors placeholder:text-muted/60 focus:border-primary ${
            error ? 'border-danger' : 'border-line'
          }`}
        />
        {error && <p className="mt-1.5 text-sm font-medium text-danger">{error}</p>}

        <div className="mt-5 mb-1.5 text-sm font-semibold text-muted">Date</div>
        <div role="radiogroup" aria-label="Date" className="grid grid-cols-4 gap-1 rounded-xl bg-black/5 p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              onClick={() => {
                setMode(m.id)
                setError(null)
              }}
              className={`min-h-11 rounded-lg px-1 text-[13px] leading-tight font-semibold transition-all duration-200 ${
                mode === m.id ? 'bg-white text-primary shadow-sm' : 'text-muted'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'pick' && (
          <input
            type="date"
            aria-label="Pick a date"
            value={picked}
            onChange={(e) => setPicked(e.target.value)}
            className="animate-fade-up mt-3 h-12 w-full rounded-xl border-2 border-line bg-white px-4 text-base font-medium outline-none focus:border-primary"
          />
        )}

        {mode !== 'none' && (
          <>
            <label className="mt-5 mb-1.5 block text-sm font-semibold text-muted" htmlFor="task-time">
              Time <span className="font-normal">(optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="task-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-12 min-w-0 flex-1 rounded-xl border-2 border-line bg-white px-4 text-base font-medium outline-none focus:border-primary"
              />
              {time && (
                <button
                  type="button"
                  onClick={() => setTime('')}
                  className="min-h-12 rounded-xl bg-black/5 px-4 text-sm font-semibold text-muted"
                >
                  No time
                </button>
              )}
            </div>
          </>
        )}

        <button
          type="submit"
          className="mt-6 h-14 w-full rounded-2xl bg-primary text-[17px] font-bold text-white shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] active:bg-primary-dark"
        >
          Save task
        </button>

        {task && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[16px] font-semibold text-danger"
          >
            <TrashIcon /> Delete task
          </button>
        )}
        {task && confirming && (
          <div className="animate-fade-up mt-3 rounded-2xl bg-peach p-3">
            <p className="mb-2 text-center text-[15px] font-semibold">Delete this task?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="h-12 flex-1 rounded-xl bg-white font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(task.id)
                  close()
                }}
                className="h-12 flex-1 rounded-xl bg-danger font-semibold text-white"
              >
                Yes, delete
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
