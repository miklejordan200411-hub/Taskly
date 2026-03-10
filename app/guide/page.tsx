import Link from 'next/link'
import { getSession } from '@/lib/auth'

export default async function GuidePage() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-indigo-600">Taskly</Link>
        <div className="flex gap-3">
          {session ? (
            <Link href="/projects" className="btn-primary">My projects →</Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">Login</Link>
              <Link href="/register" className="btn-primary">Get started →</Link>
            </>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800 mt-4 mb-3">Guide</h1>
          <p className="text-slate-500 text-lg">Everything you need to know to get started with Taskly</p>
        </div>

        {/* Contents */}
        <div className="card p-5 mb-10">
          <h2 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Contents</h2>
          <ul className="space-y-1">
            {[
              ['#start', '1. Quick start'],
              ['#roles', '2. Roles: manager and worker'],
              ['#projects', '3. Projects and invite codes'],
              ['#tasks', '4. Tasks'],
              ['#optimize', '5. Optimization'],
              ['#views', '6. Plan views'],
              ['#algo', '7. How the algorithm works'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-sm text-indigo-600 hover:underline">{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-12">
          {/* 1 */}
          <section id="start">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">1. Quick start</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Register', desc: 'Go to /register, enter your username, email and password. Takes 30 seconds.' },
                { step: '2', title: 'Create a project', desc: 'On the projects page click "+ New Project", enter a name. You automatically become the manager.' },
                { step: '3', title: 'Invite your team', desc: 'Copy the invite code from the project card and send it to colleagues. They enter it in the "Join by code" field.' },
                { step: '4', title: 'Add tasks', desc: 'Open the project, click "+ Task". Fill in the name, duration in hours, required skill, priority and deadline.' },
                { step: '5', title: 'Run optimization', desc: 'Click "✨ Optimize". The algorithm will distribute all tasks across the team in seconds.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">{s.step}</div>
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-1">{s.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2 */}
          <section id="roles">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">2. Roles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">👔</span>
                  <span className="font-semibold text-slate-800">Manager</span>
                  <span className="badge bg-indigo-100 text-indigo-700 text-xs">manager</span>
                </div>
                <ul className="space-y-1.5 text-sm text-slate-500">
                  {['Creates a project', 'Adds/edits tasks', 'Runs optimization', 'Assigns members', 'Deletes project'].map(t => (
                    <li key={t} className="flex gap-2"><span className="text-indigo-400">✓</span>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">👷</span>
                  <span className="font-semibold text-slate-800">Worker</span>
                  <span className="badge bg-slate-100 text-slate-600 text-xs">worker</span>
                </div>
                <ul className="space-y-1.5 text-sm text-slate-500">
                  {['Joins by code', 'Views their tasks', 'Updates task status', 'Writes comments', 'Sets their skills'].map(t => (
                    <li key={t} className="flex gap-2"><span className="text-slate-400">✓</span>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section id="projects">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">3. Projects and invite codes</h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>Each project is a separate team. When creating a project, a unique invite code is generated like <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">XK9T-Y2MB</code>.</p>
              <p>To invite a colleague: copy the code from the project card and send it. The colleague clicks "Join by code" and enters the code.</p>
              <p>Member skills are set comma-separated in the Members panel (the "👥 Members" button inside the project). For example: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">React, TypeScript, Node</code></p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-700 font-medium text-xs mb-1">⚠️ Important</p>
                <p className="text-amber-600 text-xs">Skills must be set BEFORE running optimization — otherwise the algorithm cannot distribute tasks correctly.</p>
              </div>
            </div>
          </section>

          {/* 4 */}
          <section id="tasks">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">4. Tasks</h2>
            <p className="text-sm text-slate-500 mb-4">When creating a task the following fields are available:</p>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-600">Field</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-600">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Name', 'What needs to be done'],
                    ['Duration', 'How many hours the task will take'],
                    ['Skill', 'What skill the assignee needs (e.g. React)'],
                    ['Priority', '1 (low) — 5 (critical). Affects the planning order'],
                    ['Deadline', 'Day from project start by which the task must be done'],
                    ['Dependencies', 'Tasks that must be completed before this one'],
                    ['Status', 'To Do / In Progress / Done'],
                  ].map(([f, d]) => (
                    <tr key={f} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-700">{f}</td>
                      <td className="px-4 py-2.5 text-slate-500">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 5 */}
          <section id="optimize">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">5. Optimization</h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>The <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">✨ Optimize</span> button is available to managers only. After clicking, the algorithm:</p>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Takes all project tasks</li>
                <li>Takes all members with their skills and hours per day</li>
                <li>Runs the genetic algorithm (50 individuals × 30 generations)</li>
                <li>Assigns tasks to members and saves to the database</li>
                <li>Shows the result: score, number of assigned tasks, and warnings</li>
              </ol>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 font-medium text-xs mb-1">💡 Tip</p>
                <p className="text-blue-600 text-xs">After optimization you can manually reassign any task — just open the task and change the assignee. This does not cancel other assignments.</p>
              </div>
            </div>
          </section>

          {/* 6 */}
          <section id="views">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">6. Plan views</h2>
            <div className="space-y-4">
              {[
                { icon: '📋', title: 'Table', desc: 'All tasks in a table. Filters by status, assignee, priority, and search by name. Status can be changed directly in the table.' },
                { icon: '📌', title: 'Kanban', desc: 'Three columns: To Do, In Progress, Done. Tasks can be dragged between columns. Left border color = task priority.' },
                { icon: '📅', title: 'Gantt chart', desc: 'A timeline with task bars. Shows who does what on which days. Red bar = task is overdue. Below — workload metrics for each member.' },
              ].map((v) => (
                <div key={v.title} className="card p-5 flex gap-4">
                  <span className="text-2xl shrink-0">{v.icon}</span>
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-1">{v.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7 */}
          <section id="algo">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">7. How the algorithm works</h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>The genetic algorithm mimics evolution. Each "distribution variant" is an individual with a set of genes (who does which task).</p>
              <h3 className="font-semibold text-slate-700 mt-4 mb-2">Penalties (lower the Score)</h3>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ['Worker > 8 h/day', '−20'],
                      ['Worker > 10 h/day', '−50'],
                      ['Assignee lacks required skill', '−50'],
                      ['Each day past the deadline', '−30'],
                      ['Task dependency violation', '−100'],
                      ['Two tasks at once for one person', '−200'],
                      ['Low priority before high priority', '−25'],
                      ['Critical task scheduled last', '−40'],
                      ['Workload imbalance > 3 h', '−15'],
                      ['3+ task switches per day', '−15'],
                    ].map(([label, val]) => (
                      <tr key={label} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-500">{label}</td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-red-500">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className="font-semibold text-slate-700 mt-4 mb-2">Bonuses (raise the Score)</h3>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ['Everyone loaded evenly (6–7 h/day)', '+50'],
                      ['High-priority tasks come first', '+20'],
                      ['Critical task completed early', '+30'],
                    ].map(([label, val]) => (
                      <tr key={label} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-500">{label}</td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-green-600">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-16 card p-8 text-center bg-indigo-50 border-indigo-100">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Ready to start?</h2>
          <p className="text-slate-500 text-sm mb-6">Create a project and try optimization right now</p>
          <div className="flex gap-3 justify-center flex-wrap">
            {session ? (
              <Link href="/projects" className="btn-primary px-8 py-2.5">My projects →</Link>
            ) : (
              <>
                <Link href="/register" className="btn-primary px-8 py-2.5">Sign up →</Link>
                <Link href="/login" className="btn-secondary px-8 py-2.5">Login</Link>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-6 flex items-center justify-between flex-wrap gap-4 mt-16">
        <Link href="/" className="text-lg font-bold text-indigo-600">Taskly</Link>
        <p className="text-sm text-slate-400">Smart task distribution with genetic algorithm</p>
        <div className="flex gap-4">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">Home</Link>
          <Link href="/login" className="text-sm text-slate-400 hover:text-slate-600">Login</Link>
        </div>
      </footer>
    </div>
  )
}