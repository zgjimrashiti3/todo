import { TABS } from '../lib/tasks'

export default function TabBar({ value, onChange }) {
  return (
    <div role="tablist" aria-label="Task views" className="flex gap-1.5">
      {TABS.map((t) => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`min-h-11 min-w-0 flex-1 rounded-full px-1 text-[14px] font-semibold transition-colors duration-200 ${
              active ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-tint text-muted active:bg-tint-strong'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
