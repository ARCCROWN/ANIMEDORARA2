/*
  # Community System Database Schema

  1. New Tables
    - `community_posts`
      - `id` (uuid, primary key)
      - `user_id` (text, references auth.users)
      - `username` (text)
      - `user_avatar` (text)
      - `content` (text)
      - `image_url` (text, optional)
      - `link_url` (text, optional)
      - `link_title` (text, optional)
      - `category` (text)
      - `likes` (integer, default 0)
      - `dislikes` (integer, default 0)
      - `status` (text, default 'pending') -- pending, approved, rejected
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `community_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references community_posts)
      - `user_id` (text)
      - `username` (text)
      - `user_avatar` (text)
      - `content` (text)
      - `likes` (integer, default 0)
      - `parent_id` (uuid, optional for replies)
      - `created_at` (timestamp)

    - `community_reactions`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `post_id` (uuid, optional)
      - `comment_id` (uuid, optional)
      - `reaction_type` (text) -- like, dislike
      - `created_at` (timestamp)

    - `community_reports`
      - `id` (uuid, primary key)
      - `reporter_user_id` (text)
      - `post_id` (uuid, optional)
      - `comment_id` (uuid, optional)
      - `reason` (text)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add admin policies for moderation
*/

-- Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  username text NOT NULL,
  user_avatar text DEFAULT '',
  content text NOT NULL,
  image_url text,
  link_url text,
  link_title text,
  category text NOT NULL DEFAULT 'discussion',
  likes integer DEFAULT 0,
  dislikes integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community Comments Table
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  username text NOT NULL,
  user_avatar text DEFAULT '',
  content text NOT NULL,
  likes integer DEFAULT 0,
  parent_id uuid REFERENCES community_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Community Reactions Table
CREATE TABLE IF NOT EXISTS community_reactions (
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
CREATE TABLE IF NOT EXISTS community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id text NOT NULL,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES community_comments(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz DEFAULT now(),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Enable Row Level Security
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

-- Policies for community_posts
CREATE POLICY "Anyone can view approved posts"
  ON community_posts
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can create posts"
  ON community_posts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own posts"
  ON community_posts
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete their own posts"
  ON community_posts
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));

-- Policies for community_comments
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

CREATE POLICY "Users can create comments"
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

-- Policies for community_reactions
CREATE POLICY "Anyone can view reactions"
  ON community_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own reactions"
  ON community_reactions
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- Policies for community_reports
CREATE POLICY "Users can create reports"
  ON community_reports
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own reports"
  ON community_reports
  FOR SELECT
  USING (reporter_user_id = current_setting('app.current_user_id', true));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent_id ON community_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_post_id ON community_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_comment_id ON community_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_user_id ON community_reactions(user_id);

-- Function to update post reaction counts
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
        UPDATE community_posts SET likes = likes - 1 WHERE id = OLD.post_id;
      ELSIF OLD.reaction_type = 'dislike' THEN
        UPDATE community_posts SET dislikes = dislikes - 1 WHERE id = OLD.post_id;
      END IF;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment reaction counts
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
      UPDATE community_comments SET likes = likes - 1 WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_post_reactions ON community_reactions;
CREATE TRIGGER trigger_update_post_reactions
  AFTER INSERT OR DELETE ON community_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reaction_counts();

DROP TRIGGER IF EXISTS trigger_update_comment_reactions ON community_reactions;
CREATE TRIGGER trigger_update_comment_reactions
  AFTER INSERT OR DELETE ON community_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_reaction_counts();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_posts_updated_at ON community_posts;
CREATE TRIGGER trigger_update_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();