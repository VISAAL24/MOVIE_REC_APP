import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import MovieForm from '../components/MovieForm';
import MovieList from '../components/MovieList';
import Modal from '../components/Modal';
import { Plus, Search, Filter, Grid, List, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin, setLikedMovies } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // This will still be used for the input field value
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    artists: [],
    languages: []
  });

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/login');
      return;
    }
    fetchMovies();
    fetchTrendingMovies();
    fetchFilterOptions();
  }, [user, isAdmin, navigate]);

  // Initialize filter states from URLSearchParams
  const [searchParams, setSearchParams] = useSearchParams();

  const getFilterParam = (paramName, defaultValue) => searchParams.get(paramName) || defaultValue;

  const currentSearchTerm = getFilterParam('search', '');
  const currentCategory = getFilterParam('category', '');
  const currentArtist = getFilterParam('artist', '');
  const currentLanguage = getFilterParam('language', '');
  const currentSortBy = getFilterParam('sortBy', 'createdAt');
  const currentSortOrder = getFilterParam('sortOrder', 'desc');

  // Update local searchTerm state when URL search param changes externally
  useEffect(() => {
    setSearchTerm(currentSearchTerm);
  }, [currentSearchTerm]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: debouncedSearchTerm,
        category: currentCategory,
        artist: currentArtist,
        language: currentLanguage,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder
      });

      const response = await axios.get(`http://localhost:5000/api/movies?${params}`);
      if (response.data.success) {
        setMovies(response.data.movies);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingMovies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/movies/trending?limit=5');
      if (response.data.success) {
        setTrendingMovies(response.data.movies);
      }
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/movies/filters/options');
      if (response.data.success) {
        setFilterOptions(response.data.filters);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [debouncedSearchTerm, currentCategory, currentArtist, currentLanguage, currentSortBy, currentSortOrder]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('search', searchTerm);
    setSearchParams(newSearchParams);
    setDebouncedSearchTerm(searchTerm);
  };

  const handleFilterChange = (filterType, value) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(filterType, value);
    } else {
      newSearchParams.delete(filterType);
    }
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    const newSearchParams = new URLSearchParams();
    newSearchParams.delete('search');
    newSearchParams.delete('category');
    newSearchParams.delete('artist');
    newSearchParams.delete('language');
    setSearchParams(newSearchParams);
    setSearchTerm(''); // Clear local search term input
    setDebouncedSearchTerm(''); // Clear debounced search term
  };

  const handleMovieSubmit = async (movieData) => {
    console.log("Submitting movie data:", movieData);
    try {
      const dataToSend = { ...movieData, userId: user._id };
      if (editingMovie) {
        console.log("Updating movie with ID:", editingMovie._id, "Data:", dataToSend);
        const response = await axios.put(
          `http://localhost:5000/api/movies/${editingMovie._id}`,
          dataToSend
        );
        if (response.data.success) {
          setMovies(movies.map(movie => 
            movie._id === editingMovie._id ? response.data.movie : movie
          ));
          showSuccess('Movie updated successfully!');
        } else {
          showError(response.data.message || 'Failed to update movie.');
        }
      } else {
        console.log("Creating new movie. Data:", dataToSend);
        const response = await axios.post('http://localhost:5000/api/movies', dataToSend);
        if (response.data.success) {
          // setMovies([response.data.movie, ...movies]); // Removed direct manipulation
          fetchMovies(); // Re-fetch all movies to ensure consistency and display new movie
          showSuccess('Movie added successfully!');
        } else {
          showError(response.data.message || 'Failed to create movie.');
        }
      }
      setShowMovieForm(false);
      setEditingMovie(null);
    } catch (error) {
      console.error('Error saving movie:', error.response ? error.response.data : error.message);
      showError(error.response?.data?.message || 'Failed to save movie. Please try again.');
    }
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setShowMovieForm(true);
  };

  const handleDeleteMovie = async (movieId) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/movies/${movieId}`);
        if (response.data.success) {
          setMovies(movies.filter(movie => movie._id !== movieId));
          showSuccess('Movie deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting movie:', error);
        showError('Failed to delete movie. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <button
            onClick={() => setShowMovieForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Movie
          </button>
        </div>

        {/* Trending Movies */}
        <div className="bg-card p-6 rounded-lg shadow mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={24} className="text-blue-500" />
            <h2 className="text-xl font-semibold text-primary">Trending Movies</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {trendingMovies.map(movie => (
              <div key={movie._id} className="bg-secondary p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">{movie.title}</h3>
                <p className="text-sm text-secondary">Views: {movie.viewCount}</p>
                <p className="text-sm text-secondary">Likes: {movie.likes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card p-6 rounded-lg shadow mb-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 mb-4">
            <div className="relative flex-grow flex items-center gap-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={20} />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={handleSearch}
                className="form-input pl-10 pr-4 py-2 w-full"
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <select
                value={currentCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="form-input"
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={currentArtist}
                onChange={(e) => handleFilterChange('artist', e.target.value)}
                className="form-input"
              >
                <option value="">All Artists</option>
                {filterOptions.artists.map(artist => (
                  <option key={artist} value={artist}>{artist}</option>
                ))}
              </select>

              <select
                value={currentLanguage}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="form-input"
              >
                <option value="">All Languages</option>
                {filterOptions.languages.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>
          </form>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select
                value={`${currentSortBy}-${currentSortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  const newSearchParams = new URLSearchParams(searchParams);
                  newSearchParams.set('sortBy', sort);
                  newSearchParams.set('sortOrder', order);
                  setSearchParams(newSearchParams);
                }}
                className="form-input"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="viewCount-desc">Most Viewed</option>
                <option value="likes-desc">Most Liked</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>

              <button
                onClick={clearFilters}
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-secondary text-primary'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-secondary text-primary'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Movies Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map(movie => (
              <MovieCard
                key={movie._id}
                movie={movie}
                isAdmin={true}
                onEdit={handleEditMovie}
                onDelete={handleDeleteMovie}
                onLike={async (movieId) => {
                  try {
                    const userId = user._id || user.id;
                    const currently = movies.find(m => m._id === movieId);
                    const action = currently && currently.isLiked ? 'remove' : 'like';
                    const res = await axios.post(`http://localhost:5000/api/movies/${movieId}/reaction`, { userId, action });
                    if (res.data.success) {
                      setMovies(prev => prev.map(m => m._id === movieId ? { ...m, likes: res.data.movie.likes, dislikes: res.data.movie.dislikes, isLiked: action === 'like' } : m));
                      // update AuthContext likedMovies if available
                      if (typeof setLikedMovies === 'function') {
                        setLikedMovies(prev => {
                          const idStr = String(movieId);
                          if (action === 'like') {
                            if (Array.isArray(prev) && prev.includes(idStr)) return prev;
                            return [ ...(prev || []), idStr ];
                          } else {
                            return (prev || []).filter(x => x !== idStr);
                          }
                        });
                      }
                    }
                  } catch (err) {
                    console.error('Like failed', err);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <MovieList
            movies={movies}
            isAdmin={true}
            onEdit={handleEditMovie}
            onDelete={handleDeleteMovie}
          />
        )}

        {movies.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-secondary text-lg">No movies found</p>
          </div>
        )}
      </div>

      {/* Movie Form Modal */}
      <Modal
        isOpen={showMovieForm}
        onClose={() => {
          setShowMovieForm(false);
          setEditingMovie(null);
        }}
        title={editingMovie ? 'Edit Movie' : 'Add New Movie'}
        size="lg"
      >
        <MovieForm
          movie={editingMovie}
          onSubmit={handleMovieSubmit}
          onCancel={() => {
            setShowMovieForm(false);
            setEditingMovie(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default AdminDashboard;
