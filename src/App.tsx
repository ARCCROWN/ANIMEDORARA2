import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SeriesSection from './components/SeriesSection';
import MovieGrid from './components/MovieGrid';
import FilterBar from './components/FilterBar';
import { useSearch } from './hooks/useSearch';
import { useNotifications } from './hooks/useNotifications';
import { useAuth } from './hooks/useAuth';
import { getAllMovies } from './data/shows';

function App() {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    filteredMovies
  } = useSearch();

  const { initNotifications } = useNotifications();
  const { loading: authLoading } = useAuth();
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Initialize notifications on app load
  useEffect(() => {
    initNotifications();
  }, [initNotifications]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update search query with debounced value
  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchQuery]);

  const allMovies = getAllMovies();
  const newMovies = allMovies.filter(movie => movie.isNew);
  const isSearching = searchQuery.trim() !== '' || Object.values(filters).some(value => value !== '');

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading ProjectZ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header 
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      />
      
      <main>
        {!isSearching && <Hero />}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!isSearching && <SeriesSection />}
          
          <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
          />

          {isSearching ? (
            <MovieGrid
              movies={filteredMovies}
              title={`Search Results${searchQuery ? ` for "${searchQuery}"` : ''}`}
            />
          ) : (
            <>
              <MovieGrid
                movies={newMovies}
                title="New Releases"
              />
              
              <MovieGrid
                movies={allMovies}
                title="All Movies"
              />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-white text-lg font-semibold mb-2">ProjectZ</h3>
            <p className="text-gray-400 text-sm">
              Your ultimate destination for classic anime movies
            </p>
            <p className="text-gray-500 text-xs mt-4">
              © 2024 ProjectZ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;