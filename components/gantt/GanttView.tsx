'use client'
import { Task, ProjectMember } from '@/types'

interface Props {
  tasks: Task[]
  members: ProjectMember[]
  onTaskClick: (task: Task) => void
  startDate?: string // ISO date string e.g. "2024-01-01"
}

const MEMBER_COLORS = [
  'bg-indigo-500', 'bg-blue-500', 'bg-violet-500', 'bg-teal-500',
  'bg-orange-500', 'bg-pink-500', 'bg-emerald-500', 'bg-rose-500',
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa']

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export default function GanttView({ tasks, members, onTaskClick, startDate }: Props) {
  const tasksWithAssignee = tasks.filter(t => t.assigned_to)
  if (tasksWithAssignee.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-lg mb-1">No assigned tasks yet</p>
        <p className="text-sm">Run optimization to assign tasks and see the Gantt chart</p>
      </div>
    )
  }

  // Project start date
  const projectStart = startDate ? new Date(startDate) : new Date()
  projectStart.setHours(0, 0, 0, 0)

  const byWorker: Record<string, Task[]> = {}
  for (const m of members) {
    byWorker[m.user_id] = tasks.filter(t => t.assigned_to === m.user_id)
  }
  const activeMember = members.filter(m => (byWorker[m.user_id] || []).length > 0)

  // Build schedule: sequential per worker starting from projectStart
  const schedule: Record<string, { task: Task; startDay: number; endDay: number }[]> = {}
  let maxDay = 0

  for (const m of activeMember) {
    let day = 0 // offset from projectStart
    schedule[m.user_id] = []
    const workerTasks = [...(byWorker[m.user_id] || [])].sort((a, b) => b.priority - a.priority)
    for (const task of workerTasks) {
      const days = Math.max(1, Math.ceil(Number(task.duration) / Number(m.hours_per_day || 8)))
      schedule[m.user_id].push({ task, startDay: day, endDay: day + days - 1 })
      day += days
    }
    maxDay = Math.max(maxDay, day)
  }

  // Also consider deadline_days
  const deadlineMax = tasks.reduce((m, t) => Math.max(m, t.deadline_days || 0), 0)
  const totalDays = Math.max(maxDay + 2, deadlineMax + 2, 14)

  const DAY_W = 36 // px per day

  // Build array of dates
  const dates = Array.from({ length: totalDays }, (_, i) => addDays(projectStart, i))

  // Group dates by month for header
  const monthGroups: { label: string; count: number }[] = []
  for (const d of dates) {
    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
    if (monthGroups.length === 0 || monthGroups[monthGroups.length - 1].label !== label) {
      monthGroups.push({ label, count: 1 })
    } else {
      monthGroups[monthGroups.length - 1].count++
    }
  }

  // Today marker
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOffset = Math.floor((today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24))
  const showToday = todayOffset >= 0 && todayOffset < totalDays

  return (
    <div className="card overflow-hidden">
      <div className="overflow-auto">
        <div style={{ minWidth: 180 + totalDays * DAY_W }}>

          {/* Month header */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <div className="shrink-0 border-r border-slate-200" style={{ width: 180 }} />
            <div className="flex">
              {monthGroups.map((mg, i) => (
                <div
                  key={i}
                  className="text-xs font-semibold text-slate-600 px-2 py-1.5 border-r border-slate-200 bg-slate-50"
                  style={{ width: mg.count * DAY_W }}
                >
                  {mg.label}
                </div>
              ))}
            </div>
          </div>

          {/* Day header */}
          <div className="flex border-b border-slate-200 sticky top-0 z-10 bg-white">
            <div
              className="shrink-0 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide border-r border-slate-200 flex items-center"
              style={{ width: 180 }}
            >
              Worker
            </div>
            <div className="flex relative">
              {dates.map((d, i) => {
                const isWeekend = d.getDay() === 0 || d.getDay() === 6
                const isToday = i === todayOffset
                return (
                  <div
                    key={i}
                    style={{ width: DAY_W, minWidth: DAY_W }}
                    className={`text-center py-2 border-r text-xs shrink-0 ${
                      isToday
                        ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                        : isWeekend
                        ? 'bg-slate-50 text-slate-400 border-slate-200'
                        : 'text-slate-500 border-slate-100'
                    }`}
                  >
                    <div className="font-medium">{d.getDate()}</div>
                    <div className="text-[10px] opacity-70">{DAYS_SHORT[d.getDay()]}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Worker rows */}
          {activeMember.map((m, mi) => (
            <div key={m.user_id} className="flex border-b border-slate-100 hover:bg-slate-50/50">
              {/* Worker label */}
              <div
                className="shrink-0 px-4 border-r border-slate-200 flex flex-col justify-center"
                style={{ width: 180, height: 56 }}
              >
                <p className="text-sm font-medium text-slate-700 truncate">{m.username}</p>
                <p className="text-xs text-slate-400">{m.hours_per_day}h/day</p>
              </div>

              {/* Timeline */}
              <div className="relative" style={{ width: totalDays * DAY_W, height: 56 }}>
                {/* Grid + weekend shading */}
                {dates.map((d, i) => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6
                  return (
                    <div
                      key={i}
                      className={`absolute top-0 bottom-0 border-r ${
                        isWeekend ? 'bg-slate-50/80 border-slate-200' : 'border-slate-100'
                      }`}
                      style={{ left: i * DAY_W, width: DAY_W }}
                    />
                  )
                })}

                {/* Today line */}
                {showToday && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 z-10 opacity-70"
                    style={{ left: todayOffset * DAY_W + DAY_W / 2 }}
                  />
                )}

                {/* Deadline markers */}
                {(schedule[m.user_id] || []).map(({ task }) =>
                  task.deadline_days != null ? (
                    <div
                      key={`dl-${task.id}`}
                      className="absolute top-0 bottom-0 w-0.5 bg-red-400 opacity-50 z-10"
                      style={{ left: task.deadline_days * DAY_W }}
                      title={`Deadline: ${formatDate(addDays(projectStart, task.deadline_days))}`}
                    />
                  ) : null
                )}

                {/* Task bars */}
                {(schedule[m.user_id] || []).map(({ task, startDay, endDay }) => {
                  const left = startDay * DAY_W + 2
                  const width = (endDay - startDay + 1) * DAY_W - 4
                  const overdue = task.deadline_days != null && endDay > task.deadline_days
                  const color = overdue ? 'bg-red-500' : MEMBER_COLORS[mi % MEMBER_COLORS.length]
                  const startDateStr = formatDate(addDays(projectStart, startDay))
                  const endDateStr = formatDate(addDays(projectStart, endDay))
                  return (
                    <div
                      key={task.id}
                      className={`absolute rounded text-white text-xs flex items-center px-2 gap-1 cursor-pointer hover:opacity-80 transition-opacity shadow-sm ${color}`}
                      style={{ left, width, top: 10, height: 36 }}
                      title={`${task.name} · ${task.duration}h · ${startDateStr} – ${endDateStr}${overdue ? ' ⚠️ OVERDUE' : ''}`}
                      onClick={() => onTaskClick(task)}
                    >
                      <span className="truncate">{task.name}</span>
                      {overdue && <span className="shrink-0 text-[10px]">⚠️</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workload summary */}
      <div className="px-4 py-4 bg-slate-50 border-t border-slate-200">
        <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Workload</p>
        <div className="flex flex-wrap gap-5">
          {activeMember.map(m => {
            const total = (byWorker[m.user_id] || []).reduce((s, t) => s + Number(t.duration), 0)
            const available = Number(m.hours_per_day) * totalDays
            const pct = Math.round((total / available) * 100)
            return (
              <div key={m.user_id} className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 font-medium w-24 truncate">{m.username}</span>
                <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <span className={`font-mono ${pct > 100 ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                  {pct}% · {total}h
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}