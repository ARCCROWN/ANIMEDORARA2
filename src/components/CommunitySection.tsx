import React, { useState } from 'react';
import { MessageSquare, Heart, Share2, Flag, Send, Image, Link, Smile, MoreHorizontal, ThumbsUp, ThumbsDown, Reply, Edit, Trash2, X, Upload, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Movie } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { useCommunity } from '../hooks/useCommunity';
import { useAdminCommunity } from '../hooks/useAdminCommunity';
import { useAuth } from '../hooks/useAuth';

interface CommunitySectionProps {
  movie: Movie;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({ movie }) => {
  const { user } = useAuth();
  const { posts, loading, createPost, createComment, toggleReaction, reportContent } = useCommunity(movie.id);
  const { isAdmin, pendingPosts, approvePost, rejectPost, deletePost } = useAdminCommunity();
  
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    category: 'discussion' as 'discussion' | 'news' | 'fanart' | 'review' | 'question',
    imageFile: null as File | null,
    linkUrl: ''
  });
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sort posts
  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.likes - b.dislikes) - (a.likes - a.dislikes);
      case 'trending':
        const aScore = (a.likes - a.dislikes) / Math.max(1, (Date.now() - new Date(a.created_at).getTime()) / 3600000);
        const bScore = (b.likes - b.dislikes) / Math.max(1, (Date.now() - new Date(b.created_at).getTime()) / 3600000);
        return bScore - aScore;
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Handle post creation
  const handleCreatePost = async () => {
    if (!user.isAuthenticated) {
      setError('Please log in to create a post');
      return;
    }

    if (!newPost.content.trim()) {
      setError('Please enter some content');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let imageUrl = '';
      if (newPost.imageFile) {
        // In a real app, you'd upload to Supabase Storage
        imageUrl = URL.createObjectURL(newPost.imageFile);
      }

      await createPost({
        content: newPost.content,
        category: newPost.category,
        imageUrl,
        linkUrl: newPost.linkUrl
      });

      setNewPost({ content: '', category: 'discussion', imageFile: null, linkUrl: '' });
      setShowCreatePost(false);
      setSuccess('Post submitted for review! It will appear once approved by moderators.');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setNewPost({ ...newPost, imageFile: file });
      setError('');
    }
  };

  // Handle comment creation
  const handleAddComment = async (postId: string) => {
    if (!user.isAuthenticated) {
      setError('Please log in to comment');
      return;
    }

    if (!newComment.trim()) return;

    try {
      await createComment(postId, newComment);
      setNewComment('');
      setActiveCommentPost(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  // Handle reactions
  const handleReaction = async (targetId: string, reactionType: 'like' | 'dislike', targetType: 'post' | 'comment') => {
    if (!user.isAuthenticated) {
      setError('Please log in to react');
      return;
    }

    try {
      await toggleReaction(targetId, reactionType, targetType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to react');
    }
  };

  // Handle report
  const handleReport = async (targetId: string, targetType: 'post' | 'comment') => {
    if (!user.isAuthenticated) {
      setError('Please log in to report');
      return;
    }

    const reason = prompt('Please describe why you are reporting this content:');
    if (!reason) return;

    try {
      await reportContent(targetId, targetType, reason);
      alert('Content reported. Thank you for helping keep our community safe.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report content');
    }
  };

  // Category colors
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'news': return 'bg-blue-600';
      case 'discussion': return 'bg-green-600';
      case 'fanart': return 'bg-purple-600';
      case 'review': return 'bg-yellow-600';
      case 'question': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (!user.isAuthenticated) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 h-full max-h-[80vh] overflow-hidden flex flex-col items-center justify-center">
        <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-white text-lg font-semibold mb-2">Join the Community</h3>
        <p className="text-gray-400 text-center mb-4">
          Log in to participate in discussions, share your thoughts, and connect with other anime fans!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">Community</h3>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center space-x-1"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Admin ({pendingPosts.length})</span>
            </button>
          )}
          <button
            onClick={() => setShowGuidelines(true)}
            className="text-gray-400 hover:text-white text-sm"
          >
            Guidelines
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex space-x-2 mb-4">
        {(['latest', 'popular', 'trending'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
              sortBy === option
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Create Post Button */}
      <button
        onClick={() => setShowCreatePost(true)}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 mb-4"
      >
        Create Post
      </button>

      {/* Success Message */}
      {success && (
        <div className="bg-green-600/20 border border-green-600 text-green-400 p-3 rounded mb-4 text-sm">
          {success}
          <button onClick={() => setSuccess('')} className="float-right">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-600/20 border border-red-600 text-red-400 p-3 rounded mb-4 text-sm">
          {error}
          <button onClick={() => setError('')} className="float-right">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Real-time Status Indicator */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center space-x-2 bg-green-600/20 border border-green-600 text-green-400 px-3 py-1 rounded text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Real-time updates active</span>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No posts yet</p>
            <p className="text-gray-500 text-sm">Be the first to start a discussion!</p>
          </div>
        ) : (
          sortedPosts.map((post) => (
            <div key={post.id} className="bg-gray-700 rounded-lg p-4">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`}
                    alt={post.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-white text-sm font-medium">{post.username}</p>
                    <p className="text-gray-400 text-xs">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs text-white ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>
                <button
                  onClick={() => handleReport(post.id, 'post')}
                  className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                  aria-label="Report post"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Post Content */}
              <div className="mb-3">
                <p className="text-gray-200 text-sm leading-relaxed">{post.content}</p>
                
                {/* Image */}
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post image"
                    className="mt-3 rounded-lg max-w-full h-auto"
                  />
                )}
                
                {/* Link Preview */}
                {post.link_url && (
                  <a
                    href={post.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block p-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <Link className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 text-sm">{post.link_title}</span>
                    </div>
                  </a>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleReaction(post.id, 'like', 'post')}
                    className={`flex items-center space-x-1 transition-colors duration-200 ${
                      post.user_reaction === 'like' ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  
                  <button
                    onClick={() => handleReaction(post.id, 'dislike', 'post')}
                    className={`flex items-center space-x-1 transition-colors duration-200 ${
                      post.user_reaction === 'dislike' ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span className="text-sm">{post.dislikes}</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{post.comments?.length || 0}</span>
                  </button>
                </div>
                
                <button className="text-gray-400 hover:text-white transition-colors duration-200">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Comments */}
              {post.comments && post.comments.length > 0 && (
                <div className="mt-4 space-y-3">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-600 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <img
                          src={comment.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`}
                          alt={comment.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-white text-sm font-medium">{comment.username}</span>
                        <span className="text-gray-400 text-xs">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-200 text-sm">{comment.content}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleReaction(comment.id, 'like', 'comment')}
                          className={`flex items-center space-x-1 text-xs transition-colors duration-200 ${
                            comment.user_reaction === 'like' ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{comment.likes}</span>
                        </button>
                        <button
                          onClick={() => handleReport(comment.id, 'comment')}
                          className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              {activeCommentPost === post.id && (
                <div className="mt-4 flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Create Post</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Selection */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Category</label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value as any })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
              >
                <option value="discussion">Discussion</option>
                <option value="news">News</option>
                <option value="fanart">Fan Art</option>
                <option value="review">Review</option>
                <option value="question">Question</option>
              </select>
            </div>

            {/* Content */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Content</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="What's on your mind?"
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
              />
              {newPost.imageFile && (
                <p className="text-green-400 text-sm mt-1">Image selected: {newPost.imageFile.name}</p>
              )}
            </div>

            {/* Link URL */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">Link (optional)</label>
              <input
                type="url"
                value={newPost.linkUrl}
                onChange={(e) => setNewPost({ ...newPost, linkUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Pending Review Notice */}
            <div className="bg-yellow-600/20 border border-yellow-600 text-yellow-400 p-3 rounded mb-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Posts require admin approval before appearing publicly</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreatePost(false)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.content.trim() || submitting}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && isAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Admin Panel</h3>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              <h4 className="text-white font-medium mb-4">Pending Posts ({pendingPosts.length})</h4>
              
              {pendingPosts.length === 0 ? (
                <p className="text-gray-400">No pending posts</p>
              ) : (
                <div className="space-y-4">
                  {pendingPosts.map((post) => (
                    <div key={post.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{post.username}</span>
                          <span className={`px-2 py-1 rounded text-xs text-white ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-gray-200 text-sm mb-4">{post.content}</p>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approvePost(post.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors duration-200"
                        >
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => rejectPost(post.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors duration-200"
                        >
                          <X className="w-4 h-4 inline mr-1" />
                          Reject
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Modal */}
      {showGuidelines && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Community Guidelines</h3>
              <button
                onClick={() => setShowGuidelines(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-gray-300 text-sm">
              <div>
                <h4 className="text-white font-medium mb-2">Be Respectful</h4>
                <p>Treat all community members with respect. No harassment, hate speech, or personal attacks.</p>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Stay On Topic</h4>
                <p>Keep discussions related to the movie and anime content. Off-topic posts may be removed.</p>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">No Spam</h4>
                <p>Avoid repetitive posts, excessive self-promotion, or irrelevant content.</p>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Moderation</h4>
                <p>All posts require admin approval before appearing publicly. This helps maintain quality discussions.</p>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Reporting</h4>
                <p>Use the report button to flag inappropriate content. Help us maintain a positive community.</p>
              </div>
            </div>

            <button
              onClick={() => setShowGuidelines(false)}
              className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunitySection;