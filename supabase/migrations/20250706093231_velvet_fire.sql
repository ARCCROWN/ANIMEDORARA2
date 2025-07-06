/*
  # User Profiles and Admin Keys Migration

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (text, unique)
      - `username` (text)
      - `profile_picture` (text)
      - `is_admin` (boolean, default false)
      - `join_date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `admin_keys`
      - `id` (uuid, primary key)
      - `key_code` (text, unique)
      - `is_used` (boolean, default false)
      - `used_by` (text, optional)
      - `used_at` (timestamp, optional)
      - `created_at` (timestamp)

    - `user_favorites`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `movie_id` (text)
      - `movie_title` (text)
      - `movie_poster` (text)
      - `added_at` (timestamp)

    - `user_watch_history`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `movie_id` (text)
      - `movie_title` (text)
      - `movie_poster` (text)
      - `watched_at` (timestamp)
      - `progress` (integer, default 0)
      - `duration` (integer, default 0)

    - `user_movie_ratings`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `movie_id` (text)
      - `rating` (integer)
      - `rated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
*/

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  username text NOT NULL,
  profile_picture text DEFAULT '',
  is_admin boolean DEFAULT false,
  join_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin Keys Table
CREATE TABLE IF NOT EXISTS admin_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_code text UNIQUE NOT NULL,
  is_used boolean DEFAULT false,
  used_by text,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- User Favorites Table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  movie_id text NOT NULL,
  movie_title text NOT NULL,
  movie_poster text DEFAULT '',
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- User Watch History Table
CREATE TABLE IF NOT EXISTS user_watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  movie_id text NOT NULL,
  movie_title text NOT NULL,
  movie_poster text DEFAULT '',
  watched_at timestamptz DEFAULT now(),
  progress integer DEFAULT 0,
  duration integer DEFAULT 0,
  UNIQUE(user_id, movie_id)
);

-- User Movie Ratings Table
CREATE TABLE IF NOT EXISTS user_movie_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  movie_id text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  rated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_movie_ratings ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Policies for admin_keys
CREATE POLICY "Anyone can view unused admin keys"
  ON admin_keys
  FOR SELECT
  USING (is_used = false);

CREATE POLICY "Anyone can update admin keys"
  ON admin_keys
  FOR UPDATE
  USING (true);

-- Policies for user_favorites
CREATE POLICY "Users can manage their own favorites"
  ON user_favorites
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- Policies for user_watch_history
CREATE POLICY "Users can manage their own watch history"
  ON user_watch_history
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- Policies for user_movie_ratings
CREATE POLICY "Users can manage their own ratings"
  ON user_movie_ratings
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- Insert default admin keys
INSERT INTO admin_keys (key_code) VALUES 
  ('380015'),
  ('380010')
ON CONFLICT (key_code) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_admin_keys_code ON admin_keys(key_code);
CREATE INDEX IF NOT EXISTS idx_admin_keys_used ON admin_keys(is_used);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_movie_id ON user_favorites(movie_id);
CREATE INDEX IF NOT EXISTS idx_user_watch_history_user_id ON user_watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watch_history_watched_at ON user_watch_history(watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_movie_ratings_user_id ON user_movie_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_movie_ratings_movie_id ON user_movie_ratings(movie_id);

-- Function to update updated_at timestamp for user_profiles
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles updated_at
DROP TRIGGER IF EXISTS trigger_update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trigger_update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();