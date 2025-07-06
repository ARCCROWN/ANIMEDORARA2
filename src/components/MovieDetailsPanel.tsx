import React, { useEffect, useRef } from 'react';
import { X, Play, Star, Calendar, Clock, Globe, Users, Download } from 'lucide-react';
import { Movie } from '../types';

interface MovieDetailsPanelProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  onWatchNow: () => void;
}

const MovieDetailsPanel: React.FC<MovieDetailsPanelProps> = ({
  movie,
  isOpen,
  onClose,
  onWatchNow
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Generate mock synopsis based on movie title and genre
  const generateSynopsis = (movie: Movie) => {
    const title = movie.title.toLowerCase();
    
    if (title.includes('treasure island')) {
      return "Join Nobita and Doraemon on an epic adventure to a mysterious treasure island where pirates, ancient secrets, and incredible discoveries await. When a treasure map appears, the gang sets sail on a journey that will test their courage and friendship.";
    } else if (title.includes('moon exploration')) {
      return "Nobita's fascination with the moon leads to an extraordinary adventure when Doraemon's gadgets reveal a hidden civilization on the lunar surface. Together, they must help protect this secret world from those who would exploit it.";
    } else if (title.includes('antarctic')) {
      return "A thrilling expedition to Antarctica becomes a race against time when Nobita and friends discover an ancient civilization frozen in ice. With Doraemon's help, they must solve the mystery before it's too late.";
    } else if (title.includes('kung fu') || title.includes('ramen')) {
      return "Shin-chan's love for ramen leads to an unexpected martial arts adventure when he discovers a secret kung fu academy. With his unique style and determination, he must master ancient techniques to save the day.";
    } else if (title.includes('sky utopia')) {
      return "When Nobita dreams of a perfect world in the sky, Doraemon's gadgets make it a reality. But their sky utopia faces unexpected challenges that test the true meaning of paradise and friendship.";
    }
    
    return `Experience an incredible ${movie.genre.toLowerCase()} adventure with beloved characters in this heartwarming tale that combines humor, friendship, and excitement in a story that will captivate audiences of all ages.`;
  };

  // Generate mock cast based on series
  const generateCast = (movie: Movie) => {
    if (movie.id.startsWith('1')) { // Doraemon
      return [
        { name: "Wasabi Mizuta", role: "Doraemon (Voice)" },
        { name: "Megumi Oohara", role: "Nobita (Voice)" },
        { name: "Yumi Kakazu", role: "Shizuka (Voice)" },
        { name: "Subaru Kimura", role: "Gian (Voice)" },
        { name: "Tomokazu Seki", role: "Suneo (Voice)" }
      ];
    } else if (movie.id.startsWith('2')) { // Shin-chan
      return [
        { name: "Yumiko Kobayashi", role: "Shin-chan (Voice)" },
        { name: "Miki Narahashi", role: "Misae (Voice)" },
        { name: "Toshiyuki Morikawa", role: "Hiroshi (Voice)" },
        { name: "Satomi Koorogi", role: "Himawari (Voice)" },
        { name: "Keiji Fujiwara", role: "Action Kamen (Voice)" }
      ];
    } else { // Pokemon
      return [
        { name: "Rica Matsumoto", role: "Ash Ketchum (Voice)" },
        { name: "Ikue Otani", role: "Pikachu (Voice)" },
        { name: "Mayumi Iizuka", role: "Kasumi (Voice)" },
        { name: "Yuji Ueda", role: "Takeshi (Voice)" },
        { name: "Megumi Hayashibara", role: "Musashi (Voice)" }
      ];
    }
  };

  if (!isOpen) return null;

  const synopsis = generateSynopsis(movie);
  const cast = generateCast(movie);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-start justify-center pt-4 pb-4 overflow-y-auto">
      <div
        ref={panelRef}
        className={`bg-gray-900 w-full max-w-4xl rounded-2xl transform transition-all duration-300 ease-out mx-4 ${
          isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-white text-2xl font-bold">{movie.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-gray-800 rounded-full"
            aria-label="Close details"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <div className="p-6 space-y-6">
            {/* Movie Info Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Poster */}
              <div className="md:col-span-1">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full max-w-xs mx-auto rounded-lg shadow-lg"
                />
                
                {/* Action Buttons */}
                <div className="mt-4 space-y-3">
                  <button
                    onClick={onWatchNow}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    <Play className="w-5 h-5" />
                    <span>Watch Now</span>
                  </button>
                  
                  {movie.downloadSources.length > 0 && (
                    <button className="w-full flex items-center justify-center space-x-2 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                      <Download className="w-5 h-5" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="md:col-span-2 space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-white text-xl font-semibold mb-4">Movie Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-800 p-2 rounded">
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Rating</p>
                        <p className="text-white">{movie.rating}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-800 p-2 rounded">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Genre</p>
                        <p className="text-white">{movie.genre}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-800 p-2 rounded">
                        <Globe className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Servers</p>
                        <p className="text-white">{movie.watchSources.length} Available</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-800 p-2 rounded">
                        <Calendar className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Status</p>
                        <p className="text-white">{movie.isNew ? 'New Release' : 'Available'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Synopsis */}
                <div>
                  <h3 className="text-white text-xl font-semibold mb-3">Synopsis</h3>
                  <p className="text-gray-300 leading-relaxed">{synopsis}</p>
                </div>

                {/* Cast */}
                <div>
                  <h3 className="text-white text-xl font-semibold mb-3">Voice Cast</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cast.map((member, index) => (
                      <div key={index} className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-gray-400 text-sm">{member.role}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Watch Sources */}
                <div>
                  <h3 className="text-white text-xl font-semibold mb-3">Available On</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.watchSources.map((source, index) => (
                      <span
                        key={index}
                        className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm capitalize"
                      >
                        {source.type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPanel;