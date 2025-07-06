import { useState, useMemo } from 'react';
import { Movie, SearchFilters } from '../types';
import { getAllMovies } from '../data/shows';

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    series: '',
    genre: '',
    rating: '',
    year: '',
    language: ''
  });

  const allMovies = getAllMovies();

  const filteredMovies = useMemo(() => {
    let filtered = allMovies;

    // Search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Series filter
    if (filters.series) {
      filtered = filtered.filter(movie => {
        if (filters.series === 'doraemon') return movie.id.startsWith('1');
        if (filters.series === 'shinchan') return movie.id.startsWith('2');
        if (filters.series === 'pokemon') return movie.id.startsWith('3');
        return true;
      });
    }

    // Genre filter
    if (filters.genre) {
      filtered = filtered.filter(movie =>
        movie.genre.toLowerCase().includes(filters.genre.toLowerCase())
      );
    }

    // Rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(movie => {
        const rating = parseFloat(movie.rating.split('/')[0]);
        return rating >= minRating;
      });
    }

    return filtered;
  }, [searchQuery, filters, allMovies]);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      series: '',
      genre: '',
      rating: '',
      year: '',
      language: ''
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    filteredMovies
  };
};