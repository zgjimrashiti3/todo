import Segmented from '../Segmented'
import { describeRepeat, REPEATS, WEEKDAYS } from '../../lib/recurrence'

/** Repeat type + weekday chooser. `weekdays` always keeps at least one day. */
export default function RepeatPicker({ type, weekdays, monthDay, onType, onWeekdays }) {
  const toggleDay = (day) => {
    if (weekdays.includes(day)) {
      if (weekdays.length > 1) onWeekdays(weekdays.filter((d) => d !== day))
    } else {
      onWeekdays([...weekdays, day])
    }
  }
  const hint = describeRepeat({ type, days: weekdays, day: monthDay })

  return (
    <>
      <Segmented label="Repeat" options={REPEATS} value={type} onChange={onType} />
      {type === 'weekly' && (
        <div role="group" aria-label="Repeat on" className="animate-fade-up mt-2 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((w) => {
            const on = weekdays.includes(w.day)
            return (
              <button
                key={w.day}
                type="button"
                aria-pressed={on}
                aria-label={w.label}
                onClick={() => toggleDay(w.day)}
                className={`min-h-11 rounded-full text-[14px] font-bold transition-colors duration-200 ${
                  on ? 'bg-primary text-white' : 'bg-tint text-muted'
                }`}
              >
                {w.short}
              </button>
            )
          })}
        </div>
      )}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </>
  )
}
