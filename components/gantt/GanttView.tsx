'use client'
import React, { useState } from 'react'
import { Task, ProjectMember, OptimizationResult } from '@/types'

interface Props {
  tasks: Task[]
  members: ProjectMember[]
  onTaskClick: (task: Task) => void
  startDate?: string
  optResult?: OptimizationResult | null
}

const COLOR_PALETTE = [
  { bg: '#0F6E56', border: '#1D9E75', text: '#9FE1CB' },
  { bg: '#185FA5', border: '#378ADD', text: '#B5D4F4' },
  { bg: '#534AB7', border: '#7F77DD', text: '#CECBF6' },
  { bg: '#993C1D', border: '#D85A30', text: '#F5C4B3' },
  { bg: '#3B6D11', border: '#639922', text: '#C0DD97' },
  { bg: '#854F0B', border: '#BA7517', text: '#FAC775' },
  { bg: '#993556', border: '#D4537E', text: '#F4C0D1' },
  { bg: '#185FA5', border: '#378ADD', text: '#B5D4F4' },
]

function buildColorMap(tasks: Task[]): Map<string, { bg: string; border: string; text: string }> {
  const skills = Array.from(new Set(tasks.map(t => t.skill?.toLowerCase().trim()).filter((s): s is string => Boolean(s))))
  const map = new Map<string, { bg: string; border: string; text: string }>()
  skills.forEach((skill, i) => map.set(skill, COLOR_PALETTE[i % COLOR_PALETTE.length]))
  return map
}

const FALLBACK_COLOR = { bg: '#5F5E5A', border: '#888780', text: '#D3D1C7' }

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function fmtDate(d: Date): string {
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function toInputVal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function topoSort(tasks: Task[], depMap: Map<string, string[]>): Task[] {
  const taskById = new Map(tasks.map(t => [t.id, t]))
  const visited = new Set<string>()
  const sorted: Task[] = []

  function visit(id: string) {
    if (visited.has(id)) return
    visited.add(id)
    for (const dep of (depMap.get(id) || [])) {
      if (taskById.has(dep)) visit(dep)
    }
    const t = taskById.get(id)
    if (t) sorted.push(t)
  }

  for (const t of [...tasks].sort((a, b) => b.priority - a.priority)) {
    visit(t.id)
  }

  return sorted
}

// ─── Schedule entry с час-уровневыми данными ──────────────────────────────────
interface SchedEntry {
  startDay: number
  endDay: number
  userId: string
  startHour: number  // абсолютный час проекта (0 = начало дня 1)
  endHour: number
  workerHpd: number
}

function buildSchedule(
  tasks: Task[],
  members: ProjectMember[],
  depMap: Map<string, string[]>
): Map<string, SchedEntry> {
  const result = new Map<string, SchedEntry>()
  const workerHour = new Map<string, number>()
  const taskEndHour = new Map<string, number>()

  for (const task of topoSort(tasks, depMap)) {
    if (!task.assigned_to) continue
    const member = members.find(m => m.user_id === task.assigned_to)
    if (!member) continue

    const hpd = Math.max(1, Number(member.hours_per_day) || 8)
    const duration = Math.max(0.5, Number(task.duration))

    let depEarliestHour = 0
    for (const depId of (depMap.get(task.id) || [])) {
      const deh = taskEndHour.get(depId)
      if (deh !== undefined) depEarliestHour = Math.max(depEarliestHour, deh)
    }

    let startHour = Math.max(workerHour.get(task.assigned_to) ?? 0, depEarliestHour)

    const dayStartHour = Math.floor(startHour / hpd) * hpd
    const usedInDay = startHour - dayStartHour
    if (duration > hpd - usedInDay && usedInDay > 0) {
      startHour = dayStartHour + hpd
    }

    const endHour = startHour + duration
    const startDay = Math.floor(startHour / hpd) + 1
    const endDay = Math.max(startDay, Math.ceil(endHour / hpd))

    workerHour.set(task.assigned_to, endHour)
    taskEndHour.set(task.id, endHour)
    result.set(task.id, { startDay, endDay, userId: task.assigned_to, startHour, endHour, workerHpd: hpd })
  }

  return result
}

export default function GanttView({ tasks, members, onTaskClick, startDate, optResult }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [viewDate, setViewDate] = useState<Date>(today)

  const projectStart = startDate ? new Date(startDate) : new Date()
  projectStart.setHours(0, 0, 0, 0)

  const viewDay = Math.round((viewDate.getTime() - projectStart.getTime()) / 86400000) + 1

  const colorMap = buildColorMap(tasks)
  const depMap = new Map<string, string[]>()
  for (const task of tasks) {
    if (task.depends_on?.length) depMap.set(task.id, task.depends_on)
  }

  // ─── Строим scheduleMap с час-уровневыми данными ──────────────────────────
  let scheduleMap: Map<string, SchedEntry>

  if (optResult) {
    scheduleMap = new Map()
    for (const ws of optResult.schedule) {
      const hpd = Number(ws.hours_per_day) || 8
      for (const at of ws.assigned_tasks) {
        // start_hour / end_hour приходят из genetic.ts
        const startHour = (at as any).start_hour ?? (at.start_day - 1) * hpd
        const endHour = (at as any).end_hour ?? startHour + at.duration
        scheduleMap.set(at.task_id, {
          startDay: at.start_day,
          endDay: at.end_day,
          userId: ws.user_id,
          startHour,
          endHour,
          workerHpd: hpd,
        })
      }
    }
  } else {
    scheduleMap = buildSchedule(tasks, members, depMap)
  }

  const taskAssignment = new Map<string, string>()
  for (const [taskId, sched] of Array.from(scheduleMap.entries())) {
    taskAssignment.set(taskId, sched.userId)
  }

  const dayTasksByMember = new Map<string, { task: Task; sched: SchedEntry }[]>()
  for (const member of members) {
    dayTasksByMember.set(member.user_id, [])
  }
  for (const task of tasks) {
    const userId = taskAssignment.get(task.id)
    if (!userId) continue
    const sched = scheduleMap.get(task.id)
    if (!sched) continue
    if (viewDay >= sched.startDay && viewDay <= sched.endDay) {
      const existing = dayTasksByMember.get(userId) ?? []
      existing.push({ task, sched })
      dayTasksByMember.set(userId, existing)
    }
  }

  const activeMembers = members.filter(m => (dayTasksByMember.get(m.user_id) ?? []).length > 0)
  const isToday = viewDate.getTime() === today.getTime()
  const now = new Date()
  const currentHour = now.getHours() + now.getMinutes() / 60
  const schedValues = Array.from(scheduleMap.values())
  const maxSched = schedValues.length > 0 ? Math.max(...schedValues.map(s => s.endDay)) : 0

  const allItems = Array.from(dayTasksByMember.values())
  const totalTaskCount = allItems.reduce((s, v) => s + v.length, 0)
  const activeSkills = Array.from(
    new Set(
      allItems.flat().map(({ task }) => task.skill).filter((sk): sk is string => Boolean(sk))
    )
  )

  return (
    <div className="card overflow-hidden">
      {/* Date navigation */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <button onClick={() => setViewDate(d => addDays(d, -1))} className="btn-secondary px-3 py-1.5 text-sm">←</button>
          <button onClick={() => setViewDate(d => addDays(d, 1))} className="btn-secondary px-3 py-1.5 text-sm">→</button>
          <button onClick={() => setViewDate(today)} disabled={isToday} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Today</button>
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-700">{fmtDate(viewDate)}</h2>
          {isToday && <span className="badge bg-indigo-100 text-indigo-700">Today</span>}
          <span className="text-xs text-slate-400">Day {viewDay}</span>
        </div>
        <input
          type="date"
          value={toInputVal(viewDate)}
          onChange={e => { const d = new Date(e.target.value); if (!isNaN(d.getTime())) setViewDate(d) }}
          className="input text-sm"
          style={{ width: 150 }}
        />
      </div>

      {/* No tasks */}
      {activeMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-slate-600 font-medium mb-1">No tasks on this day</p>
          <p className="text-sm text-slate-400">
            {scheduleMap.size === 0 ? 'Run optimization first to generate a schedule' : 'Try navigating to a different day'}
          </p>
          {maxSched > 0 && (
            <button onClick={() => setViewDate(projectStart)} className="btn-secondary text-xs mt-4">Go to Day 1</button>
          )}
        </div>
      ) : (
        <div className="overflow-auto">
          <div style={{ minWidth: 680 }}>
            {/* Hour ruler */}
            <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
              <div className="shrink-0 border-r border-slate-200" style={{ width: 180 }} />
              <div className="flex flex-1">
                {HOURS.map(h => (
                  <div
                    key={h}
                    className={`flex-1 text-center text-[10px] py-1.5 border-r border-slate-200 font-medium ${
                      isToday && Math.floor(currentHour) === h ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400'
                    }`}
                  >
                    {h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
                  </div>
                ))}
              </div>
            </div>

            {/* Member rows */}
            {activeMembers.map(member => {
              const memberItems = dayTasksByMember.get(member.user_id) ?? []
              const hpd = Number(member.hours_per_day) || 8
              const shiftStart = 9
              const shiftEnd = shiftStart + hpd

              return (
                <div key={member.user_id} className="flex border-b border-slate-100 last:border-0" style={{ minHeight: 64 }}>
                  {/* Member label */}
                  <div className="shrink-0 px-4 border-r border-slate-200 flex flex-col justify-center bg-white" style={{ width: 180 }}>
                    <p className="text-sm font-medium text-slate-700 truncate">{member.username}</p>
                    <p className="text-xs text-slate-400">{member.skills.join(', ') || '—'}</p>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 relative" style={{ minHeight: 64 }}>
                    {/* Hour grid */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {HOURS.map(h => (
                        <div
                          key={h}
                          className={`flex-1 border-r border-slate-100 ${h >= shiftStart && h < shiftEnd ? 'bg-slate-50/60' : ''}`}
                        />
                      ))}
                    </div>

                    {/* Current time line */}
                    {isToday && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 z-20 opacity-70"
                        style={{ left: `${(currentHour / 24) * 100}%` }}
                      />
                    )}

                    {/* Task bars — позиционируются по start_hour / end_hour */}
                    {memberItems.map(({ task, sched }, idx) => {
                      const c = colorMap.get(task.skill?.toLowerCase().trim() ?? '') ?? FALLBACK_COLOR
                      const overdue = task.deadline_days != null && sched.endDay > task.deadline_days
                      const barH = 36
                      const gap = 4
                      const top = gap + idx * (barH + gap)

                      // ── Ключевое исправление ──────────────────────────────
                      // Берём реальные часы из расписания и переводим в 24-часовую шкалу
                      // start_hour=0 → 9am (начало рабочего дня), start_hour=4 → 1pm и т.д.
                      const taskStartOnTimeline = shiftStart + (sched.startHour % sched.workerHpd)
                      const taskEndOnTimeline = taskStartOnTimeline + (sched.endHour - sched.startHour)

                      const left = `${(taskStartOnTimeline / 24) * 100}%`
                      const width = `${Math.max(((taskEndOnTimeline - taskStartOnTimeline) / 24) * 100, 2)}%`

                      const externalDeps = (task.depends_on ?? [])
                        .filter(depId => !memberItems.find(it => it.task.id === depId))
                        .map(depId => tasks.find(t => t.id === depId)?.name)
                        .filter((n): n is string => Boolean(n))

                      return (
                        <div
                          key={task.id}
                          className="absolute flex items-center gap-2 px-3 cursor-pointer transition-all hover:brightness-110 select-none rounded-md"
                          style={{
                            left,
                            width,
                            top,
                            height: barH,
                            background: overdue ? '#991b1b' : c.bg,
                            border: `1px solid ${overdue ? '#ef4444' : c.border}`,
                          }}
                          onClick={() => onTaskClick(task)}
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold truncate" style={{ color: c.text }}>
                              {task.name}
                            </span>
                            <span className="text-[10px] opacity-70 truncate" style={{ color: c.text }}>
                              {task.skill} · {task.duration}h
                              {overdue ? ' ⚠ overdue' : ''}
                              {externalDeps.length > 0 ? ` ↳ ${externalDeps.join(', ')}` : ''}
                            </span>
                          </div>
                          <div
                            className="ml-auto shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(0,0,0,0.2)', color: c.text }}
                          >
                            P{task.priority}
                          </div>
                        </div>
                      )
                    })}

                    {/* Stretch container for stacked bars */}
                    <div style={{ height: Math.max(64, memberItems.length * 44 + 8) }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer summary */}
      {activeMembers.length > 0 && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-5 items-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {activeMembers.length} worker{activeMembers.length !== 1 ? 's' : ''} ·{' '}
            {totalTaskCount} task{totalTaskCount !== 1 ? 's' : ''} today
          </span>
          <div className="flex flex-wrap gap-3 ml-auto">
            {activeSkills.map(skill => {
              const c = colorMap.get(skill?.toLowerCase().trim() ?? '') ?? FALLBACK_COLOR
              return (
                <div key={skill} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c.bg, border: `1px solid ${c.border}` }} />
                  {skill}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}