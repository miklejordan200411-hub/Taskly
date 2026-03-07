import { Task, ProjectMember, OptimizationResult, AssignedTask, WorkerSchedule } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Individual {
  // assignments[i] = index into workers array (or -1 = unassigned)
  assignments: number[]
  score: number
}

interface EvaluationInput {
  tasks: Task[]
  workers: ProjectMember[]
  dependencies: { task_id: string; depends_on_id: string }[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const POPULATION_SIZE = 50
const GENERATIONS = 30
const ELITE_RATIO = 0.3
const MUTATION_RATE = 0.1

// ─── Score penalties & bonuses ────────────────────────────────────────────────

const PENALTY = {
  OVERWORK_8H: -20,
  OVERWORK_10H: -50,
  WRONG_SKILL: -50,
  DEADLINE_MISS_PER_DAY: -30,
  DEPENDENCY_VIOLATED: -100,
  DOUBLE_ASSIGNED: -200,
  LOW_PRIORITY_FIRST: -25,
  CRITICAL_LATE: -40,
  LOAD_IMBALANCE: -15,
  UNDERWORK: -10,
  TASK_SWITCHING: -15,
}

const BONUS = {
  EVEN_LOAD: 50,
  HIGH_PRIORITY_FIRST: 20,
  CRITICAL_EARLY: 30,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Build a schedule: given assignments, figure out start/end days for each task
function buildSchedule(
  assignments: number[],
  tasks: Task[],
  workers: ProjectMember[],
  depMap: Map<string, string[]>
): { taskId: string; workerId: string; startDay: number; endDay: number }[] {
  // Track days used per worker
  const workerDay: number[] = new Array(workers.length).fill(1)
  const taskEnd: Map<string, number> = new Map()
  const result: { taskId: string; workerId: string; startDay: number; endDay: number }[] = []

  // Topological sort by dependencies + priority
  const sorted = topoSort(tasks, depMap)

  for (const task of sorted) {
    const idx = tasks.indexOf(task)
    const workerIdx = assignments[idx]
    if (workerIdx === -1) continue

    const worker = workers[workerIdx]
    const hoursPerDay = Number(worker.hours_per_day) || 8

    // Earliest start = after all dependencies finish
    const deps = depMap.get(task.id) || []
    let earliest = workerDay[workerIdx]
    for (const depId of deps) {
      const depEnd = taskEnd.get(depId) ?? 0
      earliest = Math.max(earliest, depEnd + 1)
    }

    const daysNeeded = Math.ceil(Number(task.duration) / hoursPerDay)
    const startDay = Math.max(workerDay[workerIdx], earliest)
    const endDay = startDay + daysNeeded - 1

    workerDay[workerIdx] = endDay + 1
    taskEnd.set(task.id, endDay)

    result.push({ taskId: task.id, workerId: workers[workerIdx].user_id, startDay, endDay })
  }

  return result
}

// Simple topological sort (DFS)
function topoSort(tasks: Task[], depMap: Map<string, string[]>): Task[] {
  const taskById = new Map(tasks.map((t) => [t.id, t]))
  const visited = new Set<string>()
  const result: Task[] = []

  function visit(id: string) {
    if (visited.has(id)) return
    visited.add(id)
    const deps = depMap.get(id) || []
    for (const dep of deps) {
      if (taskById.has(dep)) visit(dep)
    }
    const task = taskById.get(id)
    if (task) result.push(task)
  }

  // Sort by priority desc before visiting (helps score)
  const sorted = [...tasks].sort((a, b) => b.priority - a.priority)
  for (const t of sorted) visit(t.id)
  return result
}

// ─── Fitness function ─────────────────────────────────────────────────────────

function evaluate(
  individual: Individual,
  tasks: Task[],
  workers: ProjectMember[],
  depMap: Map<string, string[]>
): number {
  let score = 1000
  const schedule = buildSchedule(individual.assignments, tasks, workers, depMap)
  const schedMap = new Map(schedule.map((s) => [s.taskId, s]))

  // --- Per-worker daily hours ---
  const workerDailyHours: Map<string, Map<number, number>> = new Map()
  for (const s of schedule) {
    if (!workerDailyHours.has(s.workerId)) workerDailyHours.set(s.workerId, new Map())
    const dayMap = workerDailyHours.get(s.workerId)!
    const task = tasks.find((t) => t.id === s.taskId)!
    const worker = workers.find((w) => w.user_id === s.workerId)!
    const hoursPerDay = Number(worker.hours_per_day) || 8
    const days = s.endDay - s.startDay + 1
    const dailyH = Number(task.duration) / days
    for (let d = s.startDay; d <= s.endDay; d++) {
      dayMap.set(d, (dayMap.get(d) || 0) + dailyH)
    }
  }

  for (const [, dayMap] of workerDailyHours) {
    for (const [, hours] of dayMap) {
      if (hours > 10) score += PENALTY.OVERWORK_10H
      else if (hours > 8) score += PENALTY.OVERWORK_8H
      if (hours < 4) score += PENALTY.UNDERWORK
    }
  }

  // --- Skill match ---
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const wIdx = individual.assignments[i]
    if (wIdx === -1) continue
    const worker = workers[wIdx]
    if (task.skill && !worker.skills.includes(task.skill)) {
      score += PENALTY.WRONG_SKILL
    }
  }

  // --- Deadlines ---
  for (const s of schedule) {
    const task = tasks.find((t) => t.id === s.taskId)!
    if (task.deadline_days != null && s.endDay > task.deadline_days) {
      const overdue = s.endDay - task.deadline_days
      score += PENALTY.DEADLINE_MISS_PER_DAY * overdue
      if (task.priority === 5) score += PENALTY.CRITICAL_LATE
    } else if (task.priority === 5 && task.deadline_days != null) {
      score += BONUS.CRITICAL_EARLY
    }
  }

  // --- Dependency violations ---
  for (const [taskId, deps] of depMap) {
    const s = schedMap.get(taskId)
    if (!s) continue
    for (const depId of deps) {
      const depS = schedMap.get(depId)
      if (!depS) continue
      if (s.startDay <= depS.endDay) {
        score += PENALTY.DEPENDENCY_VIOLATED
      }
    }
  }

  // --- Double assigned on same day ---
  const workerDayTasks: Map<string, Map<number, number>> = new Map()
  for (const s of schedule) {
    if (!workerDayTasks.has(s.workerId)) workerDayTasks.set(s.workerId, new Map())
    const dayMap = workerDayTasks.get(s.workerId)!
    for (let d = s.startDay; d <= s.endDay; d++) {
      dayMap.set(d, (dayMap.get(d) || 0) + 1)
    }
  }
  for (const [, dayMap] of workerDayTasks) {
    for (const [, count] of dayMap) {
      if (count > 1) score += PENALTY.DOUBLE_ASSIGNED
    }
  }

  // --- Load imbalance ---
  const totalHours = workers.map((w) => {
    const wSchedule = schedule.filter((s) => s.workerId === w.user_id)
    return wSchedule.reduce((sum, s) => {
      const task = tasks.find((t) => t.id === s.taskId)!
      return sum + Number(task.duration)
    }, 0)
  })
  if (totalHours.length > 1) {
    const max = Math.max(...totalHours)
    const min = Math.min(...totalHours)
    if (max - min > 3) score += PENALTY.LOAD_IMBALANCE * Math.floor((max - min) / 3)
    const avg = totalHours.reduce((a, b) => a + b, 0) / totalHours.length
    if (totalHours.every((h) => h >= avg * 0.85 && h <= avg * 1.15)) {
      score += BONUS.EVEN_LOAD
    }
  }

  // --- Priority order bonus ---
  const byWorker: Map<string, typeof schedule> = new Map()
  for (const s of schedule) {
    if (!byWorker.has(s.workerId)) byWorker.set(s.workerId, [])
    byWorker.get(s.workerId)!.push(s)
  }
  for (const [, wSchedule] of byWorker) {
    const sorted = [...wSchedule].sort((a, b) => a.startDay - b.startDay)
    let prevPriority = 6
    let allHighFirst = true
    for (const s of sorted) {
      const task = tasks.find((t) => t.id === s.taskId)!
      if (task.priority > prevPriority) allHighFirst = false
      prevPriority = task.priority
    }
    if (allHighFirst) score += BONUS.HIGH_PRIORITY_FIRST
  }

  return score
}

// ─── Genetic operators ────────────────────────────────────────────────────────

function createRandom(taskCount: number, workerCount: number): Individual {
  const assignments = Array.from({ length: taskCount }, () =>
    workerCount > 0 ? randomInt(0, workerCount - 1) : -1
  )
  return { assignments, score: 0 }
}

function crossover(a: Individual, b: Individual): Individual {
  const point = randomInt(1, a.assignments.length - 1)
  const assignments = [
    ...a.assignments.slice(0, point),
    ...b.assignments.slice(point),
  ]
  return { assignments, score: 0 }
}

function mutate(ind: Individual, workerCount: number): Individual {
  const assignments = [...ind.assignments]
  for (let i = 0; i < assignments.length; i++) {
    if (Math.random() < MUTATION_RATE && workerCount > 0) {
      assignments[i] = randomInt(0, workerCount - 1)
    }
  }
  return { assignments, score: 0 }
}

// ─── Main exported function ───────────────────────────────────────────────────

export function runGeneticOptimization(input: EvaluationInput): OptimizationResult {
  const { tasks, workers, dependencies } = input

  if (tasks.length === 0 || workers.length === 0) {
    return {
      score: 0,
      assignments: [],
      schedule: [],
      warnings: workers.length === 0 ? ['No workers in project'] : ['No tasks to optimize'],
    }
  }

  // Build dependency map: taskId -> [dependsOnIds]
  const depMap = new Map<string, string[]>()
  for (const dep of dependencies) {
    if (!depMap.has(dep.task_id)) depMap.set(dep.task_id, [])
    depMap.get(dep.task_id)!.push(dep.depends_on_id)
  }

  // Initialize population
  let population: Individual[] = Array.from({ length: POPULATION_SIZE }, () =>
    createRandom(tasks.length, workers.length)
  )

  // Evaluate initial population
  for (const ind of population) {
    ind.score = evaluate(ind, tasks, workers, depMap)
  }

  // Evolution loop
  for (let gen = 0; gen < GENERATIONS; gen++) {
    // Sort by score descending
    population.sort((a, b) => b.score - a.score)

    const eliteCount = Math.floor(POPULATION_SIZE * ELITE_RATIO)
    const elites = population.slice(0, eliteCount)

    // Generate new population
    const newPop: Individual[] = [...elites]
    while (newPop.length < POPULATION_SIZE) {
      const parentA = elites[randomInt(0, elites.length - 1)]
      const parentB = elites[randomInt(0, elites.length - 1)]
      let child = crossover(parentA, parentB)
      child = mutate(child, workers.length)
      child.score = evaluate(child, tasks, workers, depMap)
      newPop.push(child)
    }

    population = newPop
  }

  // Best individual
  population.sort((a, b) => b.score - a.score)
  const best = population[0]
  const schedule = buildSchedule(best.assignments, tasks, workers, depMap)

  // Build result assignments
  const assignments = schedule.map((s) => ({
    task_id: s.taskId,
    user_id: s.workerId,
    start_day: s.startDay,
    end_day: s.endDay,
  }))

  // Build worker schedule summary
  const workerSchedules: WorkerSchedule[] = workers.map((w) => {
    const wItems = schedule.filter((s) => s.workerId === w.user_id)
    const assignedTasks: AssignedTask[] = wItems.map((s) => {
      const task = tasks.find((t) => t.id === s.taskId)!
      return {
        task_id: s.taskId,
        task_name: task.name,
        skill: task.skill,
        duration: Number(task.duration),
        priority: task.priority,
        start_day: s.startDay,
        end_day: s.endDay,
        deadline_days: task.deadline_days,
      }
    })
    const totalHours = assignedTasks.reduce((sum, t) => sum + t.duration, 0)
    const totalAvailableHours = Number(w.hours_per_day) * 20 // assume 20 working days
    return {
      user_id: w.user_id,
      username: w.username || w.user_id,
      hours_per_day: Number(w.hours_per_day),
      skills: w.skills,
      assigned_tasks: assignedTasks,
      total_hours: totalHours,
      utilization_percent: Math.round((totalHours / totalAvailableHours) * 100),
    }
  })

  // Warnings
  const warnings: string[] = []
  for (const ws of workerSchedules) {
    if (ws.utilization_percent > 110) warnings.push(`${ws.username} is overloaded`)
    if (ws.utilization_percent < 20) warnings.push(`${ws.username} is underutilized`)
  }
  for (const s of schedule) {
    const task = tasks.find((t) => t.id === s.taskId)!
    if (task.deadline_days != null && s.endDay > task.deadline_days) {
      warnings.push(`Task "${task.name}" misses deadline by ${s.endDay - task.deadline_days} day(s)`)
    }
  }

  return { score: best.score, assignments, schedule: workerSchedules, warnings }
}
