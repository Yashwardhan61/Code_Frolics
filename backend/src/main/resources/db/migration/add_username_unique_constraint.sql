-- Database migration: Enforce UNIQUE constraint on username in users table
-- Safe and idempotent for PostgreSQL (Neon)

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_users_username'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT uk_users_username UNIQUE (username);
    END IF;
END $$;
