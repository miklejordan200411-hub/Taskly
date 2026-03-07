'use client'
import { Task, ProjectMember } from '@/types'

interface Props {
  tasks: Task[]
  members: ProjectMember[]
  isManager: boolean
  onTaskClick: (task: Task) => void
  onStatusChange: (taskId: string, status: string) => void
}

const PRIORITY_LABELS = ['', 'Low', 'Normal', 'Medium', 'High', 'Critical']
const STATUS_COLORS: Record<string, string> = {
  'To Do': 'bg-slate-100 text-slate-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Done': 'bg-green-100 text-green-700',
}

export default function TableView({ tasks, members, isManager, onTaskClick, onStatusChange }: Props) {
  const memberById = Object.fromEntries(members.map(m => [m.user_id, m]))

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>No tasks yet{isManager ? ' — click "+ Task" to create one' : ''}</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Task</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Skill</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Priority</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Duration</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Deadline</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Assignee</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map(task => (
            <tr
              key={task.id}
              className="hover:bg-slate-50 cursor-pointer"
              onClick={() => onTaskClick(task)}
            >
              <td className="px-4 py-3 font-medium text-slate-800 max-w-xs">
                <span className="truncate block">{task.name}</span>
              </td>
              <td className="px-4 py-3 text-slate-500">
                {task.skill || <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-3">
                <span className={`badge priority-${task.priority}`}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{task.duration}h</td>
              <td className="px-4 py-3 text-slate-500">
                {task.deadline_days != null ? `Day ${task.deadline_days}` : <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {task.assigned_to
                  ? memberById[task.assigned_to]?.username || task.assigned_username || '—'
                  : <span className="text-slate-300">Unassigned</span>
                }
              </td>
              <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                <select
                  value={task.status}
                  onChange={e => onStatusChange(task.id, e.target.value)}
                  className={`badge cursor-pointer border-0 ${STATUS_COLORS[task.status]} pr-6`}
                  style={{ appearance: 'auto' }}
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
