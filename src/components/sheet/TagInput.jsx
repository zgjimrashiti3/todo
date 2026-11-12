import { CloseIcon } from '../icons'
import { MAX_TAG, MAX_TAGS, normalizeTag, normalizeTags } from '../../lib/tags'

/** Free-text tags shown as chips, with one-tap reuse of tags from other tasks. */
export default function TagInput({ tags, onChange, draft, onDraft, suggestions }) {
  const add = (raw) => {
    onChange(normalizeTags([...tags, raw]))
    onDraft('')
  }
  const remaining = suggestions.filter((s) => !tags.includes(s)).slice(0, 12)
  const full = tags.length >= MAX_TAGS

  return (
    <>
      <label className="mt-5 mb-1.5 block text-sm font-semibold text-muted" htmlFor="task-tag">
        Tags <span className="font-normal">(optional)</span>
      </label>
      {tags.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {tags.map((t) => (
            <li key={t} className="flex min-h-11 items-center gap-1 rounded-full bg-primary-soft pl-3.5 text-[14px] font-semibold text-accent">
              #{t}
              <button
                type="button"
                aria-label={`Remove tag ${t}`}
                onClick={() => onChange(tags.filter((x) => x !== t))}
                className="flex size-11 items-center justify-center rounded-full"
              >
                <CloseIcon width={16} height={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id="task-tag"
          value={draft}
          maxLength={MAX_TAG}
          disabled={full}
          onChange={(e) => onDraft(e.target.value.replace(',', ''))}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ',') && normalizeTag(draft)) {
              e.preventDefault()
              add(draft)
            }
          }}
          placeholder={full ? 'Tag limit reached' : 'Add a tag, e.g. work'}
          autoComplete="off"
          autoCapitalize="none"
          enterKeyHint="done"
          className="h-12 min-w-0 flex-1 rounded-xl border-2 border-line bg-surface px-4 text-base font-medium outline-none transition-colors placeholder:text-muted/60 focus:border-primary disabled:opacity-60"
        />
        <button
          type="button"
          disabled={full || !normalizeTag(draft)}
          onClick={() => add(draft)}
          className="min-h-12 rounded-xl bg-tint px-4 text-sm font-semibold text-accent disabled:text-muted disabled:opacity-60"
        >
          Add
        </button>
      </div>
      {remaining.length > 0 && !full && (
        <div role="group" aria-label="Existing tags" className="mt-2 flex flex-wrap gap-2">
          {remaining.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="min-h-11 rounded-full border border-line px-3.5 text-[14px] font-medium text-muted"
            >
              + #{s}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
