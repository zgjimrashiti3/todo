import Checkbox from '../Checkbox'
import { CloseIcon } from '../icons'
import { MAX_SUBTASKS, MAX_TITLE, newId } from '../../lib/tasks'

export const makeSubtask = (title) => ({ id: newId(), title: title.trim().slice(0, MAX_TITLE), done: false })

/** Checklist editor: tick, add and remove subtasks. */
export default function SubtaskEditor({ items, onChange, draft, onDraft, compact = false }) {
  const add = () => {
    if (!draft.trim() || items.length >= MAX_SUBTASKS) return
    onChange([...items, makeSubtask(draft)])
    onDraft('')
  }
  const done = items.filter((s) => s.done).length

  return (
    <>
      <label className={compact ? 'sr-only' : 'mt-5 mb-1.5 block text-sm font-semibold text-muted'} htmlFor="task-subtask">
        Subtasks {items.length > 0 && <span className="font-normal">({done}/{items.length})</span>}
      </label>
      {items.length > 0 && (
        <ul className="mb-1 divide-y divide-line">
          {items.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-1 py-1">
              <Checkbox
                done={s.done}
                label={`${s.done ? 'Mark as not done' : 'Mark as done'}: ${s.title}`}
                onToggle={() => onChange(items.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)))}
              />
              <span className={`min-w-0 flex-1 break-words text-[16px] font-medium ${s.done ? 'text-muted line-through' : ''}`}>
                {s.title}
              </span>
              <button
                type="button"
                aria-label={`Remove subtask ${s.title}`}
                onClick={() => onChange(items.filter((x) => x.id !== s.id))}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted"
              >
                <CloseIcon width={18} height={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id="task-subtask"
          value={draft}
          maxLength={MAX_TITLE}
          onChange={(e) => onDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault() // don't submit the whole task
              add()
            }
          }}
          placeholder="Add a checklist item"
          autoComplete="off"
          enterKeyHint="done"
          className="h-12 min-w-0 flex-1 rounded-xl border-2 border-line bg-surface px-4 text-base font-medium outline-none transition-colors placeholder:text-muted/60 focus:border-primary"
        />
        <button
          type="button"
          disabled={!draft.trim() || items.length >= MAX_SUBTASKS}
          onClick={add}
          className="min-h-12 rounded-xl bg-tint px-4 text-sm font-semibold text-accent disabled:text-muted disabled:opacity-60"
        >
          Add
        </button>
      </div>
    </>
  )
}
