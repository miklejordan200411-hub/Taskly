'use client'
import { Task, ProjectMember } from '@/types'

interface Props {
  tasks: Task[]
  members: ProjectMember[]
  onTaskClick: (task: Task) => void
}

const COLORS = [
  'bg-indigo-500', 'bg-blue-500', 'bg-violet-500', 'bg-teal-500',
  'bg-orange-500', 'bg-pink-500', 'bg-emerald-500', 'bg-rose-500',
]

export default function GanttView({ tasks, members, onTaskClick }: Props) {
  const memberById = Object.fromEntries(members.map(m => [m.user_id, m]))

  // Determine day range
  const tasksWithDays = tasks.filter(t => t.assigned_to)
  if (tasksWithDays.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>No assigned tasks yet</p>
        <p className="text-sm mt-1">Run optimization to assign tasks and see the Gantt chart</p>
      </div>
    )
  }

  // Group tasks by worker
  const byWorker: Record<string, Task[]> = {}
  for (const m of members) {
    byWorker[m.user_id] = tasks.filter(t => t.assigned_to === m.user_id)
  }

  // Simple day estimation from task order per worker
  // We calculate visual positions using cumulative hours
  const totalDays = Math.max(...tasks.map(t => (t.deadline_days || 20)), 20)
  const dayWidth = 40 // px per day

  // Build schedule: simple sequential per worker
  const schedule: Record<string, { task: Task; start: number; end: number }[]> = {}
  for (const m of members) {
    let day = 1
    schedule[m.user_id] = []
    const workerTasks = [...(byWorker[m.user_id] || [])].sort((a, b) => b.priority - a.priority)
    for (const task of workerTasks) {
      const days = Math.ceil(Number(task.duration) / Number(m.hours_per_day || 8))
      schedule[m.user_id].push({ task, start: day, end: day + days - 1 })
      day += days
    }
  }

  const activeMember = members.filter(m => (byWorker[m.user_id] || []).length > 0)

  return (
    <div className="card overflow-auto">
      {/* Day header */}
      <div className="flex border-b border-slate-200 sticky top-0 bg-white z-10">
        <div className="w-48 shrink-0 px-4 py-3 text-sm font-medium text-slate-600 border-r border-slate-200">
          Worker
        </div>
        <div className="flex">
          {Array.from({ length: totalDays }, (_, i) => (
            <div
              key={i}
              style={{ width: dayWidth }}
              className="shrink-0 text-center text-xs text-slate-400 py-3 border-r border-slate-100"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      {activeMember.map((m, mi) => (
        <div key={m.user_id} className="flex border-b border-slate-100 hover:bg-slate-50">
          {/* Worker name */}
          <div className="w-48 shrink-0 px-4 py-3 border-r border-slate-200">
            <p className="text-sm font-medium text-slate-700">{m.username}</p>
            <p className="text-xs text-slate-400">{m.hours_per_day}h/day</p>
          </div>

          {/* Timeline */}
          <div className="relative flex" style={{ height: 56 }}>
            {/* Grid lines */}
            {Array.from({ length: totalDays }, (_, i) => (
              <div
                key={i}
                style={{ width: dayWidth }}
                className="shrink-0 border-r border-slate-100 h-full"
              />
            ))}

            {/* Task bars */}
            {(schedule[m.user_id] || []).map(({ task, start, end }) => {
              const left = (start - 1) * dayWidth
              const width = (end - start + 1) * dayWidth - 2
              const color = COLORS[mi % COLORS.length]
              const overdue = task.deadline_days && end > task.deadline_days
              return (
                <div
                  key={task.id}
                  className={`gantt-bar absolute top-2 ${overdue ? 'bg-red-500' : color}`}
                  style={{ left, width, height: 36 }}
                  title={`${task.name} (${task.duration}h) | Day ${start}–${end}${overdue ? ' ⚠️ OVERDUE' : ''}`}
                  onClick={() => onTaskClick(task)}
                >
                  {task.name}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Workload summary */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
        <p className="text-xs font-medium text-slate-600 mb-2">Workload</p>
        <div className="flex flex-wrap gap-3">
          {members.map(m => {
            const total = (byWorker[m.user_id] || []).reduce((s, t) => s + Number(t.duration), 0)
            const available = Number(m.hours_per_day) * 20
            const pct = Math.round((total / available) * 100)
            return (
              <div key={m.user_id} className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 font-medium">{m.username}</span>
                <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <span className={pct > 100 ? 'text-red-600' : 'text-slate-500'}>{pct}% · {total}h</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
