ALTER TABLE profile_photos
    ADD COLUMN original_filename VARCHAR(255),
    ADD COLUMN content_type VARCHAR(100),
    ADD COLUMN file_size BIGINT,
    ADD COLUMN moderation_status VARCHAR(32) NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN moderation_reason VARCHAR(500),
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX idx_profile_photos_moderation_status
    ON profile_photos(moderation_status);
