import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';
import { ArrowLeft, Play, Download, Heart, ThumbsDown, MessageCircle, Eye, Star } from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
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
    fetchMovieDetails();
    fetchComments();
  }, [id, user, navigate]);

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
      // Determine the action based on current state
      let newAction = action;
      if (userReaction === action) {
        newAction = 'remove'; // Toggle off if already liked/disliked
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
        showSuccess(`Movie ${newAction === 'remove' ? 'un' + (action === 'like' ? 'liked' : 'disliked') : newAction + 'd'} successfully!`);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    try {
      setSubmittingComment(true);
      const response = await axios.post(`http://localhost:5000/api/movies/${id}/comments`, {
        userId: user.id,
        username: user.username,
        content: commentText.trim()
      });

      if (response.data.success) {
        setComments([response.data.comment, ...comments]);
        setCommentText('');
        showSuccess('Comment added successfully!');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
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
    <div className="min-h-screen bg-secondary">
      <div className="container py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-blue-500 mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Info */}
          <div className="lg:col-span-2">
            <div className="bg-card p-6 rounded-lg shadow">
              <div className="flex items-start gap-6 mb-6">
                {movie.posterUrl && (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="object-cover rounded-lg"
                    style={{
                      maxWidth: '400px',
                      maxHeight: '600px',
                      width: 'auto',
                      height: 'auto'
                    }}
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-primary mb-2">{movie.title}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-secondary">{movie.releaseYear}</span>
                    <span className="text-secondary">{movie.duration}</span>
                    <span className="text-secondary">{movie.language}</span>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-semibold text-primary mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-primary mb-2">Cast</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.artists.map((artist, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-secondary">
                      <span className="font-semibold">Music Director:</span> {movie.musicDirector}
                    </p>
                  </div>

                  {movie.description && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-primary mb-2">Description</h3>
                      <p className="text-secondary">{movie.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => window.open(movie.downloadLink, '_blank')}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Download size={20} />
                  Download
                </button>
                
                {movie.trailerUrl && (
                  <button
                    onClick={() => window.open(movie.trailerUrl, '_blank')}
                    className="btn btn-outline flex items-center gap-2"
                  >
                    <Play size={20} />
                    Watch Trailer
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <Eye size={24} className="mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-primary">{movie.viewCount}</div>
                  <div className="text-sm text-secondary">Views</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <Heart size={24} className="mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold text-primary">{movie.likes}</div>
                  <div className="text-sm text-secondary">Likes</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <ThumbsDown size={24} className="mx-auto mb-2 text-gray-500" />
                  <div className="text-2xl font-bold text-primary">{movie.dislikes}</div>
                  <div className="text-sm text-secondary">Dislikes</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <Star size={24} className="mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold text-primary">{movie.rating || 'N/A'}</div>
                  <div className="text-sm text-secondary">Rating</div>
                </div>
              </div>

              {/* User Reactions */}
              {user && (
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => handleReaction(userReaction === 'like' ? 'remove' : 'like')}
                    className={`btn flex items-center gap-2 ${
                      userReaction === 'like' ? 'btn-primary' : 'btn-outline'
                    }`}
                  >
                    <Heart size={20} />
                    {userReaction === 'like' ? 'Liked' : 'Like'}
                  </button>
                  <button
                    onClick={() => handleReaction(userReaction === 'dislike' ? 'remove' : 'dislike')}
                    className={`btn flex items-center gap-2 ${
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

          {/* Comments Section */}
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <MessageCircle size={24} />
                Comments ({comments.length})
              </h2>

              {/* Add Comment */}
              {user && (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="form-group">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="form-input h-20 resize-none"
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submittingComment}
                    className="btn btn-primary"
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment._id} className="border-b border pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-primary">{comment.username}</span>
                      <span className="text-sm text-secondary">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {comment.isEdited && (
                        <span className="text-xs text-secondary">(edited)</span>
                      )}
                    </div>
                    <p className="text-secondary">{comment.content}</p>
                  </div>
                ))}
              </div>

              {comments.length === 0 && (
                <p className="text-secondary text-center py-4">No comments yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
