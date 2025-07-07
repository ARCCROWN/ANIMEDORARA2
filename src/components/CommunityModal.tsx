import React, { useState, useRef } from 'react';
import { X, Search, Bell, Image, Link, Smile, Send, Heart, MessageCircle, MoreHorizontal, Trash2, Reply } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCommunity } from '../hooks/useCommunity';
import { formatDistanceToNow } from 'date-fns';

interface CommunityModalProps {
  onClose: () => void;
}

const CommunityModal: React.FC<CommunityModalProps> = ({ onClose }) => {
  const { user, profile } = useAuth();
  const { posts, loading, createPost, createComment, toggleLike, deletePost, deleteComment } = useCommunity();
  const [newPostContent, setNewPostContent] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'trending' | 'following'>('recent');
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId?: string; username: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      await createPost(newPostContent.trim());
      setNewPostContent('');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateComment = async (postId: string, parentId?: string) => {
    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      await createComment(postId, replyContent.trim(), parentId);
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to create comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId?: string, commentId?: string) => {
    try {
      await toggleLike(postId, commentId);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async (type: 'post' | 'comment', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      if (type === 'post') {
        await deletePost(id);
      } else {
        await deleteComment(id);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}. Please try again.`);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg p-6 text-center">
          <h3 className="text-white text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-gray-400 mb-4">Please sign in to access the community.</p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-blue-400">AnimeZ</h1>
          <div className="hidden md:flex items-center bg-gray-800 rounded-full px-4 py-2 w-96">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search posts, anime, users..."
              className="bg-transparent text-white placeholder-gray-400 flex-1 outline-none"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
          </button>
          <img
            src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4">
            {/* Create Post */}
            <div className="bg-gray-900 rounded-2xl p-6 mb-6">
              <div className="flex space-x-4">
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`}
                  alt="Your avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What's happening in the anime world?"
                    className="w-full bg-transparent text-white placeholder-gray-400 text-xl resize-none outline-none"
                    rows={3}
                    maxLength={280}
                  />
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Image className="w-5 h-5" />
                      </button>
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        <Link className="w-5 h-5" />
                      </button>
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-400 text-sm">{280 - newPostContent.length}</span>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() || submitting}
                        className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800 mb-6">
              {[
                { key: 'recent', label: 'Recent', icon: '🕒' },
                { key: 'trending', label: 'Trending', icon: '📈' },
                { key: 'following', label: 'Following', icon: '❤️' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-4 px-6 font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Posts */}
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No posts yet</p>
                <p className="text-gray-500">Be the first to share something!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-gray-900 rounded-2xl p-6">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={post.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profile?.username}`}
                          alt={post.profile?.username}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h4 className="text-white font-medium">{post.profile?.username}</h4>
                          <p className="text-gray-400 text-sm">{formatTime(post.created_at)}</p>
                        </div>
                      </div>
                      
                      {post.user_id === user.id && (
                        <div className="relative group">
                          <button className="text-gray-400 hover:text-white transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button
                              onClick={() => handleDelete('post', post.id)}
                              className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg w-full text-left"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-white text-lg leading-relaxed">{post.content}</p>
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt="Post image"
                          className="mt-4 rounded-xl max-w-full h-auto"
                        />
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center space-x-6 py-2 border-t border-gray-800">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-2 transition-colors ${
                          post.user_has_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.user_has_liked ? 'fill-current' : ''}`} />
                        <span>{post.likes_count || 0}</span>
                      </button>
                      
                      <button
                        onClick={() => setReplyingTo({ postId: post.id, username: post.profile?.username || 'User' })}
                        className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                    </div>

                    {/* Comments */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex space-x-3">
                            <img
                              src={comment.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.profile?.username}`}
                              alt={comment.profile?.username}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="bg-gray-800 rounded-2xl px-4 py-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-white font-medium text-sm">{comment.profile?.username}</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-400 text-xs">{formatTime(comment.created_at)}</span>
                                    {comment.user_id === user.id && (
                                      <button
                                        onClick={() => handleDelete('comment', comment.id)}
                                        className="text-gray-400 hover:text-red-400 transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-gray-200 text-sm">{comment.content}</p>
                              </div>
                              
                              <div className="flex items-center space-x-4 mt-2">
                                <button
                                  onClick={() => handleLike(undefined, comment.id)}
                                  className={`flex items-center space-x-1 text-xs transition-colors ${
                                    comment.user_has_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                                  }`}
                                >
                                  <Heart className={`w-3 h-3 ${comment.user_has_liked ? 'fill-current' : ''}`} />
                                  <span>{comment.likes_count || 0}</span>
                                </button>
                                
                                <button
                                  onClick={() => setReplyingTo({ 
                                    postId: post.id, 
                                    commentId: comment.id, 
                                    username: comment.profile?.username || 'User' 
                                  })}
                                  className="flex items-center space-x-1 text-xs text-gray-400 hover:text-blue-400 transition-colors"
                                >
                                  <Reply className="w-3 h-3" />
                                  <span>Reply</span>
                                </button>
                              </div>

                              {/* Replies */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id} className="flex space-x-2">
                                      <img
                                        src={reply.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.profile?.username}`}
                                        alt={reply.profile?.username}
                                        className="w-6 h-6 rounded-full"
                                      />
                                      <div className="flex-1">
                                        <div className="bg-gray-700 rounded-xl px-3 py-2">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-white font-medium text-xs">{reply.profile?.username}</span>
                                            <span className="text-gray-400 text-xs">{formatTime(reply.created_at)}</span>
                                          </div>
                                          <p className="text-gray-200 text-xs">{reply.content}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    {replyingTo?.postId === post.id && (
                      <div className="mt-4 flex space-x-3">
                        <img
                          src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`}
                          alt="Your avatar"
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-800 rounded-2xl px-4 py-3">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={`Reply to ${replyingTo.username}...`}
                              className="w-full bg-transparent text-white placeholder-gray-400 resize-none outline-none text-sm"
                              rows={2}
                            />
                            <div className="flex items-center justify-between mt-2">
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="text-gray-400 hover:text-white text-sm transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleCreateComment(post.id, replyingTo.commentId)}
                                disabled={!replyContent.trim() || submitting}
                                className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {submitting ? 'Replying...' : 'Reply'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityModal;