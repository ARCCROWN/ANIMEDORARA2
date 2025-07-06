/*
  # Fix RLS Policies and Add RPC Function

  1. Add RPC function for setting user context
  2. Update RLS policies to work properly
  3. Ensure real-time functionality works
*/

-- Create RPC function to set user context
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

-- Update RLS policies for community_posts to allow admins to see pending posts
DROP POLICY IF EXISTS "Admins can view all posts" ON community_posts;
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

-- Update RLS policies for community_posts to allow admins to update any post
DROP POLICY IF EXISTS "Admins can update any post" ON community_posts;
CREATE POLICY "Admins can update any post"
  ON community_posts
  FOR UPDATE
  USING (
    user_id = current_setting('app.current_user_id', true) OR
    current_setting('app.current_user_id', true) IN (
      SELECT user_id FROM user_profiles WHERE is_admin = true
    )
  );

-- Update RLS policies for community_posts to allow admins to delete any post
DROP POLICY IF EXISTS "Admins can delete any post" ON community_posts;
CREATE POLICY "Admins can delete any post"
  ON community_posts
  FOR DELETE
  USING (
    user_id = current_setting('app.current_user_id', true) OR
    current_setting('app.current_user_id', true) IN (
      SELECT user_id FROM user_profiles WHERE is_admin = true
    )
  );

-- Update RLS policies for community_reports to allow admins to view all reports
DROP POLICY IF EXISTS "Admins can view all reports" ON community_reports;
CREATE POLICY "Admins can view all reports"
  ON community_reports
  FOR SELECT
  USING (
    reporter_user_id = current_setting('app.current_user_id', true) OR
    current_setting('app.current_user_id', true) IN (
      SELECT user_id FROM user_profiles WHERE is_admin = true
    )
  );

-- Update RLS policies for community_reports to allow admins to update reports
DROP POLICY IF EXISTS "Admins can update reports" ON community_reports;
CREATE POLICY "Admins can update reports"
  ON community_reports
  FOR UPDATE
  USING (
    current_setting('app.current_user_id', true) IN (
      SELECT user_id FROM user_profiles WHERE is_admin = true
    )
  );

-- Enable realtime for all community tables
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE community_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE community_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE community_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;