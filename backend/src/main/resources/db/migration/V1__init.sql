CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  role VARCHAR(32) NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(120) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(50),
  height_cm INT,
  marital_status VARCHAR(80),
  mother_tongue VARCHAR(80),
  religion VARCHAR(100),
  community VARCHAR(100),
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  education VARCHAR(200),
  occupation VARCHAR(200),
  income_range VARCHAR(100),
  diet VARCHAR(80),
  smoking VARCHAR(80),
  drinking VARCHAR(80),
  about VARCHAR(3000),
  profile_created_by VARCHAR(80),
  visibility VARCHAR(32) NOT NULL DEFAULT 'MEMBERS',
  completion_percent INT NOT NULL DEFAULT 10,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE partner_preferences (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  min_age INT,
  max_age INT,
  min_height_cm INT,
  max_height_cm INT,
  country VARCHAR(100),
  state VARCHAR(100),
  religion VARCHAR(100),
  mother_tongue VARCHAR(80),
  education VARCHAR(200),
  occupation VARCHAR(200),
  diet VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE profile_photos (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_key VARCHAR(500) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  visibility VARCHAR(32) NOT NULL DEFAULT 'PUBLIC',
  created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_profile_photos_user ON profile_photos(user_id, sort_order);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

CREATE TABLE action_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  purpose VARCHAR(40) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_action_tokens_user_purpose ON action_tokens(user_id, purpose);

CREATE TABLE interests (
  id UUID PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT uk_interest_pair UNIQUE(sender_id, receiver_id),
  CONSTRAINT chk_interest_not_self CHECK(sender_id <> receiver_id)
);
CREATE INDEX idx_interests_receiver ON interests(receiver_id, status, created_at DESC);
CREATE INDEX idx_interests_sender ON interests(sender_id, status, created_at DESC);

CREATE TABLE shortlists (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT uk_shortlist_pair UNIQUE(user_id, target_user_id),
  CONSTRAINT chk_shortlist_not_self CHECK(user_id <> target_user_id)
);

CREATE TABLE profile_views (
  id UUID PRIMARY KEY,
  viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_profile_views_viewed ON profile_views(viewed_id, viewed_at DESC);

CREATE TABLE blocks (
  id UUID PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT uk_block_pair UNIQUE(blocker_id, blocked_id),
  CONSTRAINT chk_block_not_self CHECK(blocker_id <> blocked_id)
);

CREATE TABLE reports (
  id UUID PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(200) NOT NULL,
  details VARCHAR(2000),
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_reports_status ON reports(status, created_at DESC);

CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT uk_conversation_pair UNIQUE(user1_id, user2_id),
  CONSTRAINT chk_conversation_order CHECK(user1_id::text < user2_id::text)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body VARCHAR(4000) NOT NULL,
  type VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  read_at TIMESTAMPTZ
);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body VARCHAR(1000) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(32) NOT NULL DEFAULT 'FREE',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  provider_customer_id VARCHAR(255),
  provider_subscription_id VARCHAR(255),
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_profiles_search ON profiles(country, state, city, religion, mother_tongue);
CREATE INDEX idx_profiles_activity ON profiles(last_active_at DESC);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(120) NOT NULL,
  target_type VARCHAR(120) NOT NULL,
  target_id VARCHAR(255),
  details VARCHAR(2000),
  created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
