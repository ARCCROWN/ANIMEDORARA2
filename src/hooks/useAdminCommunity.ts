import { useState, useEffect, useCallback } from 'react';
import { supabase, CommunityPost, CommunityReport, setUserContext } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useAdminCommunity = () => {
  const [pendingPosts, setPendingPosts] = useState<CommunityPost[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const isAdmin = user.isAuthenticated && (
    user.isAdmin || 
    user.username.toLowerCase().includes('admin') ||
    user.username.toLowerCase().includes('moderator')
  );

  // Ensure admin profile exists in Supabase
  const ensureAdminProfile = useCallback(async () => {
    if (!isAdmin) return;

    try {
      await setUserContext(user.id);

      const { data: adminProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!adminProfile) {
        console.log('Creating admin profile for:', user.username);
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            username: user.username,
            profile_picture: user.profilePicture || '',
            is_admin: true
          });
      } else if (!adminProfile.is_admin) {
        console.log('Updating profile to admin for:', user.username);
        await supabase
          .from('user_profiles')
          .update({ is_admin: true })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error ensuring admin profile:', error);
    }
  }, [isAdmin, user.id, user.username, user.profilePicture]);

  // Fetch pending posts for admin approval
  const fetchPendingPosts = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      // Set user context and ensure admin profile exists
      await setUserContext(user.id);
      await ensureAdminProfile();

      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPendingPosts(data || []);
    } catch (err) {
      console.error('Error fetching pending posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pending posts');
      setPendingPosts([]);
    }
  }, [isAdmin, user.id, ensureAdminProfile]);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    if (!isAdmin) return;

    try {
      // Set user context and ensure admin profile exists
      await setUserContext(user.id);
      await ensureAdminProfile();

      const { data, error } = await supabase
        .from('community_reports')
        .select(`
          *,
          post:community_posts(*),
          comment:community_comments(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setReports(data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      setReports([]);
    }
  }, [isAdmin, user.id, ensureAdminProfile]);

  // Set up real-time subscriptions for admin
  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      Promise.all([fetchPendingPosts(), fetchReports()])
        .finally(() => setLoading(false));

      // Subscribe to pending posts changes
      const pendingPostsSubscription = supabase
        .channel('admin_pending_posts')
        .on('postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'community_posts',
            filter: 'status=eq.pending'
          },
          (payload) => {
            console.log('Pending posts change received:', payload);
            fetchPendingPosts();
          }
        )
        .subscribe();

      // Subscribe to reports changes
      const reportsSubscription = supabase
        .channel('admin_reports')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'community_reports',
            filter: 'status=eq.pending'
          },
          (payload) => {
            console.log('Reports change received:', payload);
            fetchReports();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(pendingPostsSubscription);
        supabase.removeChannel(reportsSubscription);
      };
    } else {
      setLoading(false);
    }
  }, [isAdmin, fetchPendingPosts, fetchReports]);

  // Approve post
  const approvePost = async (postId: string) => {
    if (!isAdmin) throw new Error('Unauthorized');

    try {
      // Set user context and ensure admin profile exists
      await setUserContext(user.id);
      await ensureAdminProfile();

      const { error } = await supabase
        .from('community_posts')
        .update({ status: 'approved' })
        .eq('id', postId);
      
      if (error) {
        throw error;
      }

      // Remove from pending posts locally
      setPendingPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Error approving post:', err);
      throw err;
    }
  };

  // Reject post
  const rejectPost = async (postId: string) => {
    if (!isAdmin) throw new Error('Unauthorized');

    try {
      // Set user context and ensure admin profile exists
      await setUserContext(user.id);
      await ensureAdminProfile();

      const { error } = await supabase
        .from('community_posts')
        .update({ status: 'rejected' })
        .eq('id', postId);
      
      if (error) {
        throw error;
      }

      // Remove from pending posts locally
      setPendingPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Error rejecting post:', err);
      throw err;
    }
  };

  // Delete post
  const deletePost = async (postId: string) => {
    if (!isAdmin) throw new Error('Unauthorized');

    try {
      // Set user context and ensure admin profile exists
      await setUserContext(user.id);
      await ensureAdminProfile();

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);
      
      if (error) {
        throw error;
      }

      // Remove from pending posts locally
      setPendingPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err;
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string) => {
    if (!isAdmin) throw new Error('Unauthorized');

    try {
      // Set user context and ensure admin profile exists
      await setUserContext(user.id);
      await ensureAdminProfile();

      const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  };

  // Resolve report
  const resolveReport = async (reportId: string) => {
    if (!isAdmin) throw new Error('Unauthorized');

    try {
      // Set user context and ensure admin profile exists
      await setUserContext(user.id);
      await ensureAdminProfile();

      const { error } = await supabase
        .from('community_reports')
        .update({ status: 'resolved' })
        .eq('id', reportId);
      
      if (error) {
        throw error;
      }

      // Remove from reports locally
      setReports(prev => prev.filter(report => report.id !== reportId));
    } catch (err) {
      console.error('Error resolving report:', err);
      throw err;
    }
  };

  return {
    isAdmin,
    pendingPosts,
    reports,
    loading,
    error,
    approvePost,
    rejectPost,
    deletePost,
    deleteComment,
    resolveReport,
    refetch: () => {
      fetchPendingPosts();
      fetchReports();
    }
  };
};