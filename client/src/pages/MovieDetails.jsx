import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';
import { ArrowLeft, Play, Download, Heart, ThumbsDown, MessageCircle, Eye, Star } from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  const { user, likedMovies, setLikedMovies } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userReaction, setUserReaction] = useState(null);


  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Increment view count when user visits the page
    const incrementView = async () => {
      try {
        const userId = user._id || user.id;
        const res = await axios.post(`http://localhost:5000/api/movies/${id}/view`, { userId });
        if (!res.data.success) {
          console.error('View endpoint returned non-success:', res.data);
        }
        fetchMovieDetails();
      } catch (error) {
        console.error('Error incrementing view:', error.response ? error.response.data : error.message);
        fetchMovieDetails();
      }
    };
    incrementView();
    fetchComments();
    // Set userReaction based on likedMovies
    if (likedMovies && likedMovies.includes(id)) {
      setUserReaction('like');
    } else {
      setUserReaction(null);
    }
  }, [id, user, likedMovies, navigate]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/movies/${id}`);
      if (response.data.success) {
        setMovie(response.data.movie);
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/movies/${id}/comments`);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleReaction = async (action) => {
    if (!user) return;
    try {
      let newAction = action;
      if (userReaction === action) {
        newAction = 'remove';
      }
      const response = await axios.post(`http://localhost:5000/api/movies/${id}/reaction`, {
        userId: user.id,
        action: newAction
      });
      if (response.data.success) {
        setMovie(prev => ({
          ...prev,
          likes: response.data.movie.likes,
          dislikes: response.data.movie.dislikes
        }));
        setUserReaction(response.data.userReaction);
        // Update likedMovies in context
        if (newAction === 'like') {
          setLikedMovies(prev => [...prev, id]);
        } else if (newAction === 'remove') {
          setLikedMovies(prev => prev.filter(mid => mid !== id));
        }
        showSuccess(`Movie ${newAction === 'remove' ? 'un' + (action === 'like' ? 'liked' : 'disliked') : newAction + 'd'} successfully!`);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    console.log("Attempting to post comment...");
    console.log("User object from AuthContext:", user);
    console.log("Comment Text:", commentText);
    if (!commentText.trim() || !user || !user._id || !user.username) {
      showError("Comment cannot be empty, or user information is missing. Please log in again.");
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await axios.post(`http://localhost:5000/api/movies/${id}/comments`, {
        userId: user._id, // Ensure we are sending the Mongoose _id
        username: user.username,
        content: commentText.trim()
      });

      if (response.data.success) {
        fetchComments(); // Re-fetch all comments to ensure consistency
        setCommentText('');
        showSuccess('Comment added successfully!');
      } else {
        showError(response.data.message || 'Failed to post comment.');
      }
    } catch (error) {
      console.error('Error submitting comment:', error.response ? error.response.data : error.message);
      showError(error.response?.data?.message || 'Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="loading"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Movie not found</h1>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="w-[90vw] max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="back-to-list mb-8"
        >
          <ArrowLeft size={18} />
          <span>Back to list</span>
        </button>

        <div className="flex flex-row gap-8 lg:gap-12">
          {/* Left Column: Poster */}
          <div className="poster-column">
            {movie.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="poster-lg"
              />
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-2">{movie.title}</h1>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-muted-foreground mb-6">
                  <span>{movie.releaseYear}</span>
                  <span className="hidden md:inline">|</span>
                  <span>{movie.duration}</span>
                  <span className="hidden md:inline">|</span>
                  <span>{movie.language}</span>
                </div>
                
                {movie.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground text-lg mb-2">Synopsis</h3>
                    <p className="text-muted-foreground leading-relaxed">{movie.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.categories.map((category) => (
                        <span key={category} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Cast</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.artists.map((artist) => (
                        <span key={artist} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Movie Director:</span> {movie.movieDirector}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                {movie.trailerUrl && (
                  <button
                    onClick={() => window.open(movie.trailerUrl, '_blank')}
                    className="btn btn-outline w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    <Play size={20} />
                    Watch Trailer
                  </button>
                )}
              </div>

              {/* Stats & Reactions */}
              <div className="bg-card p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <Eye size={24} className="mx-auto mb-1 text-blue-500" />
                    <div className="text-xl font-bold text-foreground">{movie.viewCount}</div>
                    <div className="text-sm text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center">
                    <Heart size={24} className="mx-auto mb-1 text-red-500" />
                    <div className="text-xl font-bold text-foreground">{movie.likes}</div>
                    <div className="text-sm text-muted-foreground">Likes</div>
                  </div>
                  <div className="text-center">
                    <ThumbsDown size={24} className="mx-auto mb-1 text-gray-500" />
                    <div className="text-xl font-bold text-foreground">{movie.dislikes}</div>
                    <div className="text-sm text-muted-foreground">Dislikes</div>
                  </div>
                  <div className="text-center">
                    <Star size={24} className="mx-auto mb-1 text-yellow-500" />
                    <div className="text-xl font-bold text-foreground">{movie.rating || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                </div>

                {user && (
                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
                    <button
                      onClick={() => handleReaction(userReaction === 'like' ? 'remove' : 'like')}
                      className={`btn flex items-center gap-2 transition-colors ${
                        userReaction === 'like' ? 'btn-primary' : 'btn-outline'
                      }`}
                    >
                      <Heart size={20} />
                      {userReaction === 'like' ? 'Liked' : 'Like'}
                    </button>
                    <button
                      onClick={() => handleReaction(userReaction === 'dislike' ? 'remove' : 'dislike')}
                      className={`btn flex items-center gap-2 transition-colors ${
                        userReaction === 'dislike' ? 'btn-danger' : 'btn-outline'
                      }`}
                    >
                      <ThumbsDown size={20} />
                      {userReaction === 'dislike' ? 'Disliked' : 'Dislike'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <MessageCircle size={28} />
              Comments ({comments.length})
            </h2>

            {user && (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="form-group mb-4">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="form-input h-24 resize-none"
                    rows="4"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submittingComment}
                    className="btn btn-primary"
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment._id} className="bg-card p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{comment.username}</span>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        {comment.isEdited && <span>&bull; (edited)</span>}
                      </div>
                    </div>
                  </div>
                  <p className="text-secondary-foreground leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>

            {comments.length === 0 && !user && (
              <p className="text-muted-foreground text-center py-8">Login to see and post comments.</p>
            )}
            {comments.length === 0 && user && (
              <p className="text-muted-foreground text-center py-8">Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
