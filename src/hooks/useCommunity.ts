import { useState, useEffect, useCallback } from 'react';
import { supabase, setUserContext, CommunityPost, CommunityComment } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useCommunity = (movieId?: string) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Ensure user profile exists in Supabase
  const ensureUserProfile = useCallback(async () => {
    if (!user.isAuthenticated) return;

    try {
      await setUserContext(user.id);

      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        console.log('Creating user profile for:', user.username);
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            username: user.username,
            profile_picture: user.profilePicture || '',
            is_admin: user.isAdmin || false
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        } else {
          console.log('User profile created successfully');
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  }, [user]);

  // Fetch posts with real-time updates
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Set user context if authenticated
      if (user.isAuthenticated) {
        await setUserContext(user.id);
        await ensureUserProfile();
      }

      // Fetch approved posts with comments
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select(`
          *,
          comments:community_comments(
            *,
            replies:community_comments!parent_id(*)
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      // Fetch user reactions if authenticated
      let userReactions: any[] = [];
      if (user.isAuthenticated && postsData && postsData.length > 0) {
        const postIds = postsData.map(post => post.id);
        const { data: reactionsData } = await supabase
          .from('community_reactions')
          .select('*')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        
        userReactions = reactionsData || [];
      }

      // Combine posts with user reactions
      const postsWithReactions = (postsData || []).map(post => ({
        ...post,
        user_reaction: userReactions.find(r => r.post_id === post.id)?.reaction_type || null,
        comments: post.comments?.map((comment: any) => ({
          ...comment,
          user_reaction: userReactions.find(r => r.comment_id === comment.id)?.reaction_type || null,
          replies: comment.replies || []
        })) || []
      }));

      setPosts(postsWithReactions);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user, ensureUserProfile]);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchPosts();

    // Subscribe to posts changes
    const postsSubscription = supabase
      .channel('community_posts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'community_posts' },
        (payload) => {
          console.log('Posts change received:', payload);
          fetchPosts(); // Refetch posts when changes occur
        }
      )
      .subscribe();

    // Subscribe to comments changes
    const commentsSubscription = supabase
      .channel('community_comments_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'community_comments' },
        (payload) => {
          console.log('Comments change received:', payload);
          fetchPosts(); // Refetch posts when comments change
        }
      )
      .subscribe();

    // Subscribe to reactions changes
    const reactionsSubscription = supabase
      .channel('community_reactions_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'community_reactions' },
        (payload) => {
          console.log('Reactions change received:', payload);
          fetchPosts(); // Refetch posts when reactions change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(commentsSubscription);
      supabase.removeChannel(reactionsSubscription);
    };
  }, [fetchPosts]);

  // Create post
  const createPost = async (postData: {
    content: string;
    category: string;
    imageUrl?: string;
    linkUrl?: string;
  }) => {
    if (!user.isAuthenticated) {
      throw new Error('You must be logged in to create a post');
    }

    try {
      // Set user context and ensure profile exists
      await setUserContext(user.id);
      await ensureUserProfile();

      const postPayload = {
        user_id: user.id,
        username: user.username,
        user_avatar: user.profilePicture || '',
        content: postData.content.trim(),
        category: postData.category,
        image_url: postData.imageUrl || null,
        link_url: postData.linkUrl || null,
        link_title: postData.linkUrl ? extractDomainFromUrl(postData.linkUrl) : null,
        status: 'pending' // All posts start as pending for admin approval
      };

      console.log('Creating post with payload:', postPayload);

      const { data, error } = await supabase
        .from('community_posts')
        .insert(postPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Post created successfully:', data);

      // Don't add to local state immediately since it's pending approval
      return data;
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  // Create comment
  const createComment = async (postId: string, content: string, parentId?: string) => {
    if (!user.isAuthenticated) {
      throw new Error('You must be logged in to comment');
    }

    try {
      // Set user context and ensure profile exists
      await setUserContext(user.id);
      await ensureUserProfile();

      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          username: user.username,
          user_avatar: user.profilePicture || '',
          content: content.trim(),
          parent_id: parentId
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh posts to show new comment
      await fetchPosts();
      return data;
    } catch (err) {
      console.error('Error creating comment:', err);
      throw err;
    }
  };

  // Toggle reaction (like/dislike)
  const toggleReaction = async (
    targetId: string, 
    reactionType: 'like' | 'dislike',
    targetType: 'post' | 'comment'
  ) => {
    if (!user.isAuthenticated) {
      throw new Error('You must be logged in to react');
    }

    try {
      // Set user context and ensure profile exists
      await setUserContext(user.id);
      await ensureUserProfile();

      const reactionData = {
        user_id: user.id,
        reaction_type: reactionType,
        ...(targetType === 'post' ? { post_id: targetId } : { comment_id: targetId })
      };

      // Check if reaction already exists
      const { data: existingReaction } = await supabase
        .from('community_reactions')
        .select('*')
        .eq('user_id', user.id)
        .eq(targetType === 'post' ? 'post_id' : 'comment_id', targetId)
        .eq('reaction_type', reactionType)
        .maybeSingle();

      if (existingReaction) {
        // Remove existing reaction
        await supabase
          .from('community_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Remove opposite reaction if exists
        await supabase
          .from('community_reactions')
          .delete()
          .eq('user_id', user.id)
          .eq(targetType === 'post' ? 'post_id' : 'comment_id', targetId);

        // Add new reaction
        await supabase
          .from('community_reactions')
          .insert(reactionData);
      }

      // Refresh posts to show updated counts
      await fetchPosts();
    } catch (err) {
      console.error('Error toggling reaction:', err);
      throw err;
    }
  };

  // Report content
  const reportContent = async (
    targetId: string,
    targetType: 'post' | 'comment',
    reason: string
  ) => {
    if (!user.isAuthenticated) {
      throw new Error('You must be logged in to report content');
    }

    try {
      // Set user context and ensure profile exists
      await setUserContext(user.id);
      await ensureUserProfile();

      const { error } = await supabase
        .from('community_reports')
        .insert({
          reporter_user_id: user.id,
          ...(targetType === 'post' ? { post_id: targetId } : { comment_id: targetId }),
          reason: reason.trim()
        });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Error reporting content:', err);
      throw err;
    }
  };

  const extractDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return {
    posts,
    loading,
    error,
    createPost,
    createComment,
    toggleReaction,
    reportContent,
    refetch: fetchPosts
  };
};