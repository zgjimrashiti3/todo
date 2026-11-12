import { useState } from 'react'
import { addDays, fromISO, isValidDate, toISO } from '../lib/dates'
import { MAX_TITLE, PRIORITIES, validateTitle } from '../lib/tasks'
import { NO_REPEAT, REPEATS, normalizeRepeat } from '../lib/recurrence'
import { normalizeTags } from '../lib/tags'
import BottomSheet from './BottomSheet'
import Segmented from './Segmented'
import RepeatPicker from './sheet/RepeatPicker'
import TagInput from './sheet/TagInput'
import SubtaskEditor, { makeSubtask } from './sheet/SubtaskEditor'
import { TrashIcon } from './icons'

const MODES = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'pick', label: 'Pick a date' },
]

function initialMode(task, defaultMode, todayISO) {
  if (!task) return defaultMode
  if (!task.date) return 'none'
  if (task.date === todayISO) return 'today'
  if (task.date === addDays(todayISO, 1)) return 'tomorrow'
  return 'pick'
}

/** Bottom sheet for creating / editing a task. `task` is null when creating. */
export default function TaskSheet({ task, defaultMode = 'today', allTags, onSave, onDelete, onClose }) {
  const todayISO = toISO(new Date())
  const [title, setTitle] = useState(task?.title ?? '')
  const [mode, setMode] = useState(() => initialMode(task, defaultMode, todayISO))
  const [picked, setPicked] = useState(task?.date ?? todayISO)
  const [time, setTime] = useState(task?.time ?? '')
  const [repeatType, setRepeatType] = useState(task?.repeat.type ?? 'none')
  const [weekdays, setWeekdays] = useState(task?.repeat.days ?? [])
  const [priority, setPriority] = useState(task?.priority ?? 'none')
  const [tags, setTags] = useState(task?.tags ?? [])
  const [tagDraft, setTagDraft] = useState('')
  const [subtasks, setSubtasks] = useState(task?.subtasks ?? [])
  const [subDraft, setSubDraft] = useState('')
  const [error, setError] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [open, setOpen] = useState(null) // which optional field is expanded

  const dateFor = () => (mode === 'today' ? todayISO : mode === 'tomorrow' ? addDays(todayISO, 1) : mode === 'pick' ? picked : null)
  const date = dateFor()
  const dateObj = isValidDate(date) ? fromISO(date) : fromISO(todayISO)
  // Keep a monthly task on its original day if the date didn't change (avoids drift after short months).
  const monthDay = task?.repeat.type === 'monthly' && task.date === date ? task.repeat.day : dateObj.getDate()

  const draftTag = normalizeTags([...tags, tagDraft])
  const subCount = subtasks.length + (subDraft.trim() ? 1 : 0)
  const hasDate = mode !== 'none'
  const chips = [
    hasDate && { id: 'time', label: 'Time', value: time || null },
    hasDate && {
      id: 'repeat',
      label: 'Repeat',
      value: repeatType !== 'none' ? REPEATS.find((r) => r.id === repeatType)?.label : null,
    },
    { id: 'priority', label: 'Priority', value: priority !== 'none' ? PRIORITIES.find((p) => p.id === priority)?.label : null },
    {
      id: 'tags',
      label: 'Tags',
      value: draftTag.length ? `#${draftTag[0]}${draftTag.length > 1 ? ` +${draftTag.length - 1}` : ''}` : null,
    },
    { id: 'subtasks', label: 'Subtasks', value: subCount ? `${subCount} subtask${subCount > 1 ? 's' : ''}` : null },
  ].filter(Boolean)

  const chooseRepeat = (type) => {
    setRepeatType(type)
    if (type === 'weekly' && weekdays.length === 0) setWeekdays([dateObj.getDay()])
  }

  const submit = (e, close) => {
    e.preventDefault()
    const { value, error: err } = validateTitle(title)
    if (err) return setError(err)
    if (mode === 'pick' && !isValidDate(date)) return setError('Please pick a date.')
    const repeat = date ? normalizeRepeat({ type: repeatType, days: weekdays, day: monthDay }, date) : NO_REPEAT
    onSave({
      title: value,
      date,
      time: date && time ? time : null,
      repeat,
      priority,
      tags: normalizeTags([...tags, tagDraft]),
      subtasks: subDraft.trim() ? [...subtasks, makeSubtask(subDraft)] : subtasks,
    })
    close()
  }

  return (
    <BottomSheet label={task ? 'Edit task' : 'New task'} title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      {(close) => (
        <form onSubmit={(e) => submit(e, close)} noValidate>
          <label className="sr-only" htmlFor="task-name">
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
            className={`h-12 w-full rounded-xl border-2 bg-surface px-4 text-base font-medium outline-none transition-colors placeholder:text-muted/60 focus:border-primary ${
              error ? 'border-danger' : 'border-line'
            }`}
          />
          {error && <p className="mt-1.5 text-sm font-medium text-danger-text">{error}</p>}

          <Segmented
            label="Date"
            hideLabel
            className="mt-3"
            options={MODES}
            value={mode}
            onChange={(m) => {
              setMode(m)
              setError(null)
            }}
          />

          {mode === 'pick' && (
            <input
              type="date"
              aria-label="Pick a date"
              value={picked}
              onChange={(e) => setPicked(e.target.value)}
              className="animate-fade-up mt-2 h-12 w-full rounded-xl border-2 border-line bg-surface px-4 text-base font-medium outline-none focus:border-primary"
            />
          )}

          <div role="group" aria-label="Optional details" className="mt-3 flex flex-wrap gap-2">
            {chips.map((c) => {
              const active = c.value != null
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-expanded={open === c.id}
                  onClick={() => setOpen(open === c.id ? null : c.id)}
                  className={`min-h-11 rounded-full px-3.5 text-[14px] font-semibold transition-colors duration-200 ${
                    active ? 'bg-primary-soft text-accent' : 'border border-line text-muted'
                  } ${open === c.id ? 'ring-2 ring-primary' : ''}`}
                >
                  {active ? c.value : `+ ${c.label}`}
                </button>
              )
            })}
          </div>

          {open && (
            <div className="animate-fade-up mt-3">
              {open === 'time' && (
                <div className="flex gap-2">
                  <input
                    type="time"
                    aria-label="Time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-12 min-w-0 flex-1 rounded-xl border-2 border-line bg-surface px-4 text-base font-medium outline-none focus:border-primary"
                  />
                  {time && (
                    <button
                      type="button"
                      onClick={() => {
                        setTime('')
                        setOpen(null)
                      }}
                      className="min-h-12 rounded-xl bg-tint px-4 text-sm font-semibold text-muted"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
              {open === 'repeat' && (
                <RepeatPicker
                  compact
                  type={repeatType}
                  weekdays={weekdays}
                  monthDay={monthDay}
                  onType={chooseRepeat}
                  onWeekdays={setWeekdays}
                />
              )}
              {open === 'priority' && (
                <Segmented
                  label="Priority"
                  hideLabel
                  className=""
                  options={PRIORITIES.map((p) => ({ id: p.id, label: p.label, dot: p.dot }))}
                  value={priority}
                  onChange={setPriority}
                />
              )}
              {open === 'tags' && (
                <TagInput compact tags={tags} onChange={setTags} draft={tagDraft} onDraft={setTagDraft} suggestions={allTags} />
              )}
              {open === 'subtasks' && (
                <SubtaskEditor compact items={subtasks} onChange={setSubtasks} draft={subDraft} onDraft={setSubDraft} />
              )}
            </div>
          )}

          <button
            type="submit"
            className="mt-4 h-14 w-full rounded-2xl bg-primary text-[17px] font-bold text-white shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] active:bg-primary-dark"
          >
            Save task
          </button>

          {task && !confirming && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[16px] font-semibold text-danger-text"
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
                  className="h-12 flex-1 rounded-xl bg-surface font-semibold"
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
      )}
    </BottomSheet>
  )
}
