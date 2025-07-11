import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, X, User, MessageSquare, LogOut } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';
import UserProfile from './UserProfile';
import CommunityModal from './CommunityModal';
import AuthModal from './AuthModal';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

const Header: React.FC<HeaderProps> = ({ onSearchChange, searchQuery }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { getUnreadCount, notifications } = useNotifications();
  const { user, profile, signOut, isAuthenticated } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);

  // Update unread count when notifications change
  useEffect(() => {
    const updateCount = () => {
      setUnreadCount(getUnreadCount());
    };

    updateCount();
    
    // Listen for storage changes to update count across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notifications') {
        updateCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [getUnreadCount, notifications]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isNotificationOpen && !target.closest('.notification-dropdown') && !target.closest('.notification-button')) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationOpen]);

  const handleCommunityClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setIsCommunityOpen(true);
    }
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setIsProfileOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    setIsProfileOpen(false);
    setIsCommunityOpen(false);
  };

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-white text-xl font-bold">ProjectZ</h1>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-gray-900 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-gray-500 focus:outline-none transition-colors duration-200"
              />
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Community */}
            <button
              onClick={handleCommunityClick}
              className="text-gray-400 hover:text-white transition-colors duration-200 relative"
              aria-label="Community"
            >
              <MessageSquare className="w-6 h-6" />
              {!isAuthenticated && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            {/* User Profile */}
            <div className="relative group">
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="User Profile"
              >
                {isAuthenticated && profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
                {isAuthenticated && profile && (
                  <span className="hidden sm:inline text-sm">{profile.username}</span>
                )}
              </button>

              {/* User Menu Dropdown */}
              {isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-200"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="notification-button text-gray-400 hover:text-white transition-colors duration-200 relative"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {isNotificationOpen && (
                <div className="notification-dropdown">
                  <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-gray-900 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-gray-500 focus:outline-none transition-colors duration-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* User Profile Modal */}
      {isProfileOpen && isAuthenticated && (
        <UserProfile onClose={() => setIsProfileOpen(false)} />
      )}

      {/* Community Modal */}
      {isCommunityOpen && isAuthenticated && (
        <CommunityModal onClose={() => setIsCommunityOpen(false)} />
      )}
    </header>
  );
};

export default Header;