import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import MovieList from '../components/MovieList';
import RecentlyVisited from '../components/RecentlyVisited';
import { Search, Filter, Grid, List, TrendingUp, Clock, Heart, ThumbsDown } from 'lucide-react';

const UserDashboard = () => {
  const { user, likedMovies, setLikedMovies } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [recentlyVisited, setRecentlyVisited] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // This will still be used for the input field value
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    artists: [],
    languages: []
  });
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMovies();
    fetchTrendingMovies();
    fetchUserData();
    fetchFilterOptions();
    fetchUserDetails();
  }, [user, navigate]);

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

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${user._id}`);
      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

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
        // mark isLiked based on AuthContext likedMovies
        const marked = response.data.movies.map(m => ({
          ...m,
          isLiked: Array.isArray(likedMovies) && likedMovies.includes(String(m._id))
        }));
        setMovies(marked);
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

  const fetchUserData = async () => {
    try {
      const [recentResponse, likedResponse, recommendationsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/${user.id}/recently-visited`),
        axios.get(`http://localhost:5000/api/users/${user.id}/liked-movies`),
        axios.get(`http://localhost:5000/api/users/${user.id}/recommendations`)
      ]);

      if (recentResponse.data.success) {
        setRecentlyVisited(recentResponse.data.recentlyVisited);
      }
      if (likedResponse.data.success) {
        // normalize to an array of id strings in AuthContext
        const ids = likedResponse.data.likedMovies.map(m => String(m._id));
        setLikedMovies(ids);
      }
      if (recommendationsResponse.data.success) {
        setRecommendations(recommendationsResponse.data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
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

  const handleMovieClick = async (movieId) => {
    try {
      // Record the view and add to recently visited
      const userId = user._id || user.id;
      await axios.post(`http://localhost:5000/api/movies/${movieId}/view`, {
        userId
      });
      
      // Add to recently visited
      await axios.post(`http://localhost:5000/api/users/${user.id}/recent`, {
        movieId: movieId
      });
      
      // Refresh recently visited data
      const recentResponse = await axios.get(`http://localhost:5000/api/users/${user.id}/recently-visited`);
      if (recentResponse.data.success) {
        setRecentlyVisited(recentResponse.data.recentlyVisited);
      }
      
      navigate(`/movie/${movieId}`);
    } catch (error) {
      console.error('Error recording view:', error);
      // Don't block navigation — make the message informational for debugging
      showError("Couldn't record view (server/network). Opening movie page.");
      navigate(`/movie/${movieId}`);
    }
  };

  const getCurrentMovies = () => {
    switch (activeTab) {
      case 'trending':
        return trendingMovies;
      case 'recent':
        return recentlyVisited.map(item => item.movieId).filter(Boolean);
      case 'liked':
        // Return movie objects that are currently loaded and liked by the user
        return movies.filter(m => Array.isArray(likedMovies) && likedMovies.includes(String(m._id)));
      case 'recommendations':
        return recommendations;
      default:
        return movies;
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
          <h1 className="text-2xl font-bold text-primary">Welcome, {user.username}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          
          <div className="bg-card p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary font-medium">Movies Watched</p>
              <p className="text-2xl font-bold text-primary">{recentlyVisited.length}</p>
            </div>
            <Clock className="text-blue-500" size={32} />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline hover:bg-gray-700 hover:text-white'}`}
            >
              All Movies
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`btn ${activeTab === 'trending' ? 'btn-primary' : 'btn-outline hover:bg-gray-700 hover:text-white'} flex items-center gap-2`}
            >
              <TrendingUp size={16} />
              Trending
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`btn ${activeTab === 'recent' ? 'btn-primary' : 'btn-outline hover:bg-gray-700 hover:text-white'} flex items-center gap-2`}
            >
              <Clock size={16} />
              Recently Visited ({recentlyVisited.length})
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`btn ${activeTab === 'liked' ? 'btn-primary' : 'btn-outline hover:bg-gray-700 hover:text-white'} flex items-center gap-2`}
            >
              <Heart size={16} />
              Liked Movies
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`btn ${activeTab === 'recommendations' ? 'btn-primary' : 'btn-outline hover:bg-gray-700 hover:text-white'}`}
            >
              Recommendations
            </button>
          </div>

          {/* Filters and Search - Only show for 'all' tab */}
          {activeTab === 'all' && (
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 mb-6">
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
          )}

          {/* Sort and View Mode */}
          {activeTab === 'all' && (
            <div className="flex items-center justify-between mb-6">
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
          )}
        </div>

        {/* Movies Display */}
        {activeTab === 'recent' ? (
          <RecentlyVisited 
            movies={recentlyVisited}
            onMovieClick={handleMovieClick}
            loading={loading}
          />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getCurrentMovies().map(movie => (
                  <MovieCard
                    key={movie._id}
                    movie={movie}
                    isAdmin={false}
                    onClick={() => handleMovieClick(movie._id)}
                    onLike={async (movieId) => {
                      try {
                        const userId = user._id || user.id;
                        // Determine whether currently liked locally
                        const currently = movies.find(m => m._id === movieId);
                        const action = currently && currently.isLiked ? 'remove' : 'like';
                        const res = await axios.post(`http://localhost:5000/api/movies/${movieId}/reaction`, { userId, action });
                        if (res.data.success) {
                          // update only the likes/dislikes and isLiked on the movie in local state
                          setMovies(prev => prev.map(m => m._id === movieId ? { ...m, likes: res.data.movie.likes, dislikes: res.data.movie.dislikes, isLiked: action === 'like' } : m));
                          // update likedMovies in AuthContext
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
                      } catch (err) {
                        console.error('Like failed', err);
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <MovieList
                movies={getCurrentMovies()}
                isAdmin={false}
                onClick={handleMovieClick}
              />
            )}

            {getCurrentMovies().length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-secondary text-lg">No movies found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
