import React, { useState } from 'react';
import { Play, Download, Star, Heart, Share2 } from 'lucide-react';
import { Movie } from '../types';
import { useUserProfile } from '../hooks/useUserProfile';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onShare?: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onPlay, onShare }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToFavorites, removeFromFavorites, isFavorite } = useUserProfile();

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite(movie.id)) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie.id, movie.title, movie.poster);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(movie);
    }
  };

  return (
    <div
      className="group relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isHovered ? 'scale-110' : 'scale-100'}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => onPlay(movie)}
              className="bg-white text-black p-3 rounded-full hover:bg-gray-200 transition-colors duration-200 transform hover:scale-110"
              aria-label={`Play ${movie.title}`}
            >
              <Play className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* New Badge */}
        {movie.isNew && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
            NEW
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded flex items-center space-x-1 text-xs">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span>{movie.rating.split('/')[0]}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 leading-tight">
          {movie.title}
        </h3>
        <p className="text-gray-400 text-xs mb-3 line-clamp-1">
          {movie.genre}
        </p>

        {/* Action Buttons */}
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <button
            onClick={() => onPlay(movie)}
            className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors duration-200"
            aria-label={`Watch ${movie.title}`}
          >
            <Play className="w-4 h-4" />
            <span className="text-xs">Watch</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleFavoriteToggle}
              className={`transition-colors duration-200 ${
                isFavorite(movie.id) 
                  ? 'text-red-400 hover:text-red-300' 
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label={`${isFavorite(movie.id) ? 'Remove from' : 'Add to'} favorites`}
            >
              <Heart className={`w-4 h-4 ${isFavorite(movie.id) ? 'fill-current' : ''}`} />
            </button>

            {onShare && (
              <button
                onClick={handleShare}
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label={`Share ${movie.title}`}
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            
            {movie.downloadSources.length > 0 && (
              <button
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label={`Download ${movie.title}`}
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;