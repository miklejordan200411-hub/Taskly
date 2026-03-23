import { NextResponse } from 'next/server'

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
  workerSkills: string[]
  tasksToday: TaskInfo[]
  upcomingTasks: UpcomingTaskInfo[]
}

function buildPrompt(body: RequestBody): string {
  const { workerName, today, weekday, workloadPct, hoursPerDay, workerSkills, tasksToday, upcomingTasks } = body

  const priorityLabel = (p: number) =>
    p === 5 ? 'CRITICAL' : p === 4 ? 'HIGH' : p === 3 ? 'medium' : p === 2 ? 'low' : 'minimal'

  const noTasks = tasksToday.length === 0 && upcomingTasks.length === 0
  const skills = workerSkills.length > 0 ? workerSkills.join(', ') : 'general'

  // ── Empty day: give skill-based suggestions ───────────────────────────────
  if (noTasks) {
    return `You are a brutally practical task advisor. No fluff. Pure actionable advice.

Worker: ${workerName}
Today: ${weekday}, ${today}
Skills: ${skills}
Hours per day: ${hoursPerDay}h
Status: No tasks assigned today or in the next 3 days.

Give 3-4 realistic suggestions based on their skills: ${skills}.

FORMAT:
→ [one sentence: what to do and why it helps]

Good examples for a designer:
→ Review your last UI project and fix inconsistent spacing — consistency separates junior from senior work.
→ Explore a new Figma plugin — saves time on tasks you repeat every week.
→ Study one well-designed app and note 3 things that work — trains your eye faster than any tutorial.

Good examples for a developer:
→ Refactor the messiest function in your codebase — easier to maintain when real tasks arrive.
→ Read the docs for a library you use daily but never fully learned — pays off every sprint.

STRICT RULES:
1. Format: → advice. One line per suggestion.
2. ONE sentence. Natural, human language.
3. NO fake numbers — never write "50 files", "500 words", "30 seconds", "10 components".
4. NO made-up project tasks — give real habits and practices tied to the skill.
5. Never use: "consider", "think about", "make sure", "try to", "develop a X-minute", "create a X-word"
6. End with exactly: "✓ Free day — good time to get ahead."
7. No intro, no sign-off, no headers.`
  }

  // ── Normal day: task-by-task advice ──────────────────────────────────────
  const todayLines = tasksToday.map(t =>
    `- "${t.name}" | skill: ${t.skill || 'none'} | duration: ${t.duration}h | priority: ${priorityLabel(t.priority)}${t.deadline_days != null ? ` | deadline: day ${t.deadline_days}` : ''}`
  ).join('\n')

  const upcomingLines = upcomingTasks.length > 0
    ? upcomingTasks.map(t =>
        `- "${t.name}" | skill: ${t.skill || 'none'} | duration: ${t.duration}h | priority: ${priorityLabel(t.priority)}${t.startsInDays != null ? ` | starts in ${t.startsInDays}d` : ''}${t.deadline_days != null ? ` | deadline: day ${t.deadline_days}` : ''}`
      ).join('\n')
    : '(none)'

  return `You are a brutally practical task advisor. No fluff. No motivation. Pure actionable advice.

Worker: ${workerName}
Today: ${weekday}, ${today}
Skills: ${skills}
Hours per day: ${hoursPerDay}h
Workload today: ${workloadPct}%

TODAY'S TASKS:
${todayLines}

UPCOMING (next 3 days):
${upcomingLines}

FORMAT — follow exactly for every task:
"Task name" → [one sharp sentence: what to do, how, why it matters right now]

Good examples:
"Design mockup" → Focus on mobile layout first — it takes 60% of time and is due soonest.
"Backend API" → Write the auth endpoint today — it blocks two other tasks.
"Code review" → Do it first thing — it's 30 min and unblocks your teammate.

Bad examples (never do this):
"Design mockup" → Consider thinking about your approach to the design.
"Backend API" → Make sure you allocate enough time for this important task.

RULES:
1. One line per task. No more, no less.
2. Format must be: "Task name" → advice. Always use →
3. Advice is ONE sentence. Concrete action. No filler words.
4. Mention the skill, tool or method when relevant (e.g. "use Figma", "write unit tests", "use Postman").
5. If deadline is day 1 or tomorrow — start with "DEADLINE TOMORROW —"
6. If priority is CRITICAL — start with "CRITICAL —"
7. If workload > 85% — add one final line: "⚠ Overload: ${workloadPct}% — drop or postpone a low-priority task."
8. If workload < 20% — add one final line: "✓ Light day — pull in an upcoming task early."
9. Never use: "consider", "think about", "make sure", "ensure", "try to", "remember to"
10. Only give advice for tasks in the list above. Never invent new tasks.
11. No intro, no sign-off, no headers.`
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not set. Add it to .env.local — get a free key at console.groq.com' },
        { status: 500 }
      )
    }

    let body: RequestBody
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body — expected JSON' }, { status: 400 })
    }

    if (!body.workerName || !body.tasksToday) {
      return NextResponse.json({ error: 'Missing required fields: workerName, tasksToday' }, { status: 400 })
    }

    // Default skills to empty array if not sent by older client
    body.workerSkills = body.workerSkills ?? []

    const prompt = buildPrompt(body)

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 500,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'You are a concise task advisor. Output only a short list of actionable one-liners. No greetings, no explanations, no filler.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (res.status === 401) {
      return NextResponse.json({ error: 'Invalid Groq API key — check your GROQ_API_KEY in .env.local' }, { status: 500 })
    }
    if (res.status === 429) {
      return NextResponse.json({ error: 'Groq rate limit hit — wait a moment and try again' }, { status: 429 })
    }
    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Groq API error ${res.status}: ${errText}`)
    }

    const data = await res.json()
    const advice: string = data.choices?.[0]?.message?.content ?? ''

    if (!advice.trim()) {
      return NextResponse.json({ error: 'AI returned an empty response — try again' }, { status: 500 })
    }

    return NextResponse.json({ advice: advice.trim() })

  } catch (err: any) {
    console.error('AI advice error:', err)

    if (err.message?.includes('fetch')) {
      return NextResponse.json({ error: 'Cannot reach Groq API — check your internet connection' }, { status: 500 })
    }

    return NextResponse.json(
      { error: err?.message ?? 'Something went wrong generating advice' },
      { status: 500 }
    )
  }
}