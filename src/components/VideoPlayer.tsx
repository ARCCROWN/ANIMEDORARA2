import React, { useEffect, useRef, useState } from 'react';
import { X, Download, ExternalLink, Star, Calendar, Globe, Users, Maximize } from 'lucide-react';
import { Movie } from '../types';
import SuggestedMovies from './SuggestedMovies';

interface VideoPlayerProps {
  movie: Movie;
  onClose: () => void;
  onMovieChange?: (movie: Movie) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ movie, onClose, onMovieChange }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedServer, setSelectedServer] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen();
        } else {
          onClose();
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.body.style.overflow = 'unset';
      window.removeEventListener('resize', checkMobile);
    };
  }, [onClose, isFullscreen]);

  const handleMovieSelect = (selectedMovie: Movie) => {
    if (onMovieChange) {
      onMovieChange(selectedMovie);
    }
  };

  const getEmbedUrl = (source: any) => {
    switch (source.type) {
      case 'dailymotion':
        // Enhanced Dailymotion embed with all controls and fullscreen support
        return `https://www.dailymotion.com/embed/video/${source.id}?autoplay=0&mute=0&controls=1&ui-highlight=ffffff&ui-logo=0&sharing-enable=0&endscreen-enable=0&queue-enable=0&fullscreen=1&allowfullscreen=1`;
      case 'youtube':
        return `https://www.youtube.com/embed/${source.id}?autoplay=0&rel=0&modestbranding=1&controls=1&fs=1`;
      case 'facebook':
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(source.url)}&autoplay=0&show_text=0`;
      default:
        return source.url;
    }
  };

  const enterFullscreen = async () => {
    try {
      const videoContainer = iframeRef.current?.parentElement;
      if (videoContainer) {
        if (videoContainer.requestFullscreen) {
          await videoContainer.requestFullscreen();
        } else if ((videoContainer as any).webkitRequestFullscreen) {
          await (videoContainer as any).webkitRequestFullscreen();
        } else if ((videoContainer as any).msRequestFullscreen) {
          await (videoContainer as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Error entering fullscreen:', error);
      // Fallback: Try to make the iframe fullscreen
      try {
        if (iframeRef.current) {
          if ((iframeRef.current as any).requestFullscreen) {
            await (iframeRef.current as any).requestFullscreen();
          } else if ((iframeRef.current as any).webkitRequestFullscreen) {
            await (iframeRef.current as any).webkitRequestFullscreen();
          }
        }
      } catch (fallbackError) {
        console.error('Fallback fullscreen failed:', fallbackError);
      }
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
    }
  };

  const currentSource = movie.watchSources[selectedServer];

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto" ref={modalRef}>
      <div className="min-h-screen flex flex-col bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <h2 className="text-lg md:text-xl font-semibold text-white truncate">{movie.title}</h2>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-yellow-500 text-black px-2 py-1 rounded text-sm">
                <Star className="w-3 h-3 fill-current" />
                <span>{movie.rating.split('/')[0]}</span>
              </div>
              {movie.isNew && (
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  NEW
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-700 text-gray-300 hover:text-white transition-colors duration-200"
            aria-label="Close player"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Player Section */}
            <div className="lg:col-span-2">
              {/* Server Selection */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-white mb-2">Select Server:</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.watchSources.map((source, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedServer(index)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                        selectedServer === index
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {source.type.charAt(0).toUpperCase() + source.type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Player with Enhanced Fullscreen Support */}
              <div className="relative rounded-lg overflow-hidden shadow-2xl mb-4 bg-black">
                <div className="aspect-video relative group">
                  {currentSource ? (
                    <>
                      <iframe
                        ref={iframeRef}
                        src={getEmbedUrl(currentSource)}
                        className="w-full h-full"
                        allowFullScreen
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen; web-share"
                        title={movie.title}
                        style={{ border: 'none' }}
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
                      />
                      
                      {/* Custom Fullscreen Button Overlay */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                          className="bg-black/70 text-white p-2 rounded-lg hover:bg-black/90 transition-colors duration-200 backdrop-blur-sm"
                          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                        >
                          <Maximize className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Fullscreen Instructions */}
                      <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-black/70 text-white text-xs px-3 py-2 rounded backdrop-blur-sm">
                          Press F or click fullscreen button for better experience
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                      <div className="text-center">
                        <div className="text-4xl md:text-6xl mb-4">📺</div>
                        <p className="text-lg md:text-xl mb-2">Video not available</p>
                        <p className="text-gray-400">Please try another server</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* External Links */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-white mb-2">Watch on External Sites:</h4>
                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                  {movie.watchSources.map((source, index) => (
                    <button
                      key={index}
                      className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                      onClick={() => {
                        let url = '';
                        if (source.type === 'dailymotion' && source.id) {
                          url = `https://www.dailymotion.com/video/${source.id}`;
                        } else if (source.type === 'youtube' && source.id) {
                          url = `https://www.youtube.com/watch?v=${source.id}`;
                        } else if (source.url) {
                          url = source.url;
                        }
                        if (url) window.open(url, '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="capitalize truncate">{source.type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fullscreen Tips */}
              <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4 mb-4">
                <h4 className="text-blue-400 font-medium mb-2">Fullscreen Tips:</h4>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• Click the fullscreen button in the top-right corner of the video</li>
                  <li>• Press 'F' key while hovering over the video</li>
                  <li>• Use the player's built-in fullscreen controls</li>
                  <li>• Press 'Esc' to exit fullscreen mode</li>
                </ul>
              </div>
            </div>

            {/* Movie Details Section */}
            <div className="lg:col-span-1">
              {/* Movie Poster */}
              <div className="mb-6">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full max-w-xs mx-auto rounded-lg shadow-lg"
                />
              </div>

              {/* Movie Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Movie Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-800 rounded flex-shrink-0">
                        <Users className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-400">Genre</p>
                        <p className="text-sm text-white break-words">{movie.genre}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-800 rounded flex-shrink-0">
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Rating</p>
                        <p className="text-sm text-white">{movie.rating}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-800 rounded flex-shrink-0">
                        <Globe className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Available Servers</p>
                        <p className="text-sm text-white">{movie.watchSources.length} servers</p>
                      </div>
                    </div>

                    {movie.isNew && (
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-800 rounded flex-shrink-0">
                          <Calendar className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <p className="text-sm font-medium text-green-400">New Release</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Download Section */}
                {movie.downloadSources.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Download Options</h4>
                    <div className="space-y-2">
                      {movie.downloadSources.map((source, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 rounded transition-all duration-200 shadow-md hover:shadow-lg"
                          onClick={() => window.open(source.url, '_blank')}
                        >
                          <Download className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-white capitalize truncate">{source.type}</span>
                          <ExternalLink className="w-3 h-3 text-gray-400 ml-auto flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Movies Section */}
        <SuggestedMovies currentMovie={movie} onMovieSelect={handleMovieSelect} />
      </div>
    </div>
  );
};

export default VideoPlayer;