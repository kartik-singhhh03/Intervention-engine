-- ===========================
-- STUDENTS TABLE
-- ===========================
-- Represents the current "State of the Student"
-- States (from assignment):
--   normal → on_track
--   locked → needs_intervention
--   remedial → mentor-assigned task pending
-- ===========================

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- app-level unique student identifier
  student_id VARCHAR(255) UNIQUE NOT NULL,

  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),

  -- Allowed values:
  -- 'on_track' | 'needs_intervention' | 'remedial'
  status VARCHAR(50) DEFAULT 'on_track',

  -- For remedial state, back-end or n8n sets this
  current_task TEXT,

  -- Tracking metadata
  last_checkin_at TIMESTAMP,
  locked_at TIMESTAMP,          -- when the student got locked
  unlocked_at TIMESTAMP,        -- when mentor or fail-safe unlocked

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- DAILY LOGS TABLE
-- ===========================
-- Stores EACH daily check-in attempt:
-- quiz score, focus minutes, cheating, visibility events
-- ===========================

CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- foreign key to the unique student ID
  student_id VARCHAR(255) NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,

  focus_minutes INTEGER,
  quiz_score INTEGER CHECK (quiz_score BETWEEN 0 AND 10),

  -- Cheater detection: tab switching, minimize browser, etc.
  page_visibility_events INTEGER DEFAULT 0,
  cheater_detected BOOLEAN DEFAULT FALSE,

  -- For real "on-track" vs "locked" check
  is_success BOOLEAN,    -- true when quiz > 7 AND focus_minutes > 60

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- INTERVENTIONS TABLE
-- ===========================
-- Represents the Mentor Human-in-the-Loop actions
-- n8n assigns → backend receives → student UI switches to remedial
-- ===========================

CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id VARCHAR(255) NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,

  task TEXT NOT NULL,

  -- Values:
  -- assigned → remedial pending
  -- completed → student marked completion
  -- auto_resolved → fail-safe handled
  status VARCHAR(50) DEFAULT 'assigned',

  mentor_notes TEXT,

  assigned_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  auto_resolved_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- INDEXES
-- ===========================

CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

CREATE INDEX IF NOT EXISTS idx_daily_logs_student_id ON daily_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_created_at ON daily_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_interventions_student_id ON interventions(student_id);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON interventions(status);
