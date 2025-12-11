import React, { useMemo } from 'react';
import { Movie } from '../types';
import { PlusIcon, CheckIcon } from '@heroicons/react/24/solid';

interface MovieCardProps {
  movie: Movie;
  isSaved: boolean;
  onToggleSave: (movie: Movie) => void;
  index: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, isSaved, onToggleSave, index }) => {
  // Deterministic random image based on string hash to ensure same movie gets same image
  const imageUrl = useMemo(() => {
    let hash = 0;
    const str = movie.title;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const width = 400;
    const height = 600;
    const seed = Math.abs(hash);
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  }, [movie.title]);

  return (
    <div 
      className="group relative bg-netflix-dark rounded-md overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:z-20 w-full animate-slide-up"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-40 opacity-80"
          loading="lazy"
        />
        
        {/* Overlay Content (Visible on Hover/Always visible partially) */}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent opacity-90" />
        
        {/* Text Content Positioned at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md">
              {movie.title}
            </h3>
            <span className="text-gray-400 text-sm font-semibold bg-black/50 px-2 py-0.5 rounded border border-gray-700">
              {movie.year}
            </span>
          </div>
          
          <p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-2">
            {movie.genre}
          </p>

          <p className="text-sm text-gray-300 line-clamp-3 mb-4 group-hover:text-white transition-colors">
            {movie.reason}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
             <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(movie);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded text-sm font-semibold transition-colors ${
                isSaved 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckIcon className="w-4 h-4" /> Saved
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" /> Watch Later
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;