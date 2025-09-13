-- Run: psql < migrations/init.sql OR npm run migrate (defined in package.json)


CREATE TABLE IF NOT EXISTS users (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE TABLE IF NOT EXISTS credits (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
amount NUMERIC(12,2) NOT NULL,
description TEXT,
status TEXT DEFAULT 'pending',
created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);




-- Optional seed data
INSERT INTO users (name, email) VALUES
('Test User','test@example.com')
ON CONFLICT DO NOTHING;