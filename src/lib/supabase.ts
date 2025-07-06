import { createClient } from '@supabase/supabase-js';

// Use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: false, // We're using our own auth system
  },
});

// Helper function to set user context for RLS
export const setUserContext = async (userId: string) => {
  try {
    const { error } = await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id',
      setting_value: userId,
      is_local: true
    });
    
    if (error) {
      console.warn('Could not set user context:', error);
    }
  } catch (error) {
    console.warn('Could not set user context:', error);
  }
};

// Database types
export interface CommunityPost {
  id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  content: string;
  image_url?: string;
  link_url?: string;
  link_title?: string;
  category: 'discussion' | 'news' | 'fanart' | 'review' | 'question';
  likes: number;
  dislikes: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  comments?: CommunityComment[];
  user_reaction?: 'like' | 'dislike' | null;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  content: string;
  likes: number;
  parent_id?: string;
  created_at: string;
  replies?: CommunityComment[];
  user_reaction?: 'like' | null;
}

export interface CommunityReaction {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  reaction_type: 'like' | 'dislike';
  created_at: string;
}

export interface CommunityReport {
  id: string;
  reporter_user_id: string;
  post_id?: string;
  comment_id?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  profile_picture: string;
  is_admin: boolean;
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface AdminKey {
  id: string;
  key_code: string;
  is_used: boolean;
  used_by?: string;
  used_at?: string;
  created_at: string;
}