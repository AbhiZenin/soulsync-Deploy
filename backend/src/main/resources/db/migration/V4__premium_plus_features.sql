ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS boosted_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_boosted_until
    ON profiles(boosted_until);

CREATE TABLE IF NOT EXISTS priority_support_tickets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_priority_support_user_created
    ON priority_support_tickets(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_priority_support_status_created
    ON priority_support_tickets(status, created_at DESC);

CREATE TABLE IF NOT EXISTS video_call_sessions (
    id UUID PRIMARY KEY,
    caller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    callee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_name VARCHAR(160) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_video_call_caller_created
    ON video_call_sessions(caller_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_video_call_callee_created
    ON video_call_sessions(callee_id, created_at DESC);
