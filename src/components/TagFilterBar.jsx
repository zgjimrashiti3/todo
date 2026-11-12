/** Horizontally scrolling tag filter chips shown under the tabs. */
export default function TagFilterBar({ tags, value, onChange }) {
  if (!tags.length) return null
  const chip = (id, label) => {
    const active = value === id
    return (
      <button
        key={id ?? 'all'}
        type="button"
        aria-pressed={active}
        onClick={() => onChange(id)}
        className={`min-h-11 shrink-0 rounded-full px-4 text-[14px] font-semibold transition-colors duration-200 ${
          active ? 'bg-primary text-white' : 'bg-tint text-muted active:bg-tint-strong'
        }`}
      >
        {label}
      </button>
    )
  }
  return (
    <div role="group" aria-label="Filter by tag" className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
      {chip(null, 'All')}
      {tags.map((t) => chip(t, `#${t}`))}
    </div>
  )
}
