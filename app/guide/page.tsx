import Link from 'next/link'

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-indigo-600">Taskly</Link>
        <div className="flex gap-3">
          <Link href="/login" className="btn-secondary">Войти</Link>
          <Link href="/register" className="btn-primary">Начать →</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">← На главную</Link>
          <h1 className="text-4xl font-bold text-slate-800 mt-4 mb-3">Инструкция</h1>
          <p className="text-slate-500 text-lg">Всё что нужно знать чтобы начать работу с Taskly</p>
        </div>

        {/* Contents */}
        <div className="card p-5 mb-10">
          <h2 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Содержание</h2>
          <ul className="space-y-1">
            {[
              ['#start', '1. Быстрый старт'],
              ['#roles', '2. Роли: менеджер и работник'],
              ['#projects', '3. Проекты и invite-коды'],
              ['#tasks', '4. Задачи'],
              ['#optimize', '5. Оптимизация'],
              ['#views', '6. Виды плана'],
              ['#algo', '7. Как работает алгоритм'],
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
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">1. Быстрый старт</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Зарегистрируйся', desc: 'Перейди на /register, введи username, email и пароль. Это займёт 30 секунд.' },
                { step: '2', title: 'Создай проект', desc: 'На странице проектов нажми "+ New Project", введи название. Ты автоматически становишься менеджером.' },
                { step: '3', title: 'Пригласи команду', desc: 'Скопируй invite-код проекта (он виден в карточке проекта) и отправь коллегам. Они вводят его на странице проектов в поле "Join by code".' },
                { step: '4', title: 'Добавь задачи', desc: 'Открой проект, нажми "+ Task". Заполни название, длительность в часах, нужный навык, приоритет и дедлайн.' },
                { step: '5', title: 'Запусти оптимизацию', desc: 'Нажми кнопку "✨ Optimize". Алгоритм за секунды распределит все задачи по команде.' },
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
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">2. Роли</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">👔</span>
                  <span className="font-semibold text-slate-800">Менеджер</span>
                  <span className="badge bg-indigo-100 text-indigo-700 text-xs">manager</span>
                </div>
                <ul className="space-y-1.5 text-sm text-slate-500">
                  {['Создаёт проект', 'Добавляет/редактирует задачи', 'Запускает оптимизацию', 'Назначает исполнителей', 'Удаляет проект'].map(t => (
                    <li key={t} className="flex gap-2"><span className="text-indigo-400">✓</span>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">👷</span>
                  <span className="font-semibold text-slate-800">Работник</span>
                  <span className="badge bg-slate-100 text-slate-600 text-xs">worker</span>
                </div>
                <ul className="space-y-1.5 text-sm text-slate-500">
                  {['Присоединяется по коду', 'Видит свои задачи', 'Меняет статус задач', 'Пишет комментарии', 'Указывает навыки'].map(t => (
                    <li key={t} className="flex gap-2"><span className="text-slate-400">✓</span>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section id="projects">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">3. Проекты и invite-коды</h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>Каждый проект — отдельная команда. При создании проекта автоматически генерируется уникальный invite-код вида <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">XK9T-Y2MB</code>.</p>
              <p>Чтобы пригласить коллегу: скопируй код из карточки проекта на странице проектов и отправь ему. Коллега нажимает "Join by code" и вводит код.</p>
              <p>Навыки участников указываются через запятую в панели Members (кнопка "👥 Members" внутри проекта). Например: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">React, TypeScript, Node</code></p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-700 font-medium text-xs mb-1">⚠️ Важно</p>
                <p className="text-amber-600 text-xs">Навыки нужно указать ДО запуска оптимизации — иначе алгоритм не сможет правильно распределить задачи.</p>
              </div>
            </div>
          </section>

          {/* 4 */}
          <section id="tasks">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">4. Задачи</h2>
            <p className="text-sm text-slate-500 mb-4">При создании задачи доступны следующие поля:</p>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-600">Поле</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-600">Описание</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Название', 'Что нужно сделать'],
                    ['Длительность', 'Сколько часов займёт задача'],
                    ['Навык', 'Какой навык нужен исполнителю (например React)'],
                    ['Приоритет', '1 (низкий) — 5 (критический). Влияет на порядок планирования'],
                    ['Дедлайн', 'День от старта проекта к которому задача должна быть готова'],
                    ['Зависимости', 'Задачи которые должны быть выполнены перед этой'],
                    ['Статус', 'To Do / In Progress / Done'],
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
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">5. Оптимизация</h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>Кнопка <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">✨ Optimize</span> доступна только менеджеру. После нажатия алгоритм:</p>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Берёт все задачи проекта</li>
                <li>Берёт всех участников с их навыками и часами в день</li>
                <li>Запускает генетический алгоритм (50 особей × 30 поколений)</li>
                <li>Назначает задачи исполнителям и сохраняет в БД</li>
                <li>Показывает результат: score, количество назначенных задач и предупреждения</li>
              </ol>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 font-medium text-xs mb-1">💡 Совет</p>
                <p className="text-blue-600 text-xs">После оптимизации можно вручную переназначить любую задачу — просто открой задачу и смени исполнителя. Это не отменяет остальные назначения.</p>
              </div>
            </div>
          </section>

          {/* 6 */}
          <section id="views">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">6. Виды плана</h2>
            <div className="space-y-4">
              {[
                { icon: '📋', title: 'Table (Таблица)', desc: 'Все задачи в виде таблицы. Есть фильтры по статусу, исполнителю, приоритету и поиск по названию. Статус можно менять прямо в таблице.' },
                { icon: '📌', title: 'Kanban', desc: 'Три колонки: To Do, In Progress, Done. Задачи можно перетаскивать между колонками drag & drop. Цвет левой полоски = приоритет задачи.' },
                { icon: '📅', title: 'Gantt (Диаграмма Ганта)', desc: 'Временная шкала с полосками задач. Показывает кто что делает в какие дни. Красная полоска = задача просрочена. Внизу — метрики нагрузки каждого участника.' },
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
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">7. Как работает алгоритм</h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>Генетический алгоритм имитирует эволюцию. Каждый "вариант распределения" — это особь с набором генов (кто делает какую задачу).</p>
              <h3 className="font-semibold text-slate-700 mt-4 mb-2">Штрафы (снижают Score)</h3>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ['Рабочий > 8 ч/день', '−20'],
                      ['Рабочий > 10 ч/день', '−50'],
                      ['Нет нужного навыка у исполнителя', '−50'],
                      ['Каждый день просрочки дедлайна', '−30'],
                      ['Нарушение зависимости задач', '−100'],
                      ['Две задачи одновременно у одного', '−200'],
                      ['Низкий приоритет раньше высокого', '−25'],
                      ['Критическая задача в конце', '−40'],
                      ['Дисбаланс нагрузки > 3 ч', '−15'],
                      ['3+ переключения задач за день', '−15'],
                    ].map(([label, val]) => (
                      <tr key={label} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-500">{label}</td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-red-500">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className="font-semibold text-slate-700 mt-4 mb-2">Бонусы (повышают Score)</h3>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ['Все загружены равномерно (6–7 ч/день)', '+50'],
                      ['Высокоприоритетные задачи идут первыми', '+20'],
                      ['Критическая задача выполняется рано', '+30'],
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
          <h2 className="text-xl font-bold text-slate-800 mb-2">Готов начать?</h2>
          <p className="text-slate-500 text-sm mb-6">Создай проект и попробуй оптимизацию прямо сейчас</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register" className="btn-primary px-8 py-2.5">Зарегистрироваться →</Link>
            <Link href="/login" className="btn-secondary px-8 py-2.5">Войти</Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-6 flex items-center justify-between flex-wrap gap-4 mt-16">
        <Link href="/" className="text-lg font-bold text-indigo-600">Taskly</Link>
        <p className="text-sm text-slate-400">Smart task distribution with genetic algorithm</p>
        <div className="flex gap-4">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">Главная</Link>
          <Link href="/login" className="text-sm text-slate-400 hover:text-slate-600">Войти</Link>
        </div>
      </footer>
    </div>
  )
}