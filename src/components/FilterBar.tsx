import React from 'react';
import { Filter, X } from 'lucide-react';
import { SearchFilters } from '../types';

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: string) => void;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onClearFilters }) => {
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-white font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Series Filter */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Series</label>
          <select
            value={filters.series}
            onChange={(e) => onFilterChange('series', e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-gray-500 focus:outline-none transition-colors duration-200"
          >
            <option value="">All Series</option>
            <option value="doraemon">Doraemon</option>
            <option value="shinchan">Shin-chan</option>
            <option value="pokemon">Pokemon</option>
          </select>
        </div>

        {/* Genre Filter */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Genre</label>
          <select
            value={filters.genre}
            onChange={(e) => onFilterChange('genre', e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-gray-500 focus:outline-none transition-colors duration-200"
          >
            <option value="">All Genres</option>
            <option value="adventure">Adventure</option>
            <option value="comedy">Comedy</option>
            <option value="family">Family</option>
            <option value="sci-fi">Sci-Fi</option>
            <option value="fantasy">Fantasy</option>
            <option value="animation">Animation</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Minimum Rating</label>
          <select
            value={filters.rating}
            onChange={(e) => onFilterChange('rating', e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-gray-500 focus:outline-none transition-colors duration-200"
          >
            <option value="">Any Rating</option>
            <option value="7.0">7.0+</option>
            <option value="7.5">7.5+</option>
            <option value="8.0">8.0+</option>
            <option value="8.5">8.5+</option>
            <option value="9.0">9.0+</option>
          </select>
        </div>

        {/* Language Filter */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">Language</label>
          <select
            value={filters.language}
            onChange={(e) => onFilterChange('language', e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-gray-500 focus:outline-none transition-colors duration-200"
          >
            <option value="">All Languages</option>
            <option value="japanese">Japanese</option>
            <option value="english">English</option>
            <option value="dubbed">Dubbed</option>
            <option value="subtitled">Subtitled</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;