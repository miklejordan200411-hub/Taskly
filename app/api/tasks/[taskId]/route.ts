import { NextRequest, NextResponse } from 'next/server'
import { query, withTransaction } from '@/lib/db'
import { getSession } from '@/lib/auth'

type Params = { params: { taskId: string } }

// PATCH /api/tasks/[taskId]
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, duration, skill, priority, deadline_days, assigned_to, status, depends_on } = body

  // Get task to find project
  const taskRows = await query(`SELECT * FROM tasks WHERE id = $1`, [params.taskId])
  if (taskRows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const task = taskRows[0]

  // Check member
  const member = await query(
    `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2 AND removed_at IS NULL`,
    [task.project_id, session.sub]
  )
  if (member.length === 0) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const isManager = member[0].role === 'manager'

  // Workers can only update status
  const updates: string[] = []
  const values: any[] = []
  let i = 1

  if (status !== undefined) { updates.push(`status = $${i++}`); values.push(status) }
  if (isManager) {
    if (name !== undefined) { updates.push(`name = $${i++}`); values.push(name) }
    if (duration !== undefined) { updates.push(`duration = $${i++}`); values.push(duration) }
    if (skill !== undefined) { updates.push(`skill = $${i++}`); values.push(skill) }
    if (priority !== undefined) { updates.push(`priority = $${i++}`); values.push(priority) }
    if (deadline_days !== undefined) { updates.push(`deadline_days = $${i++}`); values.push(deadline_days) }
    if (assigned_to !== undefined) { updates.push(`assigned_to = $${i++}`); values.push(assigned_to) }
  }

  if (updates.length === 0 && depends_on === undefined) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  let updatedTask = task
  if (updates.length > 0) {
    values.push(params.taskId)
    const rows = await withTransaction(session.sub, async (client) => {
      const res = await client.query(
        `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
        values
      )
      return res.rows
    })
    updatedTask = rows[0]
  }

  // Update dependencies if manager
  if (isManager && depends_on !== undefined) {
    await query(`DELETE FROM task_dependencies WHERE task_id = $1`, [params.taskId])
    for (const depId of depends_on) {
      await query(
        `INSERT INTO task_dependencies (task_id, depends_on_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [params.taskId, depId]
      )
    }
  }

  return NextResponse.json(updatedTask)
}

// DELETE /api/tasks/[taskId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const taskRows = await query(`SELECT * FROM tasks WHERE id = $1`, [params.taskId])
  if (taskRows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const task = taskRows[0]

  const member = await query(
    `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2 AND removed_at IS NULL`,
    [task.project_id, session.sub]
  )
  if (member.length === 0 || member[0].role !== 'manager') {
    return NextResponse.json({ error: 'Only managers can delete tasks' }, { status: 403 })
  }

  await query(`DELETE FROM tasks WHERE id = $1`, [params.taskId])
  return NextResponse.json({ ok: true })
}
