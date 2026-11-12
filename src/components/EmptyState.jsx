import { CalendarIcon, InboxIcon, SunIcon } from './icons'

const COPY = {
  today: { Icon: SunIcon, title: 'Nothing planned for today', text: 'Enjoy the calm, or add a task to get started.' },
  upcoming: { Icon: CalendarIcon, title: 'No upcoming tasks', text: 'Plan ahead by adding a task with a future date.' },
  nodate: { Icon: InboxIcon, title: 'No undated tasks', text: 'Jot down anything that has no deadline yet.' },
}

export default function EmptyState({ tab }) {
  const { Icon, title, text } = COPY[tab]
  return (
    <div className="animate-fade-up flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon />
      </div>
      <p className="text-lg font-bold tracking-tight">{title}</p>
      <p className="mt-1 max-w-[16rem] text-[15px] text-muted">{text}</p>
    </div>
  )
}
