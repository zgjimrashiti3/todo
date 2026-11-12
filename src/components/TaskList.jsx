import TaskItem from './TaskItem'

export default function TaskList({ view, todayISO, leaving, onToggle, onEdit, onDelete }) {
  const item = (task, overdue = false) => (
    <TaskItem
      key={task.id}
      task={task}
      overdue={overdue}
      todayISO={todayISO}
      leaving={leaving.has(task.id)}
      onToggle={() => onToggle(task.id)}
      onEdit={() => onEdit(task)}
      onDelete={() => onDelete(task.id)}
    />
  )

  return (
    <div className="space-y-5">
      {view.overdue.length > 0 && (
        <ul className="animate-fade-up divide-y divide-peach-line overflow-hidden rounded-2xl bg-peach px-3">
          {view.overdue.map((t) => item(t, true))}
        </ul>
      )}
      {view.groups.map((g) => (
        <section key={g.key}>
          {g.label && (
            <h3 className="mb-1 text-sm font-bold tracking-tight text-accent">{g.label}</h3>
          )}
          <ul className="divide-y divide-line">{g.tasks.map((t) => item(t))}</ul>
        </section>
      ))}
    </div>
  )
}
