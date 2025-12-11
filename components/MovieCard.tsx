import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { PlusIcon, CheckIcon } from '@heroicons/react/24/solid';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface MovieCardProps {
  movie: Movie;
  isSaved: boolean;
  onToggleSave: (movie: Movie) => void;
  onClick: (movie: Movie, posterUrl: string | null) => void;
  index: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, isSaved, onToggleSave, onClick, index }) => {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fetch poster from iTunes Search API with Retry Logic
  useEffect(() => {
    let isMounted = true;
    setHasError(false);
    setPosterUrl(null);
    setImageLoaded(false);
    
    const fetchPoster = async () => {
      try {
        // Strategy 1: Search with Title + Year (More precise)
        const queryWithYear = encodeURIComponent(`${movie.title} ${movie.year}`);
        let response = await fetch(`https://itunes.apple.com/search?term=${queryWithYear}&media=movie&entity=movie&limit=1`);
        let data = await response.json();

        // Strategy 2: Search with just Title (Broader, if specific year fails)
        if (!data.results || data.results.length === 0) {
            const queryTitle = encodeURIComponent(movie.title);
            response = await fetch(`https://itunes.apple.com/search?term=${queryTitle}&media=movie&entity=movie&limit=1`);
            data = await response.json();
        }

        if (isMounted && data.results && data.results.length > 0) {
          const result = data.results[0];
          // Get high-res image by replacing dimensions in URL
          // Matches 100x100, 100x100bb, etc., and replaces with 600x900bb for high quality portrait
          const highResUrl = result.artworkUrl100.replace(/100x100[^.]*/, "600x900bb");
          setPosterUrl(highResUrl);
        } else {
          if (isMounted) setHasError(true);
        }
      } catch (error) {
        console.error("Error fetching poster:", error);
        if (isMounted) setHasError(true);
      }
    };

    fetchPoster();

    return () => {
      isMounted = false;
    };
  }, [movie.title, movie.year]);

  return (
    <div 
      className="group relative bg-netflix-dark rounded-md overflow-hidden shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:z-20 w-full animate-slide-up cursor-pointer ring-1 ring-white/10 hover:ring-red-600/50"
      style={{ animationDelay: `${index * 150}ms` }}
      onClick={() => onClick(movie, hasError ? null : posterUrl)}
    >
      {/* Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
        
        {/* Loading State */}
        {!imageLoaded && !hasError && (
          <div className="absolute inset-0 bg-gray-900 animate-pulse flex items-center justify-center z-10">
            <span className="text-gray-700 font-display text-xl tracking-widest opacity-50">LOADING</span>
          </div>
        )}
        
        {/* Actual Poster Image */}
        {posterUrl && !hasError ? (
          <img
            src={posterUrl}
            alt={`Poster for ${movie.title}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 
              ${imageLoaded ? 'opacity-100' : 'opacity-0'} 
            `}
          />
        ) : (
          /* Cinematic Fallback (No generic placeholders) */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-black p-6 text-center">
             <PhotoIcon className="w-12 h-12 text-gray-700 mb-4 opacity-50" />
             <span className="text-gray-600 font-display text-2xl uppercase tracking-widest leading-none opacity-50">
               {movie.title}
             </span>
          </div>
        )}
        
        {/* Dark Cinematic Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/60 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-6 group-hover:translate-y-0 transition-transform duration-300 z-20">
          <div className="flex flex-col mb-2 drop-shadow-md">
            <h3 className="text-3xl font-display text-white leading-none mb-2 line-clamp-2">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-200 text-xs font-bold border border-gray-500/50 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                {movie.year}
              </span>
              <span className="text-red-500 text-xs font-bold uppercase tracking-wider truncate max-w-[150px]">
                {movie.genre}
              </span>
            </div>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
            <p className="text-sm text-gray-300 line-clamp-3 mb-4 font-light leading-relaxed drop-shadow-sm">
              {movie.reason}
            </p>

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(movie);
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded text-sm font-bold tracking-wide uppercase transition-all shadow-lg hover:shadow-xl ${
                isSaved 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckIcon className="w-5 h-5" /> Saved
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" /> Watch Later
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