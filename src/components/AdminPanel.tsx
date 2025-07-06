import React, { useState } from 'react';
import { Shield, Users, MessageSquare, Flag, Settings, BarChart3, X, CheckCircle, AlertTriangle, Trash2, Eye } from 'lucide-react';
import { useAdminCommunity } from '../hooks/useAdminCommunity';
import { formatDistanceToNow } from 'date-fns';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { pendingPosts, reports, approvePost, rejectPost, deletePost, resolveReport } = useAdminCommunity();
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'reports' | 'users'>('overview');

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

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-yellow-400" />
            <h2 className="text-white text-xl font-semibold">Admin Panel</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-1/4 border-r border-gray-700 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('posts')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  activeTab === 'posts' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Pending Posts</span>
                {pendingPosts.length > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    {pendingPosts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  activeTab === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Flag className="w-5 h-5" />
                <span>Reports</span>
                {reports.length > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    {reports.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Users</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="p-6">
                <h3 className="text-white text-2xl font-bold mb-6">Admin Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <MessageSquare className="w-8 h-8 text-blue-400" />
                      <h4 className="text-white text-lg font-semibold">Pending Posts</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">{pendingPosts.length}</p>
                    <p className="text-gray-400 text-sm">Posts awaiting approval</p>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Flag className="w-8 h-8 text-red-400" />
                      <h4 className="text-white text-lg font-semibold">Reports</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">{reports.length}</p>
                    <p className="text-gray-400 text-sm">Content reports to review</p>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Users className="w-8 h-8 text-green-400" />
                      <h4 className="text-white text-lg font-semibold">Active Users</h4>
                    </div>
                    <p className="text-3xl font-bold text-white">24</p>
                    <p className="text-gray-400 text-sm">Users online today</p>
                  </div>
                </div>

                <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Admin Responsibilities</span>
                  </div>
                  <ul className="text-yellow-300 text-sm space-y-1">
                    <li>• Review and approve/reject community posts</li>
                    <li>• Handle content reports and moderation</li>
                    <li>• Monitor user activity and behavior</li>
                    <li>• Maintain community guidelines</li>
                    <li>• Ensure platform safety and quality</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="p-6">
                <h3 className="text-white text-2xl font-bold mb-6">Pending Posts ({pendingPosts.length})</h3>
                
                {pendingPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No pending posts</p>
                    <p className="text-gray-500 text-sm">All posts have been reviewed</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingPosts.map((post) => (
                      <div key={post.id} className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={post.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`}
                              alt={post.username}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="text-white font-medium">{post.username}</p>
                              <p className="text-gray-400 text-sm">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded text-xs text-white ${getCategoryColor(post.category)}`}>
                              {post.category}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-200 leading-relaxed">{post.content}</p>
                          
                          {post.image_url && (
                            <img
                              src={post.image_url}
                              alt="Post image"
                              className="mt-3 rounded-lg max-w-md"
                            />
                          )}
                          
                          {post.link_url && (
                            <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <span className="text-blue-400 text-sm">🔗 {post.link_title}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => approvePost(post.id)}
                            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          
                          <button
                            onClick={() => rejectPost(post.id)}
                            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                          
                          <button
                            onClick={() => deletePost(post.id)}
                            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="p-6">
                <h3 className="text-white text-2xl font-bold mb-6">Content Reports ({reports.length})</h3>
                
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No pending reports</p>
                    <p className="text-gray-500 text-sm">All reports have been resolved</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reports.map((report) => (
                      <div key={report.id} className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Flag className="w-6 h-6 text-red-400" />
                            <div>
                              <p className="text-white font-medium">Report from User</p>
                              <p className="text-gray-400 text-sm">
                                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-300 mb-2"><strong>Reason:</strong> {report.reason}</p>
                          <p className="text-gray-400 text-sm">Report ID: {report.id}</p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => resolveReport(report.id)}
                            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Resolve</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                            <Eye className="w-4 h-4" />
                            <span>View Content</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="p-6">
                <h3 className="text-white text-2xl font-bold mb-6">User Management</h3>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-white text-lg font-semibold mb-4">Admin Users</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">admin</p>
                          <p className="text-gray-400 text-sm">Administrator</p>
                        </div>
                      </div>
                      <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-semibold">
                        ADMIN
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">moderator</p>
                          <p className="text-gray-400 text-sm">Moderator</p>
                        </div>
                      </div>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        MOD
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-blue-600/20 border border-blue-600 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">Admin Access:</h4>
                  <p className="text-blue-300 text-sm">
                    Users with usernames "admin" or "moderator" automatically get admin privileges. 
                    This includes access to the admin panel, post moderation, and user management features.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;