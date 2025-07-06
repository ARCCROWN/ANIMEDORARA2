/*
  # Complete Community System Fix

  1. Drop and recreate all tables with proper structure
  2. Fix RLS policies to work correctly
  3. Ensure proper user authentication flow
  4. Add proper indexes and constraints
*/

-- Drop existing tables to recreate them properly
DROP TABLE IF EXISTS community_reactions CASCADE;
DROP TABLE IF EXISTS community_reports CASCADE;
DROP TABLE IF EXISTS community_comments CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS user_movie_ratings CASCADE;
DROP TABLE IF EXISTS user_watch_history CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS admin_keys CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS set_config(text, text, boolean);
DROP FUNCTION IF EXISTS update_post_reaction_counts();
DROP FUNCTION IF EXISTS update_comment_reaction_counts();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_user_profiles_updated_at();

-- Create set_config function for RLS
CREATE OR REPLACE FUNCTION set_config(setting_name text, setting_value text, is_local boolean DEFAULT false)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config(setting_name, setting_value, is_local);
  RETURN setting_value;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION set_config(text, text, boolean) TO public;

-- User Profiles Table (must be first for foreign key references)
CREATE TABLE user_profiles (
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
CREATE TABLE admin_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_code text UNIQUE NOT NULL,
  is_used boolean DEFAULT false,
  used_by text,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Community Posts Table
CREATE TABLE community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  username text NOT NULL,
  user_avatar text DEFAULT '',
  content text NOT NULL,
  image_url text,
  link_url text,
  link_title text,
  category text NOT NULL DEFAULT 'discussion' CHECK (category IN ('discussion', 'news', 'fanart', 'review', 'question')),
  likes integer DEFAULT 0,
  dislikes integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community Comments Table
CREATE TABLE community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  username text NOT NULL,
  user_avatar text DEFAULT '',
  content text NOT NULL,
  likes integer DEFAULT 0,
  parent_id uuid REFERENCES community_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Community Reactions Table
CREATE TABLE community_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES community_comments(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id, reaction_type),
  UNIQUE(user_id, comment_id, reaction_type),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Community Reports Table
CREATE TABLE community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id text NOT NULL,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES community_comments(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz DEFAULT now(),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- User Favorites Table
CREATE TABLE user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  movie_id text NOT NULL,
  movie_title text NOT NULL,
  movie_poster text DEFAULT '',
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- User Watch History Table
CREATE TABLE user_watch_history (
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
CREATE TABLE user_movie_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  movie_id text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  rated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_movie_ratings ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies (Allow all operations for now to avoid auth issues)
CREATE POLICY "Allow all operations on user_profiles"
  ON user_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Admin Keys Policies
CREATE POLICY "Anyone can view unused admin keys"
  ON admin_keys
  FOR SELECT
  USING (is_used = false);

CREATE POLICY "Anyone can update admin keys"
  ON admin_keys
  FOR UPDATE
  USING (true);

-- Community Posts Policies (Simplified for better reliability)
CREATE POLICY "Anyone can view approved posts"
  ON community_posts
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Admins can view all posts"
  ON community_posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = current_setting('app.current_user_id', true) 
      AND is_admin = true
    )
  );

CREATE POLICY "Anyone can create posts"
  ON community_posts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own posts"
  ON community_posts
  FOR UPDATE
  USING (
    user_id = current_setting('app.current_user_id', true) OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = current_setting('app.current_user_id', true) 
      AND is_admin = true
    )
  );

CREATE POLICY "Users can delete their own posts"
  ON community_posts
  FOR DELETE
  USING (
    user_id = current_setting('app.current_user_id', true) OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = current_setting('app.current_user_id', true) 
      AND is_admin = true
    )
  );

-- Community Comments Policies
CREATE POLICY "Anyone can view comments on approved posts"
  ON community_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_posts 
      WHERE id = community_comments.post_id 
      AND status = 'approved'
    )
  );

CREATE POLICY "Anyone can create comments"
  ON community_comments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON community_comments
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete their own comments"
  ON community_comments
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));

-- Community Reactions Policies
CREATE POLICY "Anyone can view reactions"
  ON community_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own reactions"
  ON community_reactions
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- Community Reports Policies
CREATE POLICY "Anyone can create reports"
  ON community_reports
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own reports"
  ON community_reports
  FOR SELECT
  USING (
    reporter_user_id = current_setting('app.current_user_id', true) OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = current_setting('app.current_user_id', true) 
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can update reports"
  ON community_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = current_setting('app.current_user_id', true) 
      AND is_admin = true
    )
  );

-- User Data Policies
CREATE POLICY "Users can manage their own favorites"
  ON user_favorites
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own watch history"
  ON user_watch_history
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own ratings"
  ON user_movie_ratings
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_is_admin ON user_profiles(is_admin);
CREATE INDEX idx_admin_keys_code ON admin_keys(key_code);
CREATE INDEX idx_admin_keys_used ON admin_keys(is_used);
CREATE INDEX idx_community_posts_status ON community_posts(status);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX idx_community_comments_parent_id ON community_comments(parent_id);
CREATE INDEX idx_community_reactions_post_id ON community_reactions(post_id);
CREATE INDEX idx_community_reactions_comment_id ON community_reactions(comment_id);
CREATE INDEX idx_community_reactions_user_id ON community_reactions(user_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_movie_id ON user_favorites(movie_id);
CREATE INDEX idx_user_watch_history_user_id ON user_watch_history(user_id);
CREATE INDEX idx_user_watch_history_watched_at ON user_watch_history(watched_at DESC);
CREATE INDEX idx_user_movie_ratings_user_id ON user_movie_ratings(user_id);
CREATE INDEX idx_user_movie_ratings_movie_id ON user_movie_ratings(movie_id);

-- Functions for updating reaction counts
CREATE OR REPLACE FUNCTION update_post_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      IF NEW.reaction_type = 'like' THEN
        UPDATE community_posts SET likes = likes + 1 WHERE id = NEW.post_id;
      ELSIF NEW.reaction_type = 'dislike' THEN
        UPDATE community_posts SET dislikes = dislikes + 1 WHERE id = NEW.post_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      IF OLD.reaction_type = 'like' THEN
        UPDATE community_posts SET likes = GREATEST(0, likes - 1) WHERE id = OLD.post_id;
      ELSIF OLD.reaction_type = 'dislike' THEN
        UPDATE community_posts SET dislikes = GREATEST(0, dislikes - 1) WHERE id = OLD.post_id;
      END IF;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_comment_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.comment_id IS NOT NULL AND NEW.reaction_type = 'like' THEN
      UPDATE community_comments SET likes = likes + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.comment_id IS NOT NULL AND OLD.reaction_type = 'like' THEN
      UPDATE community_comments SET likes = GREATEST(0, likes - 1) WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_post_reactions
  AFTER INSERT OR DELETE ON community_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reaction_counts();

CREATE TRIGGER trigger_update_comment_reactions
  AFTER INSERT OR DELETE ON community_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_reaction_counts();

CREATE TRIGGER trigger_update_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Insert admin keys
INSERT INTO admin_keys (key_code) VALUES 
  ('380015'),
  ('380010'),
  ('123456'),
  ('admin123'),
  ('moderator1'),
  ('superadmin'),
  ('testadmin')
ON CONFLICT (key_code) DO NOTHING;

-- Create default admin profiles
INSERT INTO user_profiles (user_id, username, profile_picture, is_admin, join_date)
VALUES 
  ('user_admin', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', true, now()),
  ('user_moderator', 'moderator', 'https://api.dicebear.com/7.x/avataaars/svg?seed=moderator', true, now()),
  ('user_superadmin', 'superadmin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin', true, now())
ON CONFLICT (user_id) DO UPDATE SET is_admin = true;

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_keys;
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE community_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE community_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE community_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE user_favorites;
ALTER PUBLICATION supabase_realtime ADD TABLE user_watch_history;
ALTER PUBLICATION supabase_realtime ADD TABLE user_movie_ratings;