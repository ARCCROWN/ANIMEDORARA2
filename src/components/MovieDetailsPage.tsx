import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Download, Star, Calendar, Clock, Globe, Share2, Heart, Plus } from 'lucide-react';
import { Movie } from '../types';
import { getAllMovies } from '../data/shows';
import VideoPlayer from './VideoPlayer';
import MovieCard from './MovieCard';

interface MovieDetailsPageProps {
  movie: Movie;
  onBack: () => void;
}

const MovieDetailsPage: React.FC<MovieDetailsPageProps> = ({ movie, onBack }) => {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);

  // Dynamic background mapping
  const getBackgroundImage = (movieTitle: string) => {
    const title = movieTitle.toLowerCase();
    
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
    
    // Default background based on series
    if (movie.id.startsWith('1')) {
      return 'https://occ-0-8407-90.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABYX7MvDyy0GBTBEX29EBQi-HuMSIvRB9BpQJ5GR1sitpyde841gJH0NGYnLUtcujJJ3Qz4jWFN9kYQ_qU9f0wyn0asjSxFRpby1B.jpg?r=21c';
    } else if (movie.id.startsWith('2')) {
      return 'https://assets.mubicdn.com/images/film/204727/image-w1280.jpg?1745494966';
    } else {
      return movie.poster;
    }
  };

  useEffect(() => {
    // Generate recommendations based on genre and series
    const allMovies = getAllMovies();
    const currentSeries = movie.id.charAt(0);
    const currentGenres = movie.genre.toLowerCase().split(', ');
    
    const recommended = allMovies
      .filter(m => m.id !== movie.id)
      .map(m => ({
        ...m,
        score: calculateRecommendationScore(m, currentSeries, currentGenres)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
    
    setRecommendations(recommended);
  }, [movie]);

  const calculateRecommendationScore = (m: Movie, currentSeries: string, currentGenres: string[]) => {
    let score = 0;
    
    // Same series gets higher score
    if (m.id.charAt(0) === currentSeries) score += 3;
    
    // Matching genres
    const movieGenres = m.genre.toLowerCase().split(', ');
    const genreMatches = currentGenres.filter(genre => 
      movieGenres.some(mg => mg.includes(genre) || genre.includes(mg))
    ).length;
    score += genreMatches * 2;
    
    // New releases get slight boost
    if (m.isNew) score += 1;
    
    // Higher rated movies get boost
    const rating = parseFloat(m.rating.split('/')[0]);
    if (rating >= 8.0) score += 2;
    else if (rating >= 7.5) score += 1;
    
    return score;
  };

  const backgroundImage = getBackgroundImage(movie.title);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero/Spotlight Section */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-20 flex items-center space-x-2 bg-black/50 text-white px-4 py-2 rounded-lg hover:bg-black/70 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Movie Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {movie.title}
                  </h1>
                  <p className="text-xl text-gray-300 mb-4">{movie.genre}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center space-x-1 bg-yellow-500 text-black px-3 py-1 rounded-full font-semibold">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{movie.rating}</span>
                    </div>
                    {movie.isNew && (
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        NEW RELEASE
                      </span>
                    )}
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">{movie.watchSources.length} Servers</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowVideoPlayer(true)}
                    className="flex items-center justify-center space-x-2 bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200 text-lg"
                  >
                    <Play className="w-6 h-6" />
                    <span>Watch Now</span>
                  </button>
                  
                  <div className="flex gap-3">
                    <button className="flex items-center justify-center bg-gray-800/80 text-white p-4 rounded-lg hover:bg-gray-700/80 transition-colors duration-200">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="flex items-center justify-center bg-gray-800/80 text-white p-4 rounded-lg hover:bg-gray-700/80 transition-colors duration-200">
                      <Plus className="w-5 h-5" />
                    </button>
                    <button className="flex items-center justify-center bg-gray-800/80 text-white p-4 rounded-lg hover:bg-gray-700/80 transition-colors duration-200">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Movie Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6">
                  <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-400 text-sm">Rating</span>
                    </div>
                    <p className="text-white font-semibold">{movie.rating.split('/')[0]}/10</p>
                  </div>
                  
                  <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400 text-sm">Servers</span>
                    </div>
                    <p className="text-white font-semibold">{movie.watchSources.length} Available</p>
                  </div>
                  
                  <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Download className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400 text-sm">Downloads</span>
                    </div>
                    <p className="text-white font-semibold">{movie.downloadSources.length} Options</p>
                  </div>
                </div>
              </div>

              {/* Movie Poster */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-80 h-auto rounded-xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Movie Details Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Watch Options */}
              <div>
                <h2 className="text-white text-2xl font-bold mb-6">Watch Options</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {movie.watchSources.map((source, index) => (
                    <div key={index} className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                      <h3 className="text-white font-semibold mb-2 capitalize">{source.type}</h3>
                      <p className="text-gray-400 text-sm mb-4">Stream in high quality</p>
                      <button
                        onClick={() => setShowVideoPlayer(true)}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors duration-200"
                      >
                        Watch on {source.type.charAt(0).toUpperCase() + source.type.slice(1)}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Options */}
              {movie.downloadSources.length > 0 && (
                <div>
                  <h2 className="text-white text-2xl font-bold mb-6">Download Options</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {movie.downloadSources.map((source, index) => (
                      <div key={index} className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                        <h3 className="text-white font-semibold mb-2 capitalize">{source.type}</h3>
                        <p className="text-gray-400 text-sm mb-4">Download for offline viewing</p>
                        <button
                          onClick={() => window.open(source.url, '_blank')}
                          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors duration-200"
                        >
                          Download from {source.type.charAt(0).toUpperCase() + source.type.slice(1)}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Movie Information */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-white text-xl font-bold mb-4">Movie Information</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400 text-sm">Genre</span>
                    <p className="text-white">{movie.genre}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Rating</span>
                    <p className="text-white">{movie.rating}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Status</span>
                    <p className="text-white">{movie.isNew ? 'New Release' : 'Available'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Servers Available</span>
                    <p className="text-white">{movie.watchSources.length}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-white text-xl font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 text-left text-gray-300 hover:text-white transition-colors duration-200">
                    <Heart className="w-5 h-5" />
                    <span>Add to Favorites</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 text-left text-gray-300 hover:text-white transition-colors duration-200">
                    <Plus className="w-5 h-5" />
                    <span>Add to Watchlist</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 text-left text-gray-300 hover:text-white transition-colors duration-200">
                    <Share2 className="w-5 h-5" />
                    <span>Share Movie</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* You Might Also Like Section */}
      <div className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-white text-3xl font-bold mb-8">You Might Also Like</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {recommendations.map((recMovie) => (
              <div key={recMovie.id} className="group">
                <MovieCard
                  movie={recMovie}
                  onPlay={() => setShowVideoPlayer(true)}
                />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-8">
            <button className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              Load More Recommendations
            </button>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && (
        <VideoPlayer
          movie={movie}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
    </div>
  );
};

export default MovieDetailsPage;