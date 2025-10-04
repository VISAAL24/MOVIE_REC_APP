import React from 'react';
import { Eye, Heart, ThumbsDown, Edit, Trash2, Play } from 'lucide-react';

const MovieCard = ({ movie, isAdmin = false, onEdit, onDelete, onClick, onLike }) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(movie._id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(movie);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(movie._id);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (onLike) {
      onLike(movie._id);
    }
  };

  return (
    <div
      className="bg-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-105"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="poster-sm group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="bg-secondary flex items-center justify-center poster-sm">
            <Play size={32} className="text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center card-overlay">
          <Play size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 overlay-icon" />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-primary text-lg mb-3 line-clamp-2 group-hover:text-blue-500 transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex flex-wrap gap-1 mb-3">
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

        <div className="flex items-center justify-between text-sm text-secondary mb-4">
          <span className="font-medium">{movie.language}</span>
          <span className="font-medium">{movie.releaseYear}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 text-sm text-secondary">
            <div className="flex items-center gap-1">
              <Eye size={16} className="text-blue-500" />
              <span className="font-medium">{movie.viewCount || movie.views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleLikeClick} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150" title="Like" aria-label="Like">
                <Heart size={16} className={`text-red-500 ${movie.isLiked ? 'font-bold scale-110' : ''}`} />
              </button>
              <span className={`font-medium ${movie.isLiked ? 'text-red-600 font-bold' : ''}`}>{movie.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown size={16} className="text-gray-500" />
              <span className="font-medium">{movie.dislikes}</span>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-all duration-200"
                title="Edit movie"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all duration-200"
                title="Delete movie"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
