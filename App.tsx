import React, { useState, useEffect } from 'react';
import { Movie } from './types';
import { getMovieRecommendations } from './services/geminiService';
import MovieCard from './components/MovieCard';
import WatchListSidebar from './components/WatchListSidebar';
import MovieDetailsModal from './components/MovieDetailsModal';
import { MagnifyingGlassIcon, BookmarkSquareIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [mood, setMood] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchList, setWatchList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for Modal
  const [selectedMovie, setSelectedMovie] = useState<{data: Movie, posterUrl: string | null} | null>(null);

  // Load watchlist from local storage
  useEffect(() => {
    const saved = localStorage.getItem('moodcine-watchlist');
    if (saved) {
      try {
        setWatchList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse watchlist", e);
      }
    }
  }, []);

  // Save watchlist to local storage
  useEffect(() => {
    localStorage.setItem('moodcine-watchlist', JSON.stringify(watchList));
  }, [watchList]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mood.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setMovies([]); // Clear previous results

    try {
      const results = await getMovieRecommendations(mood);
      setMovies(results);
    } catch (err) {
      setError("Something went wrong with the AI director. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setHasSearched(false);
    setMood('');
    setMovies([]);
    setError(null);
  };

  const toggleSave = (movie: Movie) => {
    setWatchList(prev => {
      const exists = prev.find(m => m.id === movie.id);
      if (exists) {
        return prev.filter(m => m.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const handleMovieClick = (movie: Movie, posterUrl: string | null) => {
    setSelectedMovie({ data: movie, posterUrl });
  };

  const isMovieSaved = (id: string) => watchList.some(m => m.id === id);

  return (
    <div className="min-h-screen bg-netflix-black text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-red-600 selection:text-white">
      
      {/* Header / Nav */}
      <nav className="flex justify-between items-center p-6 lg:px-12 fixed w-full top-0 z-30 bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
        <div className="pointer-events-auto cursor-pointer group" onClick={resetSearch}>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-red-600 tracking-wide uppercase drop-shadow-lg group-hover:scale-105 transition-transform">
                Mood<span className="text-white">Cine</span>
            </h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="pointer-events-auto relative group flex items-center gap-2 text-sm font-semibold uppercase tracking-widest hover:text-red-500 transition-colors"
        >
          <span className="hidden sm:inline">My List</span>
          <div className="relative">
            <BookmarkSquareIcon className="w-8 h-8" />
            {watchList.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
                {watchList.length}
              </span>
            )}
          </div>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col items-center justify-center p-6 transition-all duration-700 ease-in-out ${hasSearched ? 'pt-32 justify-start' : 'justify-center min-h-screen'}`}>
        
        {/* Hero Section */}
        <div className={`w-full max-w-4xl text-center z-10 transition-all duration-700 ${hasSearched ? 'scale-90 mb-8' : 'scale-100'}`}>
           {!hasSearched && (
             <div className="mb-8 space-y-4 animate-fade-in">
                <h2 className="text-5xl md:text-7xl font-display font-bold leading-none tracking-wide">
                  What's your <span className="text-red-600">vibe</span>?
                </h2>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light">
                  Tell us how you're feeling, and our AI director will curate the perfect cinematic experience.
                </p>
             </div>
           )}

           <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto group">
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="e.g. I need a good cry, 80s nostalgia, high octane action..."
                className="w-full bg-black/60 border border-gray-700 text-white text-lg md:text-xl p-6 pl-14 rounded-full focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all shadow-2xl backdrop-blur-md placeholder:text-gray-500 font-light"
                disabled={loading}
              />
              <MagnifyingGlassIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-red-600 transition-colors" />
              
              <button 
                type="submit"
                disabled={!mood.trim() || loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-red-900/50"
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <span>Inspire Me</span>
                        <SparklesIcon className="w-4 h-4" />
                    </>
                )}
              </button>
           </form>

           {/* Quick tags for inspiration (only show on landing) */}
           {!hasSearched && (
             <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
               {['Heartbroken', 'Adventurous', 'Need a laugh', 'Cozy Sunday', 'Dark & Gritty', 'Mind-bending'].map((tag) => (
                 <button
                    key={tag}
                    onClick={() => setMood(tag)}
                    className="px-4 py-2 bg-gray-800/40 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-full text-sm text-gray-300 transition-all backdrop-blur-sm"
                 >
                   {tag}
                 </button>
               ))}
             </div>
           )}
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="w-full max-w-6xl mx-auto z-10 animate-fade-in">
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-netflix-dark rounded-md aspect-[2/3] w-full animate-pulse flex flex-col items-center justify-center border border-gray-800">
                          <div className="text-gray-700 font-display text-4xl">Loading...</div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center text-red-500 text-xl mt-12 bg-black/60 p-8 rounded-xl border border-red-900/50 backdrop-blur-md max-w-2xl mx-auto">
                    <p className="font-bold mb-2">Cut! We have a problem.</p>
                    {error}
                    <button onClick={() => handleSearch()} className="block mx-auto mt-4 text-white underline hover:text-gray-300">Try Again</button>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-[1px] bg-gradient-to-r from-transparent to-gray-700 flex-1"></div>
                        <h3 className="text-gray-400 uppercase tracking-widest text-sm font-bold">Top Picks For You</h3>
                        <div className="h-[1px] bg-gradient-to-l from-transparent to-gray-700 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                        {movies.map((movie, index) => (
                            <MovieCard
                                key={movie.id}
                                index={index}
                                movie={movie}
                                isSaved={isMovieSaved(movie.id)}
                                onToggleSave={toggleSave}
                                onClick={handleMovieClick}
                            />
                        ))}
                    </div>
                    <div className="text-center">
                         <button 
                            onClick={resetSearch}
                            className="text-gray-500 hover:text-white transition-colors underline underline-offset-4 text-sm uppercase tracking-wider"
                         >
                            Search Again
                         </button>
                    </div>
                </>
            )}
          </div>
        )}
      </main>

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-netflix-black to-black pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-2/3 bg-gradient-to-b from-red-900/20 to-transparent pointer-events-none opacity-40 mix-blend-screen" />

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-gray-600 text-xs tracking-wider uppercase">
        <p>&copy; {new Date().getFullYear()} MoodCine. Powered by Gemini 2.5.</p>
      </footer>

      <WatchListSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        watchList={watchList}
        onRemove={(id) => setWatchList(prev => prev.filter(m => m.id !== id))}
      />

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieDetailsModal 
          movie={selectedMovie.data} 
          posterUrl={selectedMovie.posterUrl}
          onClose={() => setSelectedMovie(null)} 
        />
      )}
    </div>
  );
};

export default App;