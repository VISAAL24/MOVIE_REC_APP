import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import MovieList from '../components/MovieList';
import RecentlyVisited from '../components/RecentlyVisited';
import { Search, Filter, Grid, List, TrendingUp, Clock, Heart, ThumbsDown } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [recentlyVisited, setRecentlyVisited] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    artists: [],
    languages: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMovies();
    fetchTrendingMovies();
    fetchUserData();
    fetchFilterOptions();
  }, [user, navigate]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        category: selectedCategory,
        artist: selectedArtist,
        language: selectedLanguage,
        sortBy,
        sortOrder
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
        setLikedMovies(likedResponse.data.likedMovies);
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
  }, [searchTerm, selectedCategory, selectedArtist, selectedLanguage, sortBy, sortOrder]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'artist':
        setSelectedArtist(value);
        break;
      case 'language':
        setSelectedLanguage(value);
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedArtist('');
    setSelectedLanguage('');
  };

  const handleMovieClick = async (movieId) => {
    try {
      // Record the view and add to recently visited
      await axios.post(`http://localhost:5000/api/movies/${movieId}/view`, {
        userId: user.id
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
      showError('Failed to record view, but you can still access the movie.');
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
        return likedMovies;
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
          <h1 className="text-2xl font-bold text-primary">Welcome, {user.username}!</h1>
        </div>


        {/* Tabs */}
        <div className="bg-card p-6 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              All Movies
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`btn ${activeTab === 'trending' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
            >
              <TrendingUp size={16} />
              Trending
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`btn ${activeTab === 'recent' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
            >
              <Clock size={16} />
              Recently Visited ({recentlyVisited.length})
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`btn ${activeTab === 'liked' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
            >
              <Heart size={16} />
              Liked Movies
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`btn ${activeTab === 'recommendations' ? 'btn-primary' : 'btn-outline'}`}
            >
              Recommendations
            </button>
          </div>

          {/* Filters and Search - Only show for 'all' tab */}
          {activeTab === 'all' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={20} />
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="form-input pl-10"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="form-input"
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={selectedArtist}
                  onChange={(e) => handleFilterChange('artist', e.target.value)}
                  className="form-input"
                >
                  <option value="">All Artists</option>
                  {filterOptions.artists.map(artist => (
                    <option key={artist} value={artist}>{artist}</option>
                  ))}
                </select>

                <select
                  value={selectedLanguage}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="form-input"
                >
                  <option value="">All Languages</option>
                  {filterOptions.languages.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('-');
                      setSortBy(sort);
                      setSortOrder(order);
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
            </>
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
