import React from 'react';
import { ChevronRight } from 'lucide-react';
import { showsData } from '../data/shows';

const SeriesSection: React.FC = () => {
  return (
    <section className="py-12">
      <h2 className="text-white text-3xl font-bold mb-8 text-center">Featured Series</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {showsData.map((show) => (
          <div
            key={show.id}
            className="group relative bg-gray-900 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            {/* Background Image */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={show.poster}
                alt={show.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-white text-2xl font-bold mb-2">{show.title}</h3>
              <p className="text-gray-300 mb-4">{show.moviesCount}</p>
              
              <button className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-200">
                <span>Explore Series</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SeriesSection;