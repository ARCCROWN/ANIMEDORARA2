import React, { useState } from 'react';
import { User, Camera, Edit3, Heart, Clock, Star, X, Check, Eye, EyeOff } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface UserProfileProps {
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { profile: userProfile, clearWatchHistory, clearFavorites } = useUserProfile();
  const { profile, updateProfile } = useAuth();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'settings'>('favorites');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleUsernameSubmit = async () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    try {
      await updateProfile({ username: newUsername.trim() });
      setIsEditingUsername(false);
      setSuccess('Username updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleProfilePictureUrl = async () => {
    if (!imageUrl.trim()) {
      setError('Please enter a valid image URL');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      new URL(imageUrl);
      await updateProfile({ avatar_url: imageUrl.trim() });
      setImageUrl('');
      setShowImageUrlInput(false);
      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Please enter a valid image URL');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const getDefaultAvatar = () => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'user'}`;
  };

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg p-6 text-center">
          <h3 className="text-white text-lg font-semibold mb-2">Not Signed In</h3>
          <p className="text-gray-400 mb-4">Please sign in to view your profile.</p>
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
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-white text-2xl font-bold">User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-80px)]">
          {/* Profile Info Sidebar */}
          <div className="lg:w-1/3 p-6 border-r border-gray-700">
            {/* Profile Picture */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                  <img
                    src={profile.avatar_url || getDefaultAvatar()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getDefaultAvatar();
                    }}
                  />
                </div>
                <button
                  onClick={() => setShowImageUrlInput(true)}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-200"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image URL Input Modal */}
            {showImageUrlInput && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-white text-lg font-semibold mb-4">Update Profile Picture</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Image URL</label>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowImageUrlInput(false);
                          setImageUrl('');
                        }}
                        className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProfilePictureUrl}
                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors duration-200"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Username */}
            <div className="mb-6">
              {isEditingUsername ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter username"
                    maxLength={30}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUsernameSubmit}
                      className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors duration-200"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingUsername(false);
                        setNewUsername(profile.username);
                      }}
                      className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-xl font-semibold">{profile.username}</h3>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-gray-400 text-sm">{profile.email}</p>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-gray-400 text-sm">Favorites</span>
                </div>
                <p className="text-white text-xl font-bold">{userProfile.favoriteMovies.length}</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm">Watched</span>
                </div>
                <p className="text-white text-xl font-bold">{userProfile.watchHistory.length}</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-sm">Member Since</span>
                </div>
                <p className="text-white text-sm">{formatDate(profile.created_at)}</p>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mt-4 bg-red-600/20 border border-red-600 text-red-400 p-3 rounded text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 bg-green-600/20 border border-green-600 text-green-400 p-3 rounded text-sm">
                {success}
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="lg:w-2/3 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-700 overflow-x-auto">
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'favorites'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Favorites ({userProfile.favoriteMovies.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                History ({userProfile.watchHistory.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Settings
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'favorites' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white text-lg font-semibold">Favorite Movies</h3>
                    {userProfile.favoriteMovies.length > 0 && (
                      <button
                        onClick={clearFavorites}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200 text-sm"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {userProfile.favoriteMovies.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No favorite movies yet</p>
                      <p className="text-gray-500 text-sm">Start adding movies to your favorites!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userProfile.favoriteMovies.map((favorite) => (
                        <div key={favorite.movieId} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors duration-200">
                          <div className="flex space-x-4">
                            <img
                              src={favorite.moviePoster}
                              alt={favorite.movieTitle}
                              className="w-16 h-20 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">{favorite.movieTitle}</h4>
                              <p className="text-gray-400 text-sm">Added {formatDate(favorite.addedAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white text-lg font-semibold">Watch History</h3>
                    {userProfile.watchHistory.length > 0 && (
                      <button
                        onClick={clearWatchHistory}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200 text-sm"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {userProfile.watchHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No watch history yet</p>
                      <p className="text-gray-500 text-sm">Start watching movies to build your history!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userProfile.watchHistory.map((item) => (
                        <div key={`${item.movieId}-${item.watchedAt}`} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors duration-200">
                          <div className="flex space-x-4">
                            <img
                              src={item.moviePoster}
                              alt={item.movieTitle}
                              className="w-16 h-20 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">{item.movieTitle}</h4>
                              <p className="text-gray-400 text-sm">Watched {formatDate(item.watchedAt)}</p>
                              {item.progress > 0 && (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                    <span>Progress</span>
                                    <span>{Math.round(item.progress)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${item.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h3 className="text-white text-lg font-semibold mb-6">Account Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h4 className="text-white text-lg font-semibold mb-4">Account Information</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Username:</span>
                          <span className="text-white">{profile.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="text-white">{profile.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Member Since:</span>
                          <span className="text-white">{formatDate(profile.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
                      <h4 className="text-blue-400 font-medium mb-2">Profile Tips:</h4>
                      <ul className="text-blue-300 text-sm space-y-1">
                        <li>• Use a clear profile picture to help others recognize you</li>
                        <li>• Choose a unique username that represents you</li>
                        <li>• Keep your profile information up to date</li>
                        <li>• Engage with the community through posts and comments</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;