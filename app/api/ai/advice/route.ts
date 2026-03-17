import { NextResponse } from 'next/server'

// Uses Groq API — genuinely free, no credit card needed
// Get your key at: https://console.groq.com → API Keys → Create key
// Add to .env.local: GROQ_API_KEY=gsk_...

interface TaskInfo {
  name: string
  skill?: string
  duration: number
  priority: number
  deadline_days?: number | null
}

interface UpcomingTaskInfo extends TaskInfo {
  startsInDays: number | null
}

interface RequestBody {
  workerName: string
  today: string
  weekday: string
  workloadPct: number
  hoursPerDay: number
  tasksToday: TaskInfo[]
  upcomingTasks: UpcomingTaskInfo[]
}

function buildPrompt(body: RequestBody): string {
  const { workerName, today, weekday, workloadPct, hoursPerDay, tasksToday, upcomingTasks } = body

  const priorityLabel = (p: number) =>
    p === 5 ? 'critical' : p === 4 ? 'high' : p === 3 ? 'medium' : p === 2 ? 'low' : 'minimal'

  const todayLines = tasksToday.length > 0
    ? tasksToday.map(t =>
        `- "${t.name}" (${priorityLabel(t.priority)} priority, ${t.duration}h${t.skill ? `, skill: ${t.skill}` : ''}${t.deadline_days != null ? `, deadline: day ${t.deadline_days}` : ''})`
      ).join('\n')
    : '(none)'

  const upcomingLines = upcomingTasks.length > 0
    ? upcomingTasks.map(t =>
        `- "${t.name}" (${priorityLabel(t.priority)} priority, ${t.duration}h${t.skill ? `, skill: ${t.skill}` : ''}${t.startsInDays != null ? `, starts in ${t.startsInDays} day${t.startsInDays !== 1 ? 's' : ''}` : ''}${t.deadline_days != null ? `, deadline: day ${t.deadline_days}` : ''})`
      ).join('\n')
    : '(none)'

  return `You are an AI productivity advisor. Be direct and specific — always mention exact task names.

Worker: ${workerName}
Today: ${weekday}, ${today}
Working hours per day: ${hoursPerDay}h
Workload today: ${workloadPct}%

Tasks scheduled for today:
${todayLines}

Upcoming tasks (next 3 days):
${upcomingLines}

Write one numbered piece of advice per task — only for tasks in today's list and upcoming list. Maximum 10 points total. Do not add generic advice not tied to a specific task.

Advice:

[Numbered list — one point per task]

Hard rules — follow these exactly:
- Address ${workerName} directly using "you" and "your" — never use their name or third person like "he", "she", "Alnazar"
- One numbered point per task, do not add extra points beyond the task list
- Every point must contain the task name in quotes
- Only give advice about tasks that exist in the lists above — do not invent generic tips
- Use action verbs: "complete", "finish", "start", "review", "prepare", "test" — never "consider" or "think about"
- If a task deadline is tomorrow or day 1, say "deadline tomorrow" explicitly
- If workload > 85%, add a warning about overload at the end — otherwise no workload comment
- Maximum 2 sentences per point
- No greetings, no sign-offs, no markdown headers or bullets`
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not set — add it to .env.local' },
        { status: 500 }
      )
    }

    const body: RequestBody = await req.json()
    const prompt = buildPrompt(body)

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 400,
        temperature: 0.5,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq API error: ${err}`)
    }

    const data = await res.json()
    const advice: string = data.choices?.[0]?.message?.content ?? 'No advice generated.'

    return NextResponse.json({ advice: advice.trim() })
  } catch (err: any) {
    console.error('AI advice error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Failed to generate advice' },
      { status: 500 }
    )
  }
}