/** Labelled segmented radio control. options: [{ id, label, dot? }] */
export default function Segmented({ label, options, value, onChange, className = 'mt-5', hideLabel = false }) {
  return (
    <div className={className}>
      <div className={hideLabel ? 'sr-only' : 'mb-1.5 text-sm font-semibold text-muted'}>{label}</div>
      <div
        role="radiogroup"
        aria-label={label}
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        className="grid gap-1 rounded-xl bg-tint p-1"
      >
        {options.map((o) => {
          const selected = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.id)}
              className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-1 text-[13px] leading-tight font-semibold transition-all duration-200 ${
                selected ? 'bg-surface text-accent shadow-sm' : 'text-muted'
              }`}
            >
              {o.dot && <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${o.dot}`} />}
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
