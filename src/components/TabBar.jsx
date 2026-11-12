import { TABS } from '../lib/tasks'

export default function TabBar({ value, onChange }) {
  return (
    <div role="tablist" aria-label="Task views" className="flex gap-2">
      {TABS.map((t) => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`min-h-11 flex-1 rounded-full px-4 text-[15px] font-semibold transition-colors duration-200 ${
              active ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-black/5 text-muted active:bg-black/10'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
