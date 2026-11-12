import { useState } from 'react'
import { useTasks } from './hooks/useTasks'
import { useNow } from './hooks/useNow'
import { nowHM, toISO } from './lib/dates'
import { selectView, TABS } from './lib/tasks'
import TabBar from './components/TabBar'
import ProgressBar from './components/ProgressBar'
import TaskList from './components/TaskList'
import TaskSheet from './components/TaskSheet'
import EmptyState from './components/EmptyState'
import { PhoneIcon, PlusIcon } from './components/icons'

const DEFAULT_MODE = { today: 'today', upcoming: 'tomorrow', nodate: 'none' }

export default function App() {
  const { tasks, add, update, toggle, remove } = useTasks()
  const now = useNow()
  const [tab, setTab] = useState('today')
  const [sheet, setSheet] = useState(null) // { task: Task | null }
  const [leaving, setLeaving] = useState(() => new Set())

  const todayISO = toISO(now)
  const view = selectView(tasks, tab, todayISO, nowHM(now))
  const total = view.all.length
  const done = view.all.filter((t) => t.done).length
  const tabLabel = TABS.find((t) => t.id === tab).label

  // Animate a row out, then remove it from the store.
  const handleDelete = (id) => {
    setLeaving((s) => new Set(s).add(id))
    setTimeout(() => {
      remove(id)
      setLeaving((s) => {
        const n = new Set(s)
        n.delete(id)
        return n
      })
    }, 220)
  }

  const handleSave = (data) => (sheet.task ? update(sheet.task.id, data) : add(data))

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <header className="mb-5">
        <h1 className="text-[40px] leading-none font-extrabold tracking-tighter">My Tasks</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-muted">
          <PhoneIcon /> Stored on this device
        </p>
      </header>

      <TabBar value={tab} onChange={setTab} />

      <div className="mt-6 mb-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-xl font-bold tracking-tight">{tabLabel}</h2>
          {total > 0 && (
            <span className="text-sm font-medium text-muted">
              {done} of {total} completed
            </span>
          )}
        </div>
        {total > 0 && <ProgressBar done={done} total={total} />}
      </div>

      <main key={tab} className="animate-fade-up">
        {total === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <TaskList
            view={view}
            todayISO={todayISO}
            leaving={leaving}
            onToggle={toggle}
            onEdit={(task) => setSheet({ task })}
            onDelete={handleDelete}
          />
        )}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] bg-gradient-to-t from-canvas via-canvas/95 to-transparent px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => setSheet({ task: null })}
          className="pointer-events-auto flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[17px] font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-[0.98] active:bg-primary-dark"
        >
          <PlusIcon /> Add task
        </button>
      </div>

      {sheet && (
        <TaskSheet
          key={sheet.task?.id ?? 'new'}
          task={sheet.task}
          defaultMode={DEFAULT_MODE[tab]}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  )
}
