import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';
import { Movie } from '../types';
import { useShare } from '../hooks/useShare';

interface ShareModalProps {
  movie: Movie;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ movie, onClose }) => {
  const { generateMovieUrl, copyToClipboard, shareToSocial, isSharing } = useShare();
  const [copied, setCopied] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  const movieUrl = generateMovieUrl(movie);

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(movieUrl);
    if (success) {
      setCopied(true);
      setCopySuccess('URL copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setCopySuccess('');
      }, 3000);
    } else {
      setCopySuccess('Failed to copy URL');
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    shareToSocial(movie, platform);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-white text-xl font-semibold">Share Movie</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Movie Info */}
          <div className="flex space-x-4 mb-6">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-16 h-20 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">{movie.title}</h3>
              <p className="text-gray-400 text-sm">{movie.genre}</p>
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-yellow-400">⭐</span>
                <span className="text-gray-300 text-sm">{movie.rating}</span>
              </div>
            </div>
          </div>

          {/* URL Copy Section */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Movie URL</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={movieUrl}
                readOnly
                className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 text-sm"
              />
              <button
                onClick={handleCopyUrl}
                disabled={copied}
                className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copySuccess && (
              <p className={`text-sm mt-2 ${
                copySuccess.includes('Failed') ? 'text-red-400' : 'text-green-400'
              }`}>
                {copySuccess}
              </p>
            )}
          </div>

          {/* Social Share Options */}
          <div>
            <label className="block text-gray-400 text-sm mb-3">Share on Social Media</label>
            <div className="grid grid-cols-3 gap-3">
              {/* Twitter */}
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex flex-col items-center space-y-2 bg-gray-800 hover:bg-blue-600 p-4 rounded-lg transition-colors duration-200 group"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-gray-300 group-hover:text-white text-xs">Twitter</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex flex-col items-center space-y-2 bg-gray-800 hover:bg-blue-700 p-4 rounded-lg transition-colors duration-200 group"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">f</span>
                </div>
                <span className="text-gray-300 group-hover:text-white text-xs">Facebook</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="flex flex-col items-center space-y-2 bg-gray-800 hover:bg-green-600 p-4 rounded-lg transition-colors duration-200 group"
              >
                <MessageCircle className="w-8 h-8 text-green-500" />
                <span className="text-gray-300 group-hover:text-white text-xs">WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Native Share Button (for mobile) */}
          {navigator.share && (
            <div className="mt-6">
              <button
                onClick={() => {
                  navigator.share({
                    title: `Watch ${movie.title} - AnimeStream`,
                    text: `Check out ${movie.title} on AnimeStream! ${movie.genre} • ${movie.rating}`,
                    url: movieUrl
                  });
                }}
                disabled={isSharing}
                className="w-full flex items-center justify-center space-x-2 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                <Share2 className="w-5 h-5" />
                <span>Share via Device</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;