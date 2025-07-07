import { useState, useEffect } from 'react';
import { supabase, Post, Comment } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useCommunity = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();

    // Subscribe to real-time changes
    const postsSubscription = supabase
      .channel('posts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    const commentsSubscription = supabase
      .channel('comments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchPosts();
      })
      .subscribe();

    const likesSubscription = supabase
      .channel('likes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(commentsSubscription);
      supabase.removeChannel(likesSubscription);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      // Fetch posts with profiles
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles!posts_user_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch comments for each post
      const postsWithData = await Promise.all(
        (postsData || []).map(async (post) => {
          // Get comments
          const { data: commentsData } = await supabase
            .from('comments')
            .select(`
              *,
              profile:profiles!comments_user_id_fkey(*)
            `)
            .eq('post_id', post.id)
            .is('parent_id', null)
            .order('created_at', { ascending: true });

          // Get comments with replies
          const commentsWithReplies = await Promise.all(
            (commentsData || []).map(async (comment) => {
              const { data: replies } = await supabase
                .from('comments')
                .select(`
                  *,
                  profile:profiles!comments_user_id_fkey(*)
                `)
                .eq('parent_id', comment.id)
                .order('created_at', { ascending: true });

              // Get likes count for comment
              const { count: commentLikesCount } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('comment_id', comment.id);

              // Check if user liked comment
              let userHasLikedComment = false;
              if (user) {
                const { data: userLike } = await supabase
                  .from('likes')
                  .select('id')
                  .eq('comment_id', comment.id)
                  .eq('user_id', user.id)
                  .single();
                userHasLikedComment = !!userLike;
              }

              return {
                ...comment,
                replies: replies || [],
                likes_count: commentLikesCount || 0,
                user_has_liked: userHasLikedComment,
              };
            })
          );

          // Get likes count for post
          const { count: likesCount } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          // Check if user liked post
          let userHasLiked = false;
          if (user) {
            const { data: userLike } = await supabase
              .from('likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .single();
            userHasLiked = !!userLike;
          }

          return {
            ...post,
            comments: commentsWithReplies,
            likes_count: likesCount || 0,
            user_has_liked: userHasLiked,
          };
        })
      );

      setPosts(postsWithData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, imageUrl?: string) => {
    if (!user) throw new Error('Must be authenticated');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const createComment = async (postId: string, content: string, parentId?: string) => {
    if (!user) throw new Error('Must be authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        parent_id: parentId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const toggleLike = async (postId?: string, commentId?: string) => {
    if (!user) throw new Error('Must be authenticated');

    const query = supabase.from('likes').select('id');
    
    if (postId) {
      query.eq('post_id', postId);
    } else if (commentId) {
      query.eq('comment_id', commentId);
    }
    
    query.eq('user_id', user.id);

    const { data: existingLike } = await query.single();

    if (existingLike) {
      // Remove like
      await supabase.from('likes').delete().eq('id', existingLike.id);
    } else {
      // Add like
      await supabase.from('likes').insert({
        user_id: user.id,
        post_id: postId,
        comment_id: commentId,
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) throw new Error('Must be authenticated');

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const deleteComment = async (commentId: string) => {
    if (!user) throw new Error('Must be authenticated');

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  return {
    posts,
    loading,
    createPost,
    createComment,
    toggleLike,
    deletePost,
    deleteComment,
    refetch: fetchPosts,
  };
};