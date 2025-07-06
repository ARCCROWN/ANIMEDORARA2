import React, { useState } from 'react';
import { X, MessageSquare, Users, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useCommunity } from '../hooks/useCommunity';
import { useAdminCommunity } from '../hooks/useAdminCommunity';
import { useAuth } from '../hooks/useAuth';
import CommunitySection from './CommunitySection';

interface CommunityModalProps {
  onClose: () => void;
}

const CommunityModal: React.FC<CommunityModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [selectedMovie] = useState({ id: 'general', title: 'General Discussion' });

  if (!user.isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-semibold">Community Access</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">Join the Community</h3>
            <p className="text-gray-400 mb-6">
              Please log in to access community features and participate in discussions.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-xl font-semibold">Community Hub</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-1/4 border-r border-gray-700 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Community Stats</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Active Members</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Trending Topics</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Recent Activity</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-medium text-sm">Community Guidelines</span>
                </div>
                <p className="text-blue-300 text-xs">
                  All posts require admin approval. Be respectful and follow our community guidelines.
                </p>
              </div>
            </div>
          </div>

          {/* Main Community Section */}
          <div className="flex-1">
            <CommunitySection movie={selectedMovie as any} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityModal;