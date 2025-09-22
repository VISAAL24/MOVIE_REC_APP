import React from 'react';
import { Clock, Play } from 'lucide-react';

const RecentlyVisited = ({ movies, onMovieClick, loading }) => {
  if (loading) {
    return (
      <div className="bg-card p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={24} className="text-blue-500" />
          <h2 className="text-xl font-semibold text-primary">Recently Visited</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="loading"></div>
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="bg-card p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={24} className="text-blue-500" />
          <h2 className="text-xl font-semibold text-primary">Recently Visited</h2>
        </div>
        <div className="text-center py-8">
          <Clock size={48} className="mx-auto text-secondary mb-4" />
          <p className="text-secondary">No recently visited movies yet</p>
          <p className="text-sm text-secondary mt-2">Click on movies to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={24} className="text-blue-500" />
        <h2 className="text-xl font-semibold text-primary">Recently Visited ({movies.length})</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 recently-visited">
        {movies.map((item, index) => {
          const movie = item.movieId;
          if (!movie) return null;
          
          return (
            <div
              key={movie._id}
              className="cursor-pointer group"
              onClick={() => onMovieClick(movie._id)}
            >
              <div className="relative overflow-hidden rounded-lg mb-2">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{
                      width: '120px',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                ) : (
                  <div 
                    className="bg-secondary flex items-center justify-center"
                    style={{
                      width: '120px',
                      height: '180px',
                      borderRadius: '8px'
                    }}
                  >
                    <Play size={32} className="text-secondary" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <Play size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="font-medium text-primary text-sm line-clamp-2 group-hover:text-blue-500 transition-colors">
                  {movie.title}
                </h3>
                <p className="text-xs text-secondary mt-1">
                  {new Date(item.visitedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyVisited;
