import React, { useState, useEffect } from 'react';
import { X, Search, AlertTriangle, Send, Check } from 'lucide-react';
import { getAllMovies } from '../data/shows';
import { Movie } from '../types';

interface ReportBrokenLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportBrokenLinkModal: React.FC<ReportBrokenLinkModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [reportData, setReportData] = useState({
    name: '',
    email: '',
    additionalDetails: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const allMovies = getAllMovies();
  const filteredMovies = allMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Initialize EmailJS
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      // Load EmailJS script if not already loaded
      if (!window.emailjs) {
        const script = document.createElement('script');
        script.src = 'https://cdn.emailjs.com/sdk/2.3.2/email.min.js';
        script.onload = () => {
          if (window.emailjs) {
            window.emailjs.init('y7_NNi0mZ5SMrJBzk');
          }
        };
        document.head.appendChild(script);
      } else {
        window.emailjs.init('y7_NNi0mZ5SMrJBzk');
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMovie) {
      setError('Please select an anime from the search results');
      return;
    }

    if (!reportData.name.trim() || !reportData.email.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare email data
      const templateParams = {
        from_name: reportData.name,
        from_email: reportData.email,
        anime_title: selectedMovie.title,
        anime_id: selectedMovie.id,
        anime_poster: selectedMovie.poster,
        watch_sources: selectedMovie.watchSources.map(source => `${source.type}: ${source.id || source.url || 'N/A'}`).join(', '),
        download_sources: selectedMovie.downloadSources.map(source => `${source.type}: ${source.url}`).join(', '),
        additional_details: reportData.additionalDetails || 'No additional details provided',
        report_date: new Date().toLocaleString(),
        anime_genre: selectedMovie.genre,
        anime_rating: selectedMovie.rating
      };

      // Send email using EmailJS
      if (window.emailjs) {
        await window.emailjs.send('service_z5rfp68', 'template_xmq3l8p', templateParams);
        setSuccess(true);
        
        // Reset form after successful submission
        setTimeout(() => {
          setReportData({ name: '', email: '', additionalDetails: '' });
          setSelectedMovie(null);
          setSearchQuery('');
          setSuccess(false);
          onClose();
        }, 3000);
      } else {
        throw new Error('EmailJS not loaded');
      }
    } catch (err) {
      console.error('Error sending report:', err);
      setError('Failed to send report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setSearchQuery(movie.title);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <h2 className="text-white text-xl font-semibold">Report Broken Anime Link</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Report Sent Successfully!</h3>
              <p className="text-gray-400">
                Thank you for reporting the broken link. We'll investigate and fix it as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anime Search */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Search for Anime <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type anime name to search..."
                    className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    required
                  />
                </div>

                {/* Search Results */}
                {searchQuery && !selectedMovie && (
                  <div className="mt-2 max-h-48 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg">
                    {filteredMovies.length > 0 ? (
                      filteredMovies.slice(0, 10).map((movie) => (
                        <button
                          key={movie.id}
                          type="button"
                          onClick={() => handleMovieSelect(movie)}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-gray-700 transition-colors duration-200 text-left"
                        >
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{movie.title}</p>
                            <p className="text-gray-400 text-sm">{movie.genre}</p>
                            <p className="text-yellow-400 text-sm">⭐ {movie.rating}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400">
                        No anime found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Movie */}
                {selectedMovie && (
                  <div className="mt-3 p-4 bg-gray-800 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedMovie.poster}
                        alt={selectedMovie.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{selectedMovie.title}</h3>
                        <p className="text-gray-400 text-sm">{selectedMovie.genre}</p>
                        <p className="text-yellow-400 text-sm">⭐ {selectedMovie.rating}</p>
                        <div className="mt-2">
                          <p className="text-gray-300 text-xs">
                            {selectedMovie.watchSources.length} watch source(s), {selectedMovie.downloadSources.length} download source(s)
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMovie(null);
                          setSearchQuery('');
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={reportData.name}
                    onChange={(e) => setReportData({ ...reportData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-gray-800 text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Your Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={reportData.email}
                    onChange={(e) => setReportData({ ...reportData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full bg-gray-800 text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    required
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={reportData.additionalDetails}
                  onChange={(e) => setReportData({ ...reportData, additionalDetails: e.target.value })}
                  placeholder="Describe the issue you encountered (e.g., video won't load, download link is broken, etc.)"
                  className="w-full bg-gray-800 text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors duration-200 resize-none"
                  rows={4}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-600/20 border border-red-600 text-red-400 p-3 rounded text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedMovie}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Report</span>
                    </>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="bg-blue-600/20 border border-blue-600 text-blue-400 p-3 rounded text-sm">
                <p className="font-medium mb-1">How this helps:</p>
                <ul className="text-xs space-y-1">
                  <li>• We'll receive detailed information about the broken link</li>
                  <li>• Our team will investigate and fix the issue promptly</li>
                  <li>• You'll help improve the experience for all users</li>
                </ul>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Extend window interface for EmailJS
declare global {
  interface Window {
    emailjs: any;
  }
}

export default ReportBrokenLinkModal;