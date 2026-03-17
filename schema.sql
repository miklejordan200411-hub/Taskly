-- ============================================================
--  Taskly — PostgreSQL Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- для gen_random_uuid()

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(64)   NOT NULL UNIQUE,
  email         VARCHAR(128)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- PROJECTS
-- ------------------------------------------------------------
CREATE TABLE projects (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(128)  NOT NULL,
  creator_id  UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invite_code VARCHAR(16)   NOT NULL UNIQUE,
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMP     NULL
);

-- ------------------------------------------------------------
-- PROJECT_MEMBERS
-- ------------------------------------------------------------
CREATE TABLE project_members (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID           NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id       UUID           NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  role          VARCHAR(16)    NOT NULL CHECK (role IN ('manager', 'worker')),
  skills        TEXT[]         NOT NULL DEFAULT '{}',
  hours_per_day DECIMAL(4,1)   NOT NULL DEFAULT 8,
  joined_at     TIMESTAMP      NOT NULL DEFAULT NOW(),
  removed_at    TIMESTAMP      NULL,
  UNIQUE (project_id, user_id)
);

-- ------------------------------------------------------------
-- TASKS
-- ------------------------------------------------------------
CREATE TABLE tasks (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name          VARCHAR(256)  NOT NULL,
  duration      DECIMAL(5,1)  NOT NULL,                        -- часы
  skill         VARCHAR(64)   NOT NULL DEFAULT '',
  priority      SMALLINT      NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  deadline_days SMALLINT      NULL,                            -- дней от старта проекта
  assigned_to   UUID          NULL REFERENCES users(id) ON DELETE SET NULL,
  status        VARCHAR(16)   NOT NULL DEFAULT 'To Do'
                              CHECK (status IN ('To Do', 'In Progress', 'Done')),
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- NOTE: parent_id убран из tasks — зависимости вынесены в task_dependencies (many-to-many)

-- ------------------------------------------------------------
-- TASK_DEPENDENCIES  (many-to-many, self-referential)
-- ------------------------------------------------------------
CREATE TABLE task_dependencies (
  id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID  NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,   -- зависящая задача
  depends_on_id UUID  NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,   -- задача-prerequisite
  UNIQUE (task_id, depends_on_id),
  CHECK (task_id <> depends_on_id)   -- задача не может зависеть от самой себя
);

-- ------------------------------------------------------------
-- COMMENTS
-- ------------------------------------------------------------
CREATE TABLE comments (
  id         UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID       NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id    UUID       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT       NOT NULL,
  created_at TIMESTAMP  NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- HISTORY  (автолог изменений задач — заполняется триггером)
-- ------------------------------------------------------------
CREATE TABLE history (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID         NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  field_changed VARCHAR(64)  NOT NULL,
  old_value     TEXT,
  new_value     TEXT,
  changed_by    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  changed_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ИНДЕКСЫ
-- ============================================================
CREATE INDEX idx_tasks_project_id    ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to   ON tasks(assigned_to);
CREATE INDEX idx_tasks_status        ON tasks(status);
CREATE INDEX idx_pm_project_id       ON project_members(project_id);
CREATE INDEX idx_pm_user_id          ON project_members(user_id);
CREATE INDEX idx_comments_task_id    ON comments(task_id);
CREATE INDEX idx_history_task_id     ON history(task_id);
CREATE INDEX idx_td_task_id          ON task_dependencies(task_id);
CREATE INDEX idx_td_depends_on_id    ON task_dependencies(depends_on_id);

-- ============================================================
-- ТРИГГЕР: автоматическая запись в history при UPDATE tasks
-- ============================================================

-- Функция триггера (нужен changed_by в сессионной переменной)
-- Перед UPDATE задачи выполни: SET LOCAL app.current_user_id = '<uuid>';
CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_user UUID;
BEGIN
  -- Читаем текущего пользователя из сессионной переменной
  BEGIN
    v_user := current_setting('app.current_user_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_user := NULL;
  END;

  IF v_user IS NULL THEN
    RETURN NEW;  -- не логируем если нет пользователя
  END IF;

  -- Логируем каждое изменённое поле отдельной строкой
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    INSERT INTO history(task_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'name', OLD.name, NEW.name, v_user);
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO history(task_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'status', OLD.status, NEW.status, v_user);
  END IF;

  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO history(task_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'assigned_to', OLD.assigned_to::TEXT, NEW.assigned_to::TEXT, v_user);
  END IF;

  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO history(task_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'priority', OLD.priority::TEXT, NEW.priority::TEXT, v_user);
  END IF;

  IF OLD.deadline_days IS DISTINCT FROM NEW.deadline_days THEN
    INSERT INTO history(task_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'deadline_days', OLD.deadline_days::TEXT, NEW.deadline_days::TEXT, v_user);
  END IF;

  IF OLD.duration IS DISTINCT FROM NEW.duration THEN
    INSERT INTO history(task_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'duration', OLD.duration::TEXT, NEW.duration::TEXT, v_user);
  END IF;

  IF OLD.skill IS DISTINCT FROM NEW.skill THEN
    INSERT INTO history(task_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'skill', OLD.skill, NEW.skill, v_user);
  END IF;

  -- Обновляем updated_at автоматически
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_task_changes
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION log_task_changes();
