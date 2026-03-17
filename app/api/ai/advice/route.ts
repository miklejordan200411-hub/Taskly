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
        `- "${t.name}" (${priorityLabel(t.priority)} priority, ${t.duration}h${t.startsInDays != null ? `, starts in ${t.startsInDays} day${t.startsInDays !== 1 ? 's' : ''}` : ''}${t.deadline_days != null ? `, deadline: day ${t.deadline_days}` : ''})`
      ).join('\n')
    : '(none)'

  return `You are an AI productivity advisor for a project management tool.

Worker: ${workerName}
Today: ${weekday}, ${today}
Working hours per day: ${hoursPerDay}h
Workload today: ${workloadPct}%

Tasks scheduled for today:
${todayLines}

Upcoming tasks (next 3 days):
${upcomingLines}

Write a short, practical daily briefing for ${workerName}. Format it exactly like this:

${tasksToday.length > 0
  ? `Advice:\n\n1. [First recommendation based on today's highest-priority or most urgent task]\n2. [Second recommendation]\n3. [Third recommendation about workload management or preparation]`
  : `You have no tasks scheduled for today.\n\nSuggestion:\n\n[1-2 sentences about what to prepare based on upcoming tasks]\n\nRecommended:\n• [specific preparation action]\n• [specific preparation action]`
}

Rules:
- Be direct and specific, mention task names
- Keep each point to 1-2 sentences max
- No greetings, no sign-offs, no markdown headers
- Sound like a smart colleague, not a corporate chatbot
- If workload > 90%, warn about overload
- If workload < 30%, suggest proactive preparation`
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
        temperature: 0.7,
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