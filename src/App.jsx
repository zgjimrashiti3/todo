import { useCallback, useMemo, useState } from 'react'
import { useTasks } from './hooks/useTasks'
import { useNow } from './hooks/useNow'
import { useTheme } from './hooks/useTheme'
import { nowHM, toISO } from './lib/dates'
import { selectSearch, selectView, TABS } from './lib/tasks'
import { collectTags } from './lib/tags'
import { haptic } from './lib/haptics'
import TabBar from './components/TabBar'
import TagFilterBar from './components/TagFilterBar'
import ProgressBar from './components/ProgressBar'
import TaskList from './components/TaskList'
import TaskSheet from './components/TaskSheet'
import SettingsSheet from './components/SettingsSheet'
import EmptyState from './components/EmptyState'
import Toast from './components/Toast'
import { CloseIcon, GearIcon, PhoneIcon, PlusIcon, SearchIcon } from './components/icons'

const DEFAULT_MODE = { today: 'today', upcoming: 'tomorrow', nodate: 'none', done: 'today' }
const iconBtn = 'flex size-11 items-center justify-center rounded-full text-muted active:bg-tint-strong'

export default function App() {
  const { tasks, add, update, toggle, undoToggle, remove, restore, removeMany } = useTasks()
  const theme = useTheme()
  const now = useNow()
  const [tab, setTab] = useState('today')
  const [tag, setTag] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sheet, setSheet] = useState(null) // { kind: 'task', task } | { kind: 'settings' }
  const [leaving, setLeaving] = useState(() => new Set())
  const [toast, setToast] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const todayISO = toISO(now)
  const hm = nowHM(now)
  const allTags = useMemo(() => collectTags(tasks), [tasks])
  const activeTag = allTags.includes(tag) ? tag : null
  const searching = searchOpen && query.trim() !== ''

  const scoped = activeTag ? tasks.filter((t) => t.tags.includes(activeTag)) : tasks
  const view = searching ? selectSearch(tasks, query, todayISO, hm) : selectView(scoped, tab, todayISO, hm)
  const total = view.all.length
  const done = view.all.filter((t) => t.done).length
  const heading = searching ? 'Results' : TABS.find((t) => t.id === tab).label
  const isDoneTab = tab === 'done' && !searching

  const dismissToast = useCallback(() => setToast(null), [])
  const showToast = (message, onUndo) =>
    setToast({
      id: Date.now(),
      message,
      onUndo: () => {
        haptic(10)
        onUndo()
      },
    })

  const handleToggle = (id) => {
    haptic(10)
    const result = toggle(id)
    if (result?.completed) showToast('Task completed', () => undoToggle(id, result.nextId))
  }

  // Animate a row out, then remove it from the store (undoable).
  const handleDelete = (id) => {
    haptic(15)
    setLeaving((s) => new Set(s).add(id))
    setTimeout(() => {
      const removed = remove(id)
      setLeaving((s) => {
        const n = new Set(s)
        n.delete(id)
        return n
      })
      if (removed) showToast('Task deleted', () => restore(removed))
    }, 220)
  }

  const handleClearCompleted = () => {
    haptic(15)
    removeMany(view.all.map((t) => t.id))
    setConfirmClear(false)
  }

  const handleSave = (data) => (sheet.task ? update(sheet.task.id, data) : add(data))
  const changeTab = (id) => {
    setTab(id)
    setConfirmClear(false)
  }
  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <header className="mb-5">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-[40px] leading-none font-extrabold tracking-tighter">My Tasks</h1>
          <div className="-mt-1 -mr-2 flex">
            <button
              type="button"
              aria-label={searchOpen ? 'Close search' : 'Search tasks'}
              aria-expanded={searchOpen}
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              className={iconBtn}
            >
              {searchOpen ? <CloseIcon /> : <SearchIcon />}
            </button>
            <button type="button" aria-label="Settings" onClick={() => setSheet({ kind: 'settings' })} className={iconBtn}>
              <GearIcon />
            </button>
          </div>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-muted">
          <PhoneIcon /> Stored on this device
        </p>
        {searchOpen && (
          <div className="animate-fade-up relative mt-4">
            <label htmlFor="search" className="sr-only">
              Search tasks by name or tag
            </label>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
            <input
              id="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
              placeholder="Search by name or tag"
              autoComplete="off"
              enterKeyHint="search"
              className="h-12 w-full rounded-xl border-2 border-line bg-surface pr-12 pl-11 text-base font-medium outline-none transition-colors placeholder:text-muted/60 focus:border-primary"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                className="absolute top-1/2 right-0.5 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-muted"
              >
                <CloseIcon width={18} height={18} />
              </button>
            )}
          </div>
        )}
      </header>

      {!searching && (
        <>
          <TabBar value={tab} onChange={changeTab} />
          <TagFilterBar tags={allTags} value={activeTag} onChange={setTag} />
        </>
      )}

      <div className="mt-6 mb-4">
        <div className="mb-2 flex min-h-11 items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">{heading}</h2>
          {isDoneTab && total > 0 ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="min-h-11 rounded-xl px-3 text-sm font-semibold text-danger-text"
            >
              Clear completed
            </button>
          ) : (
            total > 0 && (
              <span className="text-sm font-medium text-muted">
                {searching ? `${total} found` : isDoneTab ? `${total} completed` : `${done} of ${total} completed`}
              </span>
            )
          )}
        </div>
        {isDoneTab && confirmClear && total > 0 && (
          <div role="alertdialog" aria-label="Clear completed tasks" className="animate-fade-up mb-3 rounded-2xl bg-peach p-3">
            <p className="mb-2 text-center text-[15px] font-semibold">
              Clear {total} completed {total === 1 ? 'task' : 'tasks'}? This can&rsquo;t be undone.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmClear(false)} className="h-12 flex-1 rounded-xl bg-surface font-semibold">
                Cancel
              </button>
              <button type="button" onClick={handleClearCompleted} className="h-12 flex-1 rounded-xl bg-danger font-semibold text-white">
                Yes, clear
              </button>
            </div>
          </div>
        )}
        {total > 0 && !isDoneTab && !searching && <ProgressBar done={done} total={total} />}
      </div>

      <main key={searching ? 'search' : tab} className="animate-fade-up">
        {total === 0 ? (
          <EmptyState tab={searching ? 'search' : tab} />
        ) : (
          <TaskList
            view={view}
            todayISO={todayISO}
            leaving={leaving}
            onToggle={handleToggle}
            onEdit={(task) => setSheet({ kind: 'task', task })}
            onDelete={handleDelete}
          />
        )}
      </main>

      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] bg-gradient-to-t from-canvas via-canvas/95 to-transparent px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => setSheet({ kind: 'task', task: null })}
          className="pointer-events-auto flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[17px] font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-[0.98] active:bg-primary-dark"
        >
          <PlusIcon /> Add task
        </button>
      </div>

      {sheet?.kind === 'task' && (
        <TaskSheet
          key={sheet.task?.id ?? 'new'}
          task={sheet.task}
          defaultMode={DEFAULT_MODE[tab]}
          allTags={allTags}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === 'settings' && (
        <SettingsSheet theme={theme.pref} onTheme={theme.setTheme} onClose={() => setSheet(null)} />
      )}
    </div>
  )
}
