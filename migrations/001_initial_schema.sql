-- ============================================================
-- 001_initial_schema.sql
-- Run this once in Supabase SQL Editor for a fresh project.
-- ============================================================

-- Guest list (pre-approved guests)
CREATE TABLE guest_list (
  id          UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name  TEXT                     NOT NULL,
  last_name   TEXT                     NOT NULL,
  enabled     BOOLEAN                  NOT NULL DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_guest_list_first_name ON guest_list(first_name);
CREATE INDEX idx_guest_list_last_name  ON guest_list(last_name);
CREATE INDEX idx_guest_list_enabled    ON guest_list(enabled);
CREATE INDEX idx_guest_list_created_at ON guest_list(created_at);
CREATE INDEX idx_guest_list_updated_at ON guest_list(updated_at);

-- RSVP submissions
CREATE TABLE rsvps (
  id                  UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name          TEXT                     NOT NULL,
  last_name           TEXT                     NOT NULL,
  email               TEXT                     NOT NULL,
  attending           BOOLEAN                  NOT NULL DEFAULT false,
  attendance_type     TEXT                     NOT NULL DEFAULT 'both'
                        CHECK (attendance_type IN ('church', 'reception', 'both')),
  reminder_sent       BOOLEAN                  NOT NULL DEFAULT false,
  reminder_sent_at    TIMESTAMP WITH TIME ZONE,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rsvps_email           ON rsvps(email);
CREATE INDEX idx_rsvps_first_name      ON rsvps(first_name);
CREATE INDEX idx_rsvps_last_name       ON rsvps(last_name);
CREATE INDEX idx_rsvps_attendance_type ON rsvps(attendance_type);
CREATE INDEX idx_rsvps_reminder_sent   ON rsvps(reminder_sent);
CREATE INDEX idx_rsvps_created_at      ON rsvps(created_at);
CREATE INDEX idx_rsvps_updated_at      ON rsvps(updated_at);
