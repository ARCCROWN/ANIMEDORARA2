import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import { Movie } from '../types';
import { getAllMovies } from '../data/shows';

interface SuggestedMoviesProps {
  currentMovie: Movie;
  onMovieSelect?: (movie: Movie) => void;
}

const SuggestedMovies: React.FC<SuggestedMoviesProps> = ({ currentMovie, onMovieSelect }) => {
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null);

  useEffect(() => {
    // Generate suggestions based on current movie
    const allMovies = getAllMovies();
    const currentSeries = currentMovie.id.charAt(0);
    const currentGenres = currentMovie.genre.toLowerCase().split(', ');
    
    const suggested = allMovies
      .filter(movie => movie.id !== currentMovie.id)
      .map(movie => ({
        ...movie,
        score: calculateSimilarityScore(movie, currentSeries, currentGenres)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12); // Get top 12 suggestions

    setSuggestions(suggested);
  }, [currentMovie]);

  const calculateSimilarityScore = (movie: Movie, currentSeries: string, currentGenres: string[]) => {
    let score = 0;
    
    // Same series gets highest priority
    if (movie.id.charAt(0) === currentSeries) score += 5;
    
    // Genre matching
    const movieGenres = movie.genre.toLowerCase().split(', ');
    const genreMatches = currentGenres.filter(genre => 
      movieGenres.some(mg => mg.includes(genre) || genre.includes(mg))
    ).length;
    score += genreMatches * 3;
    
    // New releases get slight boost
    if (movie.isNew) score += 1;
    
    // Higher rated movies get boost
    const rating = parseFloat(movie.rating.split('/')[0]);
    if (rating >= 8.5) score += 3;
    else if (rating >= 8.0) score += 2;
    else if (rating >= 7.5) score += 1;
    
    return score;
  };

  const itemsPerView = window.innerWidth >= 1024 ? 6 : window.innerWidth >= 768 ? 4 : 2;
  const maxIndex = Math.max(0, suggestions.length - itemsPerView);

  const scrollLeft = () => {
    setCurrentIndex(Math.max(0, currentIndex - itemsPerView));
  };

  const scrollRight = () => {
    setCurrentIndex(Math.min(maxIndex, currentIndex + itemsPerView));
  };

  const handlePlayMovie = (movie: Movie) => {
    if (onMovieSelect) {
      onMovieSelect(movie);
    }
  };

  const handleShowDetails = (movie: Movie) => {
    if (onMovieSelect) {
      onMovieSelect(movie);
    }
  };

  const handleCardClick = (movie: Movie) => {
    if (onMovieSelect) {
      onMovieSelect(movie);
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="py-8" style={{ backgroundColor: '#1A1A1A' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>You Might Also Like</h2>
          
          {/* Navigation Arrows */}
          <div className="flex space-x-2">
            <button
              onClick={scrollLeft}
              disabled={currentIndex === 0}
              className={`p-2 rounded-full transition-all duration-200 shadow-md ${
                currentIndex === 0
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:shadow-lg transform hover:scale-105'
              }`}
              style={{
                backgroundColor: currentIndex === 0 ? '#2A2A2A' : '#404040',
                color: '#FFFFFF'
              }}
              aria-label="Previous movies"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollRight}
              disabled={currentIndex >= maxIndex}
              className={`p-2 rounded-full transition-all duration-200 shadow-md ${
                currentIndex >= maxIndex
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:shadow-lg transform hover:scale-105'
              }`}
              style={{
                backgroundColor: currentIndex >= maxIndex ? '#2A2A2A' : '#404040',
                color: '#FFFFFF'
              }}
              aria-label="Next movies"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out gap-5"
            style={{ 
              transform: `translateX(-${currentIndex * (220)}px)` // 200px width + 20px gap
            }}
          >
            {suggestions.map((movie) => (
              <div
                key={movie.id}
                className="flex-shrink-0"
                style={{ width: '200px' }} // Fixed 200px width as specified
                onMouseEnter={() => setHoveredMovie(movie.id)}
                onMouseLeave={() => setHoveredMovie(null)}
              >
                <div 
                  className="group relative rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer" 
                  style={{ backgroundColor: '#2A2A2A' }}
                  onClick={() => handleCardClick(movie)}
                >
                  {/* Movie Poster */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Overlay */}
                    <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
                      hoveredMovie === movie.id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="absolute inset-0 flex items-center justify-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayMovie(movie);
                          }}
                          className="p-2 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
                          style={{ backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
                          aria-label={`Play ${movie.title}`}
                        >
                          <Play className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowDetails(movie);
                          }}
                          className="p-2 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
                          style={{ backgroundColor: 'rgba(42, 42, 42, 0.8)', color: '#FFFFFF' }}
                          aria-label={`Details for ${movie.title}`}
                        >
                          <Info className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded flex items-center space-x-1 text-xs shadow-md" style={{ backgroundColor: 'rgba(42, 42, 42, 0.9)', color: '#FFFFFF' }}>
                      <span>⭐</span>
                      <span>{movie.rating.split('/')[0]}</span>
                    </div>

                    {/* New Badge */}
                    {movie.isNew && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold shadow-md">
                        NEW
                      </div>
                    )}
                  </div>

                  {/* Movie Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2 leading-tight" style={{ color: '#FFFFFF' }}>
                      {movie.title}
                    </h3>
                    <p className="text-xs line-clamp-1" style={{ color: '#E0E0E0' }}>
                      {movie.genre}
                    </p>
                    
                    {/* Duration - Mock data */}
                    <div className="mt-2">
                      <span className="text-xs" style={{ color: '#E0E0E0' }}>
                        1h 30m
                      </span>
                    </div>
                    
                    {/* Quick Info on Hover */}
                    <div className={`mt-2 transition-all duration-300 ${
                      hoveredMovie === movie.id ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}>
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: '#E0E0E0' }}>
                          {movie.watchSources.length} server{movie.watchSources.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-yellow-400 font-medium">
                          {movie.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: Math.ceil(suggestions.length / itemsPerView) }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * itemsPerView)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                Math.floor(currentIndex / itemsPerView) === index
                  ? ''
                  : 'hover:opacity-75'
              }`}
              style={{
                backgroundColor: Math.floor(currentIndex / itemsPerView) === index ? '#FFFFFF' : '#606060'
              }}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-8">
          <button 
            className="px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            style={{ backgroundColor: '#404040', color: '#FFFFFF' }}
          >
            Load More Suggestions
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestedMovies;