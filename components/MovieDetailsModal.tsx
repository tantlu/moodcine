import React, { useEffect, useState } from 'react';
import { Movie, MovieDetails } from '../types';
import { getMovieDetails } from '../services/geminiService';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/solid';

interface MovieDetailsModalProps {
  movie: Movie;
  posterUrl: string | null;
  onClose: () => void;
}

const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({ movie, posterUrl, onClose }) => {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const data = await getMovieDetails(movie.title, movie.year);
      setDetails(data);
      setLoading(false);
    };

    fetchDetails();
  }, [movie]);

  const renderStars = (ratingStr: string) => {
    const num = parseFloat(ratingStr);
    if (isNaN(num)) return null;
    
    // Normalize to 5 stars (IMDB is usually out of 10)
    const ratingOutOf5 = num > 5 ? num / 2 : num;
    
    return (
        <div className="flex items-center gap-1 pb-1" title={`Rating: ${ratingStr}`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon 
                    key={i} 
                    className={`w-6 h-6 ${i <= Math.round(ratingOutOf5) ? 'text-yellow-400' : 'text-gray-700'}`}
                />
            ))}
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-netflix-dark rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-slide-up border border-gray-800">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-sm transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Poster Side */}
        <div className="w-full md:w-2/5 relative h-64 md:h-auto">
          {posterUrl && (
            <img 
              src={posterUrl} 
              alt={movie.title} 
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-transparent to-transparent md:bg-gradient-to-r" />
        </div>

        {/* Info Side */}
        <div className="w-full md:w-3/5 p-8 flex flex-col justify-center relative">
          
          <div className="flex flex-wrap items-end gap-4 mb-2">
            <h2 className="text-4xl md:text-5xl font-display text-white leading-none">
              {movie.title}
            </h2>
            {details && details.rating !== 'N/A' && renderStars(details.rating)}
          </div>
          
          <div className="flex items-center gap-4 mb-6 text-sm">
            <span className="border border-gray-600 px-2 py-0.5 rounded text-gray-300 font-bold">
              {movie.year}
            </span>
            <span className="text-red-500 font-bold uppercase tracking-wider">
              {movie.genre}
            </span>
          </div>

          {loading ? (
             <div className="space-y-4 animate-pulse">
               <div className="h-4 bg-gray-700 rounded w-3/4"></div>
               <div className="h-4 bg-gray-700 rounded w-full"></div>
               <div className="h-4 bg-gray-700 rounded w-5/6"></div>
               <div className="h-20 bg-gray-700 rounded w-full mt-6"></div>
             </div>
          ) : (
            details && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Director</h3>
                  <p className="text-white text-lg">{details.director}</p>
                </div>

                <div>
                   <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Synopsis</h3>
                   <p className="text-gray-300 font-light leading-relaxed line-clamp-3" title={details.synopsis}>
                     {details.synopsis}
                   </p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Cast</h3>
                  <div className="flex flex-wrap gap-2">
                    {details.cast.map((actor, idx) => (
                      <span key={idx} className="bg-gray-800 text-gray-200 px-3 py-1 rounded-full text-xs hover:bg-red-900/40 transition-colors cursor-default">
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500 italic">
                        "{movie.reason}"
                    </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal;