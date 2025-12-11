import React, { useState, useEffect } from 'react';
import { Movie } from './types';
import { getMovieRecommendations } from './services/geminiService';
import MovieCard from './components/MovieCard';
import WatchListSidebar from './components/WatchListSidebar';
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
    
    // Clear previous results to show loading state effectively
    setMovies([]);

    try {
      const results = await getMovieRecommendations(mood);
      setMovies(results);
    } catch (err) {
      setError("Something went wrong with the AI director. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const isMovieSaved = (id: string) => watchList.some(m => m.id === id);

  return (
    <div className="min-h-screen bg-netflix-black text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-red-600 selection:text-white">
      
      {/* Header / Nav */}
      <nav className="flex justify-between items-center p-6 lg:px-12 fixed w-full top-0 z-30 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="pointer-events-auto cursor-pointer" onClick={() => { setHasSearched(false); setMood(''); setMovies([]); }}>
            <h1 className="text-3xl md:text-4xl font-bold text-red-600 tracking-tighter uppercase drop-shadow-lg">
                MOOD<span className="text-white">CINE</span>
            </h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="pointer-events-auto relative group flex items-center gap-2 text-sm font-semibold hover:text-red-500 transition-colors"
        >
          <span className="hidden sm:inline">My List</span>
          <div className="relative">
            <BookmarkSquareIcon className="w-8 h-8" />
            {watchList.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
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
                <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                  What's your <span className="text-red-600">vibe</span> tonight?
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Tell us how you're feeling, and our AI will curate the perfect cinematic experience for you.
                </p>
             </div>
           )}

           <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto group">
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="e.g. I want to cry, I need motivation, 80s nostalgia..."
                className="w-full bg-black/50 border border-gray-600 text-white text-lg md:text-xl p-6 pl-14 rounded-full focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all shadow-2xl backdrop-blur-sm placeholder:text-gray-600"
                disabled={loading}
              />
              <MagnifyingGlassIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-red-600 transition-colors" />
              
              <button 
                type="submit"
                disabled={!mood.trim() || loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
               {['Heartbroken', 'Adventurous', 'Need a laugh', 'Cozy Sunday', 'Dark & Gritty'].map((tag) => (
                 <button
                    key={tag}
                    onClick={() => {
                        setMood(tag);
                        // Optional: automatically trigger search or just fill input
                        // Let's just fill input for better UX control
                    }}
                    className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700 border border-gray-700 rounded-full text-sm text-gray-300 transition-colors"
                 >
                   {tag}
                 </button>
               ))}
             </div>
           )}
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="w-full max-w-6xl mx-auto z-10">
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-netflix-gray rounded-md aspect-[2/3] w-full" />
                    ))}
                </div>
            ) : error ? (
                <div className="text-center text-red-500 text-xl mt-12 bg-black/50 p-6 rounded-lg border border-red-900/50">
                    {error}
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-[1px] bg-gray-800 flex-1"></div>
                        <h3 className="text-gray-400 uppercase tracking-widest text-sm font-semibold">Top Picks For You</h3>
                        <div className="h-[1px] bg-gray-800 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                        {movies.map((movie, index) => (
                            <MovieCard
                                key={movie.id}
                                index={index}
                                movie={movie}
                                isSaved={isMovieSaved(movie.id)}
                                onToggleSave={toggleSave}
                            />
                        ))}
                    </div>
                </>
            )}
          </div>
        )}
      </main>

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-netflix-black to-black pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-1/2 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none opacity-50" />

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} MoodCine. Powered by Gemini 2.5.</p>
      </footer>

      <WatchListSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        watchList={watchList}
        onRemove={(id) => setWatchList(prev => prev.filter(m => m.id !== id))}
      />
    </div>
  );
};

export default App;