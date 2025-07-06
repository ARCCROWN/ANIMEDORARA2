import React, { useState, useRef } from 'react';
import { User, Camera, Edit3, Heart, Clock, Star, Trash2, X, Check, AlertTriangle, Link, Key, Eye, EyeOff, Shield } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import ReportBrokenLinkModal from './ReportBrokenLinkModal';

interface UserProfileProps {
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const {
    profile,
    updateUsername,
    updateProfilePicture,
    clearWatchHistory,
    clearFavorites,
    getMovieRating
  } = useUserProfile();

  const { user, updateProfile, changePassword, useAdminKey, isAdmin } = useAuth();

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(profile.username);
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'ratings' | 'report' | 'security' | 'admin'>('favorites');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Admin key state
  const [adminKeyCode, setAdminKeyCode] = useState('');
  const [adminKeyLoading, setAdminKeyLoading] = useState(false);

  const handleUsernameSubmit = () => {
    try {
      updateUsername(newUsername);
      updateProfile({ username: newUsername });
      setIsEditingUsername(false);
      setSuccess('Username updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleProfilePictureUrl = () => {
    if (!imageUrl.trim()) {
      setError('Please enter a valid image URL');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      new URL(imageUrl);
      updateProfilePicture(imageUrl.trim());
      updateProfile({ profilePicture: imageUrl.trim() });
      setImageUrl('');
      setShowImageUrlInput(false);
      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Please enter a valid image URL');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all password fields');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const result = changePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (result.success) {
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to change password');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAdminKeySubmit = async () => {
    if (!adminKeyCode.trim()) {
      setError('Please enter an admin key');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setAdminKeyLoading(true);
    try {
      const result = await useAdminKey(adminKeyCode.trim());
      
      if (result.success) {
        setSuccess('Admin privileges granted successfully!');
        setAdminKeyCode('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to use admin key');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Failed to use admin key');
      setTimeout(() => setError(''), 3000);
    } finally {
      setAdminKeyLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
        }`}
      />
    ));
  };

  const getDefaultAvatar = () => {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" fill="#3B82F6"/>
        <text x="64" y="80" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">Z</text>
      </svg>
    `)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <h2 className="text-white text-2xl font-bold">User Profile</h2>
            {isAdmin() && (
              <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-semibold">
                ADMIN
              </span>
            )}
          </div>
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
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = getDefaultAvatar();
                      }}
                    />
                  ) : (
                    <img
                      src={getDefaultAvatar()}
                      alt="Default Profile"
                      className="w-full h-full object-cover"
                    />
                  )}
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
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-gray-400 text-sm">Favorites</span>
                </div>
                <p className="text-white text-xl font-bold">{profile.favoriteMovies.length}</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm">Watched</span>
                </div>
                <p className="text-white text-xl font-bold">{profile.watchHistory.length}</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-400 text-sm">Ratings</span>
                </div>
                <p className="text-white text-xl font-bold">{profile.movieRatings.length}</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-sm">Member Since</span>
                </div>
                <p className="text-white text-sm">{formatDate(profile.joinDate)}</p>
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
                Favorites ({profile.favoriteMovies.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                History ({profile.watchHistory.length})
              </button>
              <button
                onClick={() => setActiveTab('ratings')}
                className={`px-4 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'ratings'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Ratings ({profile.movieRatings.length})
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Security
              </button>
              {!isAdmin() && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                    activeTab === 'admin'
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Admin Access
                </button>
              )}
              <button
                onClick={() => setActiveTab('report')}
                className={`px-4 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'report'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Report Issues
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'favorites' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white text-lg font-semibold">Favorite Movies</h3>
                    {profile.favoriteMovies.length > 0 && (
                      <button
                        onClick={clearFavorites}
                        className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>

                  {profile.favoriteMovies.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No favorite movies yet</p>
                      <p className="text-gray-500 text-sm">Start adding movies to your favorites!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.favoriteMovies.map((favorite) => (
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
                    {profile.watchHistory.length > 0 && (
                      <button
                        onClick={clearWatchHistory}
                        className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>

                  {profile.watchHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No watch history yet</p>
                      <p className="text-gray-500 text-sm">Start watching movies to build your history!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {profile.watchHistory.map((item) => (
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

              {activeTab === 'ratings' && (
                <div>
                  <h3 className="text-white text-lg font-semibold mb-6">My Movie Ratings</h3>

                  {profile.movieRatings.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No movie ratings yet</p>
                      <p className="text-gray-500 text-sm">Start rating movies to track your preferences!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {profile.movieRatings
                        .sort((a, b) => new Date(b.ratedAt).getTime() - new Date(a.ratedAt).getTime())
                        .map((rating) => (
                          <div key={rating.movieId} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors duration-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white font-medium">Movie ID: {rating.movieId}</p>
                                <p className="text-gray-400 text-sm">Rated {formatDate(rating.ratedAt)}</p>
                              </div>
                              <div className="flex items-center space-x-1">
                                {renderStars(rating.rating)}
                                <span className="text-white ml-2">{rating.rating}/5</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h3 className="text-white text-lg font-semibold mb-6">Security Settings</h3>
                  
                  <div className="space-y-6">
                    {/* Password Section */}
                    <div className="bg-gray-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Key className="w-5 h-5 text-blue-400" />
                          <h4 className="text-white text-lg font-semibold">Password</h4>
                        </div>
                        <button
                          onClick={() => setShowPasswordChange(!showPasswordChange)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          Change Password
                        </button>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4">
                        Keep your account secure by using a strong password and changing it regularly.
                      </p>

                      {showPasswordChange && (
                        <div className="space-y-4 border-t border-gray-700 pt-4">
                          <div>
                            <label className="block text-gray-400 text-sm mb-2">Current Password</label>
                            <div className="relative">
                              <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full bg-gray-700 text-white px-3 py-2 pr-10 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-gray-400 text-sm mb-2">New Password</label>
                            <div className="relative">
                              <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full bg-gray-700 text-white px-3 py-2 pr-10 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="Enter new password"
                                minLength={6}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-gray-400 text-sm mb-2">Confirm New Password</label>
                            <div className="relative">
                              <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full bg-gray-700 text-white px-3 py-2 pr-10 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="Confirm new password"
                                minLength={6}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setShowPasswordChange(false);
                                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                              }}
                              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handlePasswordChange}
                              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              Update Password
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Account Info */}
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h4 className="text-white text-lg font-semibold mb-4">Account Information</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Account Type:</span>
                          <span className="text-white">{isAdmin() ? 'Administrator' : 'Standard User'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Password Protected:</span>
                          <span className="text-green-400">Yes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Member Since:</span>
                          <span className="text-white">{formatDate(profile.joinDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Security Tips */}
                    <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
                      <h4 className="text-blue-400 font-medium mb-2">Security Tips:</h4>
                      <ul className="text-blue-300 text-sm space-y-1">
                        <li>• Use a strong password with at least 6 characters</li>
                        <li>• Don't share your password with anyone</li>
                        <li>• Change your password regularly</li>
                        <li>• Log out from shared devices</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'admin' && !isAdmin() && (
                <div>
                  <h3 className="text-white text-lg font-semibold mb-6">Admin Access</h3>
                  
                  <div className="space-y-6">
                    {/* Admin Key Section */}
                    <div className="bg-gray-800 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Shield className="w-6 h-6 text-yellow-400" />
                        <h4 className="text-white text-lg font-semibold">Become an Admin</h4>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4">
                        Enter an admin key to gain administrative privileges. Admin keys can only be used once.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Admin Key</label>
                          <input
                            type="text"
                            value={adminKeyCode}
                            onChange={(e) => setAdminKeyCode(e.target.value)}
                            placeholder="Enter admin key (e.g., 380015)"
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            disabled={adminKeyLoading}
                          />
                        </div>

                        <button
                          onClick={handleAdminKeySubmit}
                          disabled={adminKeyLoading || !adminKeyCode.trim()}
                          className="w-full bg-yellow-600 text-black py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {adminKeyLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4" />
                              <span>Activate Admin Access</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Admin Benefits */}
                    <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
                      <h4 className="text-yellow-400 font-medium mb-2">Admin Privileges Include:</h4>
                      <ul className="text-yellow-300 text-sm space-y-1">
                        <li>• Access to admin panel for community moderation</li>
                        <li>• Approve or reject user posts</li>
                        <li>• Manage content reports</li>
                        <li>• Monitor community activity</li>
                        <li>• Special admin badge display</li>
                      </ul>
                    </div>

                    {/* Available Keys Info */}
                    <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
                      <h4 className="text-blue-400 font-medium mb-2">Available Admin Keys:</h4>
                      <p className="text-blue-300 text-sm">
                        Contact the administrator to obtain an admin key. Each key can only be used once and grants permanent admin access to your account.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'report' && (
                <div>
                  <h3 className="text-white text-lg font-semibold mb-6">Report Issues</h3>
                  
                  <div className="space-y-6">
                    {/* Report Broken Link */}
                    <div className="bg-gray-800 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-6 h-6 text-red-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white text-lg font-semibold mb-2">Report Broken Anime Link</h4>
                          <p className="text-gray-400 mb-4">
                            Found a broken video link or download that's not working? Let us know so we can fix it quickly.
                          </p>
                          <button
                            onClick={() => setShowReportModal(true)}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            <span>Report Broken Link</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Other Report Options */}
                    <div className="bg-gray-800 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white text-lg font-semibold mb-2">General Feedback</h4>
                          <p className="text-gray-400 mb-4">
                            Have suggestions for improving ProjectZ? We'd love to hear your feedback.
                          </p>
                          <button
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            onClick={() => window.open('mailto:support@projectz.com?subject=General Feedback', '_blank')}
                          >
                            Send Feedback
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Help Section */}
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h4 className="text-white text-lg font-semibold mb-4">Need Help?</h4>
                      <div className="space-y-3 text-gray-400">
                        <p>• <strong>Video not loading?</strong> Try refreshing the page or switching to a different server</p>
                        <p>• <strong>Download not working?</strong> Check your internet connection and try again</p>
                        <p>• <strong>Missing anime?</strong> Use the report feature to let us know what you'd like to see</p>
                        <p>• <strong>Technical issues?</strong> Clear your browser cache and cookies</p>
                        <p>• <strong>Forgot password?</strong> Contact support for account recovery</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Broken Link Modal */}
      <ReportBrokenLinkModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};

export default UserProfile;