/*
  # Fix Community System for Real-time Functionality

  1. Ensure all RLS policies work correctly
  2. Add proper indexes for performance
  3. Enable realtime for all tables
  4. Fix function permissions
*/

-- Ensure the set_config function exists and has proper permissions
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

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION set_config(text, text, boolean) TO public;

-- Ensure all tables have proper RLS policies

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Anyone can view approved posts" ON community_posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON community_posts;
DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
DROP POLICY IF EXISTS "Admins can update any post" ON community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;
DROP POLICY IF EXISTS "Admins can delete any post" ON community_posts;

-- Community Posts Policies
CREATE POLICY "Anyone can view approved posts"
  ON community_posts
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Admins can view all posts"
  ON community_posts
  FOR SELECT
  USING (
    status = 'approved' OR 
    (
      current_setting('app.current_user_id', true) IN (
        SELECT user_id FROM user_profiles WHERE is_admin = true
      )
    )
  );

CREATE POLICY "Users can create posts"
  ON community_posts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own posts"
  ON community_posts
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Admins can update any post"
  ON community_posts
  FOR UPDATE
  USING (
    user_id = current_setting('app.current_user_id', true) OR
    current_setting('app.current_user_id', true) IN (
      SELECT user_id FROM user_profiles WHERE is_admin = true
    )
  );

CREATE POLICY "Users can delete their own posts"
  ON community_posts
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Admins can delete any post"
  ON community_posts
  FOR DELETE
  USING (
    user_id = current_setting('app.current_user_id', true) OR
    current_setting('app.current_user_id', true) IN (
      SELECT user_id FROM user_profiles WHERE is_admin = true
    )
  );

-- Ensure realtime is enabled for all community tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS community_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS community_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS community_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS admin_keys;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS user_favorites;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS user_watch_history;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS user_movie_ratings;

-- Add more admin keys for testing
INSERT INTO admin_keys (key_code) VALUES 
  ('380015'),
  ('380010'),
  ('123456'),
  ('admin123'),
  ('moderator1')
ON CONFLICT (key_code) DO NOTHING;

-- Create a test admin user profile if it doesn't exist
INSERT INTO user_profiles (user_id, username, profile_picture, is_admin, join_date)
VALUES ('user_admin', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', true, now())
ON CONFLICT (user_id) DO UPDATE SET is_admin = true;

INSERT INTO user_profiles (user_id, username, profile_picture, is_admin, join_date)
VALUES ('user_moderator', 'moderator', 'https://api.dicebear.com/7.x/avataaars/svg?seed=moderator', true, now())
ON CONFLICT (user_id) DO UPDATE SET is_admin = true;