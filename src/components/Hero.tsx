import React, { useState, useEffect } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import { getAllMovies } from '../data/shows';
import MovieDetailsPanel from './MovieDetailsPanel';
import VideoPlayer from './VideoPlayer';

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const featuredMovies = getAllMovies().filter(movie => movie.isNew).slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!showDetails && !showVideoPlayer) {
        setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredMovies.length, showDetails, showVideoPlayer]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  // Enhanced background mapping with specific high-quality images
  const getBackgroundImage = (movie: Movie) => {
    const title = movie.title.toLowerCase();
    
    if (title.includes('sky utopia')) {
      return 'https://userstyles.org/style_screenshots/265606_after.jpeg?r=1751356808';
    } else if (title.includes('treasure island')) {
      return 'https://occ-0-8407-90.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABYX7MvDyy0GBTBEX29EBQi-HuMSIvRB9BpQJ5GR1sitpyde841gJH0NGYnLUtcujJJ3Qz4jWFN9kYQ_qU9f0wyn0asjSxFRpby1B.jpg?r=21c';
    } else if (title.includes('antarctic')) {
      return 'https://occ-0-8407-90.1.nflxso.net/dnm/api/v6/E8vDc_W8CLv7-yMQu8KMEC7Rrr8/AAAABU-3Xs5FQG0yM0wuOjzAyRjiD1rI-PEYgFk3-8SvJQWCqzdUOSPaOK3mrrCZkNVsY4HVQUDYY2jQxXO1UPYvboxSG7tt2B-X1xsi.jpg?r=307';
    } else if (title.includes('kung fu') || title.includes('ramen')) {
      return 'https://assets.mubicdn.com/images/film/204727/image-w1280.jpg?1745494966';
    } else if (title.includes('moon exploration') || title.includes('chronicle')) {
      return 'https://image.tmdb.org/t/p/original/9AmRLvf2xpVQ5vf2zouIwcGMz6n.jpg';
    }
    
    // Fallback to poster with enhanced quality
    return movie.poster;
  };

  const handleWatchNow = () => {
    setSelectedMovie(featuredMovies[currentSlide]);
    setShowVideoPlayer(true);
  };

  const handleShowDetails = () => {
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const handleClosePlayer = () => {
    setShowVideoPlayer(false);
    setSelectedMovie(null);
  };

  const handleMovieChange = (newMovie: Movie) => {
    setSelectedMovie(newMovie);
  };

  if (featuredMovies.length === 0) return null;

  const currentMovie = featuredMovies[currentSlide];
  const backgroundImage = getBackgroundImage(currentMovie);

  return (
    <>
      <div className="relative h-[70vh] overflow-hidden">
        {/* Background Image with enhanced loading */}
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt={currentMovie.title}
            className="w-full h-full object-cover transition-opacity duration-1000"
            style={{
              imageRendering: 'high-quality',
              objectPosition: 'center center'
            }}
            loading="eager"
            decoding="async"
          />
          {/* Enhanced gradient overlays for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
                {currentMovie.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-2 drop-shadow-lg">
                {currentMovie.genre}
              </p>
              <div className="flex items-center space-x-4 mb-8">
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  ⭐ {currentMovie.rating}
                </span>
                {currentMovie.isNew && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    NEW
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleWatchNow}
                  className="flex items-center justify-center space-x-2 bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Now</span>
                </button>
                <button 
                  onClick={handleShowDetails}
                  className="flex items-center justify-center space-x-2 bg-gray-800/80 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700/80 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Info className="w-5 h-5" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200 z-20 shadow-lg hover:shadow-xl"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200 z-20 shadow-lg hover:shadow-xl"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 shadow-lg ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Movie Details Panel */}
      <MovieDetailsPanel
        movie={currentMovie}
        isOpen={showDetails}
        onClose={handleCloseDetails}
        onWatchNow={handleWatchNow}
      />

      {/* Video Player */}
      {showVideoPlayer && selectedMovie && (
        <VideoPlayer
          movie={selectedMovie}
          onClose={handleClosePlayer}
          onMovieChange={handleMovieChange}
        />
      )}
    </>
  );
};

export default Hero;