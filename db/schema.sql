-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Enums (DROP TYPE IF EXISTS to allow re-running safely in dev)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'educator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_type AS ENUM ('article', 'video', 'podcast');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('content_verified', 'content_rejected', 'comment_added', 'comment_reply', 'like_added');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    name TEXT,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    password TEXT,
    google_id TEXT UNIQUE,
    avatar TEXT,
    role user_role NOT NULL DEFAULT 'user',
    specialty TEXT,
    bio TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Sessions Table (for connect-pg-simple)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Create Content Table
CREATE TABLE IF NOT EXISTS content (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    excerpt TEXT,
    type content_type NOT NULL DEFAULT 'article',
    media_url TEXT,
    topics TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    source TEXT NOT NULL DEFAULT 'user',
    author_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    verified_by VARCHAR REFERENCES users(id),
    verified_at TIMESTAMP,
    confidence_score INTEGER DEFAULT 0,
    popularity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_author_idx ON content(author_id);
CREATE INDEX IF NOT EXISTS content_status_idx ON content(verification_status);
CREATE INDEX IF NOT EXISTS content_topics_idx ON content USING GIN (topics);

-- Create Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    author_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id VARCHAR REFERENCES comments(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comments_content_idx ON comments(content_id);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON comments(parent_id);

-- Create Likes Table
CREATE TABLE IF NOT EXISTS likes (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS likes_content_user_idx ON likes(content_id, user_id);

-- Create Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bookmarks_user_idx ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_content_user_idx ON bookmarks(content_id, user_id);

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    content_id VARCHAR REFERENCES content(id) ON DELETE CASCADE,
    comment_id VARCHAR REFERENCES comments(id) ON DELETE CASCADE,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);

-- Create Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    reporter_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status verification_status NOT NULL DEFAULT 'pending',
    resolved_by VARCHAR REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create SheerID Verifications Table
CREATE TABLE IF NOT EXISTS sheerid_verifications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_id TEXT NOT NULL UNIQUE,
    status verification_status NOT NULL DEFAULT 'pending',
    verification_data JSONB,
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Consents Table
CREATE TABLE IF NOT EXISTS consents (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    consented_at TIMESTAMP NOT NULL DEFAULT NOW()
);
