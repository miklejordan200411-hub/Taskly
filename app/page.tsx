import { getSession } from '@/lib/auth'
import Link from 'next/link'

export default async function Home() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <span className="text-xl font-bold text-indigo-600">Taskly</span>
        <nav className="hidden sm:flex items-center gap-6">
          <a href="#features" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">Функции</a>
          <a href="#how" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">Как работает</a>
          <a href="#algo" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">Алгоритм</a>
          <Link href="/guide" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">Инструкция</Link>
        </nav>
        <div className="flex gap-3">
          {session ? (
            <Link href="/projects" className="btn-primary">Мои проекты →</Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">Войти</Link>
              <Link href="/register" className="btn-primary">Начать →</Link>
            </>
          )}
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 py-24 text-center">
          {session ? (
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              👋 С возвращением, {session.username}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              ✦ Умное распределение задач
            </div>
          )}

          <h1 className="text-5xl font-bold text-slate-800 mb-6 leading-tight">
            Перестань вручную<br />
            <span className="text-indigo-600">планировать задачи</span>
          </h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
            Taskly использует генетический алгоритм чтобы автоматически распределить задачи между командой — с учётом навыков, дедлайнов, приоритетов и нагрузки.
          </p>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-10">
            Менеджер добавляет задачи, нажимает «Оптимизировать» — и за секунды получает готовый план. Без совещаний, без таблиц, без ручного подбора.
          </p>

          <div className="flex gap-3 justify-center flex-wrap mb-16">
            {session ? (
              <>
                <Link href="/projects" className="btn-primary text-base px-8 py-3">Открыть проекты →</Link>
                <Link href="/projects?create=1" className="btn-secondary text-base px-8 py-3">+ Новый проект</Link>
              </>
            ) : (
              <>
                <Link href="/register" className="btn-primary text-base px-8 py-3">Начать бесплатно →</Link>
                <Link href="/guide" className="btn-secondary text-base px-8 py-3">Как это работает</Link>
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
              <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">✨ Оптимизировано · Score: 1240</span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                {
                  label: 'To Do', badge: 'bg-slate-100 text-slate-600', accent: 'border-l-slate-400',
                  tasks: ['Настройка CI/CD', 'Написать тесты', 'Документация API']
                },
                {
                  label: 'In Progress', badge: 'bg-blue-100 text-blue-600', accent: 'border-l-blue-500',
                  tasks: ['Auth API', 'База данных', 'Деплой на прод']
                },
                {
                  label: 'Done', badge: 'bg-green-100 text-green-600', accent: 'border-l-green-500',
                  tasks: ['Прототип UI', 'ТЗ утверждено', 'Дизайн макет']
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
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-500 px-3 py-1 rounded-full text-xs font-medium mb-4">😤 Без Taskly</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Планирование отнимает часы</h2>
                <ul className="space-y-3">
                  {[
                    'Менеджер вручную подбирает кто что делает',
                    'Кто-то перегружен, кто-то сидит без дела',
                    'Дедлайны нарушаются из-за зависимостей',
                    'Постоянные совещания по распределению задач',
                    'Excel таблицы которые сразу устаревают',
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                      <span className="text-red-400 mt-0.5">✗</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium mb-4">✅ С Taskly</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Алгоритм делает всё за секунды</h2>
                <ul className="space-y-3">
                  {[
                    'Автоматическое распределение по навыкам',
                    'Равномерная нагрузка на всю команду',
                    'Зависимости учитываются при планировании',
                    'Оптимальный план без совещаний',
                    'Три вида визуализации: таблица, Канбан, Ганта',
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
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Всё что нужно команде</h2>
              <p className="text-slate-500">От создания задачи до готового плана в несколько кликов</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: '🧬', title: 'Генетический алгоритм', desc: '50 вариантов × 30 поколений. Находит оптимальное распределение учитывая все ограничения одновременно.' },
                { icon: '🎯', title: 'Учёт навыков', desc: 'Каждый участник указывает свои навыки. Алгоритм штрафует за несовпадение и ищет идеальную пару задача → исполнитель.' },
                { icon: '📊', title: 'Три вида плана', desc: 'Таблица с фильтрами, Канбан с drag & drop между колонками, диаграмма Ганта с временной шкалой.' },
                { icon: '⚡', title: 'Приоритеты и дедлайны', desc: 'Критические задачи (приоритет 5) всегда идут первыми. Алгоритм штрафует за каждый день просрочки дедлайна.' },
                { icon: '🔗', title: 'Зависимости задач', desc: 'Укажи что задача B зависит от задачи A — и алгоритм гарантирует правильный порядок выполнения.' },
                { icon: '📈', title: 'Метрики нагрузки', desc: 'Видно кто загружен на 120%, а кто на 30%. Алгоритм штрафует за дисбаланс и стремится к равномерности.' },
                { icon: '💬', title: 'Комментарии', desc: 'Команда оставляет комментарии к задачам. Вся коммуникация по задаче в одном месте.' },
                { icon: '📋', title: 'История изменений', desc: 'Автоматический лог каждого изменения задачи — кто, что и когда поменял.' },
                { icon: '🔑', title: 'Invite-коды', desc: 'Пригласи команду одним кодом. Менеджер создаёт проект и делится кодом — всё.' },
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
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Как это работает</h2>
              <p className="text-slate-500">От регистрации до готового плана — 5 минут</p>
            </div>
            <div className="space-y-4">
              {[
                { num: '01', role: 'Менеджер', title: 'Создаёт проект', desc: 'Нажимает "Новый проект", получает уникальный invite-код и делится им с командой.' },
                { num: '02', role: 'Команда', title: 'Присоединяется по коду', desc: 'Каждый участник вводит invite-код, указывает свои навыки и доступные часы в день.' },
                { num: '03', role: 'Менеджер', title: 'Добавляет задачи', desc: 'Для каждой задачи: название, длительность в часах, нужный навык, приоритет 1-5, дедлайн и зависимости от других задач.' },
                { num: '04', role: 'Алгоритм', title: 'Оптимизирует план', desc: 'После нажатия «Оптимизировать» генетический алгоритм за секунды строит оптимальное распределение.' },
                { num: '05', role: 'Команда', title: 'Работает', desc: 'Исполнители меняют статусы задач (To Do → In Progress → Done), пишут комментарии.' },
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
              <Link href="/guide" className="btn-secondary">Полная инструкция →</Link>
            </div>
          </div>
        </section>

        {/* Algorithm */}
        <section id="algo" className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Генетический алгоритм</h2>
              <p className="text-slate-500 max-w-xl mx-auto">Алгоритм вдохновлён эволюцией — выживают лучшие варианты распределения</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Как работает</h3>
                <ol className="space-y-3">
                  {[
                    'Создаёт 50 случайных вариантов распределения',
                    'Оценивает каждый по формуле Score',
                    'Берёт лучшие 30% — элиту',
                    'Скрещивает их и получает 50 новых вариантов',
                    'Повторяет 30 поколений',
                    'Возвращает лучший найденный вариант',
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Система оценки (базовый Score = 1000)</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Рабочий > 8 ч/день', val: '−20', color: 'text-red-500' },
                    { label: 'Рабочий > 10 ч/день', val: '−50', color: 'text-red-600' },
                    { label: 'Нет нужного навыка', val: '−50', color: 'text-red-500' },
                    { label: 'День просрочки дедлайна', val: '−30', color: 'text-red-500' },
                    { label: 'Нарушение зависимости', val: '−100', color: 'text-red-600' },
                    { label: 'Две задачи одновременно', val: '−200', color: 'text-red-700' },
                    { label: 'Равномерная нагрузка', val: '+50', color: 'text-green-600' },
                    { label: 'Критичная задача выполнена рано', val: '+30', color: 'text-green-600' },
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
                { num: '50', label: 'вариантов', sub: 'в поколении' },
                { num: '30', label: 'поколений', sub: 'итераций' },
                { num: '11', label: 'критериев', sub: 'оценки' },
                { num: '30%', label: 'элита', sub: 'лучших' },
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
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Две роли в системе</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-8 border-indigo-200">
                <div className="text-3xl mb-4">👔</div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-slate-800">Менеджер</h3>
                  <span className="badge bg-indigo-100 text-indigo-700">manager</span>
                </div>
                <ul className="space-y-2">
                  {[
                    'Создаёт проект и приглашает команду',
                    'Добавляет, редактирует и удаляет задачи',
                    'Запускает оптимизацию алгоритмом',
                    'Видит все три вида плана',
                    'Назначает исполнителей вручную',
                    'Управляет навыками участников',
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
                  <h3 className="text-xl font-bold text-slate-800">Работник</h3>
                  <span className="badge bg-slate-100 text-slate-600">worker</span>
                </div>
                <ul className="space-y-2">
                  {[
                    'Присоединяется к проекту по коду',
                    'Видит свои задачи',
                    'Меняет статус: To Do → In Progress → Done',
                    'Пишет комментарии к задачам',
                    'Указывает свои навыки и часы в день',
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
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Попробуй прямо сейчас</h2>
              <p className="text-slate-500 mb-8">Регистрация бесплатная. Создай проект и запусти оптимизацию за пару минут.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/register" className="btn-primary text-base px-8 py-3">Зарегистрироваться →</Link>
                <Link href="/guide" className="btn-secondary text-base px-8 py-3">Читать инструкцию</Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-6 flex items-center justify-between flex-wrap gap-4">
        <span className="text-lg font-bold text-indigo-600">Taskly</span>
        <div className="flex gap-6">
          <Link href="/guide" className="text-sm text-slate-400 hover:text-slate-600">Инструкция</Link>
          {!session && (
            <>
              <Link href="/login" className="text-sm text-slate-400 hover:text-slate-600">Войти</Link>
              <Link href="/register" className="text-sm text-slate-400 hover:text-slate-600">Регистрация</Link>
            </>
          )}
        </div>
        <p className="text-sm text-slate-400">Smart task distribution with genetic algorithm</p>
      </footer>
    </div>
  )
}