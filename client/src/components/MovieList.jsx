import React from 'react';
import { Eye, Heart, ThumbsDown, Edit, Trash2, Play } from 'lucide-react';

const MovieList = ({ movies, isAdmin = false, onEdit, onDelete, onClick }) => {
  const handleRowClick = (movieId) => {
    if (onClick) {
      onClick(movieId);
    }
  };

  const handleEdit = (e, movie) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(movie);
    }
  };

  const handleDelete = (e, movieId) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(movieId);
    }
  };

  return (
    <div className="bg-card movie-list rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-4 text-left text-primary font-semibold text-sm">Movie</th>
              <th className="px-6 py-4 text-left text-primary font-semibold text-sm">Categories</th>
              <th className="px-6 py-4 text-left text-primary font-semibold text-sm">Language</th>
              <th className="px-6 py-4 text-left text-primary font-semibold text-sm">Year</th>
              <th className="px-6 py-4 text-left text-primary font-semibold text-sm">Stats</th>
              {isAdmin && (
                <th className="px-6 py-4 text-left text-primary font-semibold text-sm">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {movies.map(movie => (
              <tr
                key={movie._id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 group"
                onClick={() => handleRowClick(movie._id)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="object-cover rounded-lg shadow-sm"
                        style={{
                          width: '60px',
                          height: '90px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div 
                        className="bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg shadow-sm"
                        style={{
                          width: '60px',
                          height: '90px'
                        }}
                      >
                        <Play size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-primary text-base mb-1 line-clamp-1 group-hover:text-blue-500 transition-colors">
                        {movie.title}
                      </h3>
                      <p className="text-sm text-secondary line-clamp-1">{movie.musicDirector}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {movie.categories.slice(0, 2).map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                      >
                        {category}
                      </span>
                    ))}
                    {movie.categories.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                        +{movie.categories.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-secondary font-medium">{movie.language}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-secondary font-medium">{movie.releaseYear}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye size={16} className="text-blue-500" />
                      <span className="font-medium text-secondary">{movie.viewCount || movie.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={16} className="text-red-500" />
                      <span className="font-medium text-secondary">{movie.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown size={16} className="text-gray-500" />
                      <span className="font-medium text-secondary">{movie.dislikes}</span>
                    </div>
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleEdit(e, movie)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-all duration-200"
                        title="Edit movie"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, movie._id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all duration-200"
                        title="Delete movie"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovieList;
