'use client'
import { useState } from 'react'
import { Task, ProjectMember } from '@/types'

interface Props {
  tasks: Task[]
  members: ProjectMember[]
  isManager: boolean
  onTaskClick: (task: Task) => void
  onStatusChange: (taskId: string, status: string) => void
  onReload: () => void
}

const COLUMNS = ['To Do', 'In Progress', 'Done'] as const
const COL_COLORS: Record<string, string> = {
  'To Do': 'bg-slate-100',
  'In Progress': 'bg-blue-50',
  'Done': 'bg-green-50',
}
const PRIORITY_COLORS = ['', 'border-l-slate-300', 'border-l-blue-300', 'border-l-yellow-400', 'border-l-orange-400', 'border-l-red-500']

export default function KanbanView({ tasks, members, isManager, onTaskClick, onStatusChange, onReload }: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const memberById = Object.fromEntries(members.map(m => [m.user_id, m]))

  async function handleDrop(status: string) {
    if (!draggedId) return
    const taskId = draggedId
    setDraggedId(null)
    setDragOverCol(null)

    // Optimistic update
    onStatusChange(taskId, status)
    setSaving(taskId)

    // Save to DB
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    setSaving(null)

    if (!res.ok) {
      // Rollback — reload from server
      onReload()
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col)
        const isOver = dragOverCol === col
        return (
          <div
            key={col}
            className="flex-1 min-w-[280px]"
            onDragOver={e => { e.preventDefault(); setDragOverCol(col) }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={() => handleDrop(col)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700 text-sm">{col}</h3>
              <span className="badge bg-slate-100 text-slate-500">{colTasks.length}</span>
            </div>
            <div className={`kanban-col border-2 transition-colors rounded-xl ${
              isOver
                ? 'border-indigo-400 bg-indigo-50'
                : `border-transparent ${COL_COLORS[col]} border border-slate-200`
            }`}>
              {colTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedId(task.id)}
                  onDragEnd={() => { setDraggedId(null); setDragOverCol(null) }}
                  onClick={() => onTaskClick(task)}
                  className={`card p-3 cursor-pointer hover:shadow-md transition-all border-l-4 ${PRIORITY_COLORS[task.priority]} ${
                    draggedId === task.id ? 'opacity-40 scale-95' : ''
                  } ${saving === task.id ? 'opacity-60' : ''}`}
                >
                  <p className="font-medium text-slate-800 text-sm mb-2">{task.name}</p>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {task.skill && (
                      <span className="badge bg-indigo-50 text-indigo-600">{task.skill}</span>
                    )}
                    <span className="badge bg-slate-50 text-slate-500">{task.duration}h</span>
                    {task.deadline_days && (
                      <span className="badge bg-orange-50 text-orange-600">Day {task.deadline_days}</span>
                    )}
                    {saving === task.id && (
                      <span className="badge bg-slate-100 text-slate-400">saving...</span>
                    )}
                  </div>
                  {task.assigned_to && (
                    <p className="text-xs text-slate-400 mt-2">
                      → {memberById[task.assigned_to]?.username || task.assigned_username}
                    </p>
                  )}
                </div>
              ))}
              {colTasks.length === 0 && (
                <div className={`text-center text-sm py-8 transition-colors ${isOver ? 'text-indigo-400' : 'text-slate-300'}`}>
                  {isOver ? 'Drop here' : 'Empty'}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}