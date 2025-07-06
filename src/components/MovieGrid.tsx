import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import MovieCard from './MovieCard';
import VideoPlayer from './VideoPlayer';
import ShareModal from './ShareModal';
import { useUserProfile } from '../hooks/useUserProfile';

interface MovieGridProps {
  movies: Movie[];
  title: string;
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies, title }) => {
  const [displayedMovies, setDisplayedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [shareMovie, setShareMovie] = useState<Movie | null>(null);
  const [page, setPage] = useState(1);
  const { addToWatchHistory } = useUserProfile();

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    // Reset when movies change
    setDisplayedMovies(movies.slice(0, ITEMS_PER_PAGE));
    setPage(1);
    setHasMore(movies.length > ITEMS_PER_PAGE);
  }, [movies]);

  const loadMore = () => {
    if (loading || !hasMore) return;

    setLoading(true);
    
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newMovies = movies.slice(startIndex, endIndex);
      
      setDisplayedMovies(prev => [...prev, ...newMovies]);
      setPage(nextPage);
      setHasMore(endIndex < movies.length);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, page]);

  const handlePlayMovie = (movie: Movie) => {
    // Add to watch history when playing
    addToWatchHistory(movie.id, movie.title, movie.poster);
    setSelectedMovie(movie);
  };

  const handleShareMovie = (movie: Movie) => {
    setShareMovie(movie);
  };

  const handleMovieChange = (newMovie: Movie) => {
    setSelectedMovie(newMovie);
    addToWatchHistory(newMovie.id, newMovie.title, newMovie.poster);
  };

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-white text-xl mb-2">No movies found</h3>
        <p className="text-gray-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <section className="py-8">
      <h2 className="text-white text-2xl font-bold mb-6">{title}</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {displayedMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onPlay={handlePlayMovie}
            onShare={handleShareMovie}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Load more button for mobile */}
      {!loading && hasMore && (
        <div className="flex justify-center mt-8 md:hidden">
          <button
            onClick={loadMore}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Load More
          </button>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedMovie && (
        <VideoPlayer
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onMovieChange={handleMovieChange}
        />
      )}

      {/* Share Modal */}
      {shareMovie && (
        <ShareModal
          movie={shareMovie}
          onClose={() => setShareMovie(null)}
        />
      )}
    </section>
  );
};

export default MovieGrid;