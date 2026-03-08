import { getSession } from '@/lib/auth'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default async function Home() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <span className="text-xl font-bold text-indigo-600">Taskly</span>
        <nav className="hidden sm:flex items-center gap-6">
          <a href="#features" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">Features</a>
          <a href="#how" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">How it works</a>
          <a href="#algo" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">Algorithm</a>
          <Link href="/guide" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">Guide</Link>
        </nav>
        <div className="flex gap-3">
          {session ? (
            <>
              <Link href="/projects" className="btn-primary">My projects →</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">Login</Link>
              <Link href="/register" className="btn-primary">Get started →</Link>
            </>
          )}
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 py-24 text-center">
          {session ? (
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              👋 Welcome back, {session.username}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              ✦ Smart task distribution
            </div>
          )}

          <h1 className="text-5xl font-bold text-slate-800 mb-6 leading-tight">
            Stop manually<br />
            <span className="text-indigo-600">planning tasks</span>
          </h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
            Taskly uses a genetic algorithm to automatically distribute tasks across your team — considering skills, deadlines, priorities, and workload.
          </p>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-10">
            The manager adds tasks, clicks "Optimize" — and gets a ready plan in seconds. No meetings, no spreadsheets, no manual matching.
          </p>

          <div className="flex gap-3 justify-center flex-wrap mb-16">
            {session ? (
              <>
                <Link href="/projects" className="btn-primary text-base px-8 py-3">Open projects →</Link>
                <Link href="/projects?create=1" className="btn-secondary text-base px-8 py-3">+ New project</Link>
              </>
            ) : (
              <>
                <Link href="/register" className="btn-primary text-base px-8 py-3">Start for free →</Link>
                <Link href="/guide" className="btn-secondary text-base px-8 py-3">How it works</Link>
              </>
            )}
          </div>

          {/* Mock kanban */}
          <div className="card overflow-hidden shadow-lg">
            <div className="bg-slate-100 px-4 py-3 flex items-center gap-2 border-b border-slate-200">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-slate-400 font-mono">taskly — Backend Team Q4</span>
              <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">✨ Optimized · Score: 1240</span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                {
                  label: 'To Do', badge: 'bg-slate-100 text-slate-600', accent: 'border-l-slate-400',
                  tasks: ['CI/CD Setup', 'Write tests', 'API Docs']
                },
                {
                  label: 'In Progress', badge: 'bg-blue-100 text-blue-600', accent: 'border-l-blue-500',
                  tasks: ['Auth API', 'Database', 'Deploy to prod']
                },
                {
                  label: 'Done', badge: 'bg-green-100 text-green-600', accent: 'border-l-green-500',
                  tasks: ['UI Prototype', 'Spec approved', 'Design mockup']
                },
              ].map(col => (
                <div key={col.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-600">{col.label}</span>
                    <span className={`badge ${col.badge}`}>{col.tasks.length}</span>
                  </div>
                  {col.tasks.map((t, i) => (
                    <div key={i} className={`h-9 bg-white rounded-lg mb-2 border border-slate-200 border-l-4 ${col.accent} flex items-center px-3`}>
                      <span className="text-xs text-slate-600 truncate">{t}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem → Solution */}
        <section className="bg-white border-y border-slate-200 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-500 px-3 py-1 rounded-full text-xs font-medium mb-4">😤 Without Taskly</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Planning takes hours</h2>
                <ul className="space-y-3">
                  {[
                    'Manager manually picks who does what',
                    'Someone is overloaded, someone has nothing to do',
                    'Deadlines are missed due to dependencies',
                    'Constant meetings about task distribution',
                    'Excel sheets that go stale immediately',
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                      <span className="text-red-400 mt-0.5">✗</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium mb-4">✅ With Taskly</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Algorithm handles everything in seconds</h2>
                <ul className="space-y-3">
                  {[
                    'Automatic distribution by skills',
                    'Balanced workload across the whole team',
                    'Dependencies are respected in planning',
                    'Optimal plan without meetings',
                    'Three views: table, Kanban, Gantt',
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-green-500 mt-0.5">✓</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Everything your team needs</h2>
              <p className="text-slate-500">From task creation to a ready plan in a few clicks</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: '🧬', title: 'Genetic algorithm', desc: '50 variants × 30 generations. Finds the optimal distribution considering all constraints simultaneously.' },
                { icon: '🎯', title: 'Skill matching', desc: 'Each member sets their skills. The algorithm penalizes mismatches and finds the ideal task → assignee pair.' },
                { icon: '📊', title: 'Three plan views', desc: 'Table with filters, Kanban with drag & drop, Gantt chart with a timeline.' },
                { icon: '⚡', title: 'Priorities & deadlines', desc: 'Critical tasks (priority 5) always come first. The algorithm penalizes each day past the deadline.' },
                { icon: '🔗', title: 'Task dependencies', desc: 'Mark that task B depends on task A — and the algorithm guarantees the correct execution order.' },
                { icon: '📈', title: 'Workload metrics', desc: 'See who is loaded at 120% and who at 30%. The algorithm penalizes imbalance and aims for evenness.' },
                { icon: '💬', title: 'Comments', desc: 'The team leaves comments on tasks. All task communication in one place.' },
                { icon: '📋', title: 'Change history', desc: 'Automatic log of every task change — who, what, and when.' },
                { icon: '🔑', title: 'Invite codes', desc: "Invite your team with one code. Manager creates a project and shares the code — that's it." },
              ].map((f, i) => (
                <div key={i} className="card p-6 hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-white border-y border-slate-200 py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">How it works</h2>
              <p className="text-slate-500">From registration to a ready plan — 5 minutes</p>
            </div>
            <div className="space-y-4">
              {[
                { num: '01', role: 'Manager', title: 'Creates a project', desc: 'Clicks "New Project", gets a unique invite code and shares it with the team.' },
                { num: '02', role: 'Team', title: 'Joins by code', desc: 'Each member enters the invite code, sets their skills and available hours per day.' },
                { num: '03', role: 'Manager', title: 'Adds tasks', desc: 'For each task: name, duration in hours, required skill, priority 1–5, deadline, and dependencies.' },
                { num: '04', role: 'Algorithm', title: 'Optimizes the plan', desc: 'After clicking "Optimize", the genetic algorithm builds the optimal distribution in seconds.' },
                { num: '05', role: 'Team', title: 'Gets to work', desc: 'Assignees update task statuses (To Do → In Progress → Done) and write comments.' },
              ].map((s, i) => (
                <div key={i} className="card p-5 flex items-start gap-5">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">{s.num}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{s.title}</h3>
                      <span className="badge bg-slate-100 text-slate-500 text-xs">{s.role}</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/guide" className="btn-secondary">Full guide →</Link>
            </div>
          </div>
        </section>

        {/* Algorithm */}
        <section id="algo" className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Genetic algorithm</h2>
              <p className="text-slate-500 max-w-xl mx-auto">The algorithm is inspired by evolution — the best distributions survive</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">How it works</h3>
                <ol className="space-y-3">
                  {[
                    'Creates 50 random distribution variants',
                    'Evaluates each by the Score formula',
                    'Picks the best 30% — the elite',
                    'Crossbreeds them to produce 50 new variants',
                    'Repeats for 30 generations',
                    'Returns the best variant found',
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Scoring system (base Score = 1000)</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Worker > 8 h/day', val: '−20', color: 'text-red-500' },
                    { label: 'Worker > 10 h/day', val: '−50', color: 'text-red-600' },
                    { label: 'Missing required skill', val: '−50', color: 'text-red-500' },
                    { label: 'Day past deadline', val: '−30', color: 'text-red-500' },
                    { label: 'Dependency violation', val: '−100', color: 'text-red-600' },
                    { label: 'Two tasks at once', val: '−200', color: 'text-red-700' },
                    { label: 'Balanced workload', val: '+50', color: 'text-green-600' },
                    { label: 'Critical task done early', val: '+30', color: 'text-green-600' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{r.label}</span>
                      <span className={`font-mono font-semibold ${r.color}`}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Stats */}
            <div className="bg-indigo-600 rounded-2xl p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { num: '50', label: 'variants', sub: 'per generation' },
                { num: '30', label: 'generations', sub: 'iterations' },
                { num: '11', label: 'criteria', sub: 'scoring' },
                { num: '30%', label: 'elite', sub: 'best' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-white mb-1">{s.num}</div>
                  <div className="text-indigo-100 text-sm font-medium">{s.label}</div>
                  <div className="text-indigo-300 text-xs mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="bg-white border-y border-slate-200 py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Two roles in the system</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-8 border-indigo-200">
                <div className="text-3xl mb-4">👔</div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-slate-800">Manager</h3>
                  <span className="badge bg-indigo-100 text-indigo-700">manager</span>
                </div>
                <ul className="space-y-2">
                  {[
                    'Creates the project and invites team',
                    'Adds, edits and deletes tasks',
                    'Runs optimization',
                    'Sees all three plan views',
                    'Assigns members manually',
                    'Manages member skills',
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-indigo-400 mt-0.5">✓</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-8">
                <div className="text-3xl mb-4">👷</div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-slate-800">Worker</h3>
                  <span className="badge bg-slate-100 text-slate-600">worker</span>
                </div>
                <ul className="space-y-2">
                  {[
                    'Joins the project by code',
                    'Views their tasks',
                    'Updates status: To Do → In Progress → Done',
                    'Writes task comments',
                    'Sets their skills and hours per day',
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-slate-400 mt-0.5">✓</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        {!session && (
          <section className="py-20 text-center">
            <div className="max-w-xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Try it right now</h2>
              <p className="text-slate-500 mb-8">Registration is free. Create a project and run optimization in a couple of minutes.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/register" className="btn-primary text-base px-8 py-3">Sign up →</Link>
                <Link href="/guide" className="btn-secondary text-base px-8 py-3">Read the guide</Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-6 flex items-center justify-between flex-wrap gap-4">
        <span className="text-lg font-bold text-indigo-600">Taskly</span>
        <div className="flex gap-6">
          <Link href="/guide" className="text-sm text-slate-400 hover:text-slate-600">Guide</Link>
          {!session && (
            <>
              <Link href="/login" className="text-sm text-slate-400 hover:text-slate-600">Login</Link>
              <Link href="/register" className="text-sm text-slate-400 hover:text-slate-600">Sign up</Link>
            </>
          )}
        </div>
        <p className="text-sm text-slate-400">Smart task distribution with genetic algorithm</p>
      </footer>
    </div>
  )
}