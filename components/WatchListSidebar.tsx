import React from 'react';
import { Movie } from '../types';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

interface WatchListSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  watchList: Movie[];
  onRemove: (id: string) => void;
}

const WatchListSidebar: React.FC<WatchListSidebarProps> = ({ isOpen, onClose, watchList, onRemove }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-netflix-dark z-50 transform transition-transform duration-300 shadow-2xl border-l border-gray-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-3xl text-white tracking-wide">My Watch List</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <XMarkIcon className="w-8 h-8" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {watchList.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <p className="text-xl font-display mb-2">Your list is empty</p>
                <p className="text-sm font-light">Find something based on your mood!</p>
              </div>
            ) : (
              watchList.map((movie) => (
                <div key={movie.id} className="flex gap-4 bg-netflix-gray p-3 rounded hover:bg-gray-800 transition-colors group">
                  <div className="w-16 h-24 bg-gray-800 flex-shrink-0 rounded overflow-hidden relative flex items-center justify-center border border-gray-700/50">
                    {/* Simplified placeholder to match dark theme instead of random picsum */}
                    <span className="text-gray-600 font-display text-2xl font-bold opacity-50">
                        {movie.title.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-white text-xl leading-none mb-1 line-clamp-2">{movie.title}</h4>
                    <p className="text-gray-400 text-xs font-bold uppercase">{movie.year} • {movie.genre}</p>
                  </div>
                  <button 
                    onClick={() => onRemove(movie.id)}
                    className="text-gray-500 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WatchListSidebar;