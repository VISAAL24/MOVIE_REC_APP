const express = require('express');
const User = require('../models/User');
const Movie = require('../models/Movie');
const router = express.Router();

// Get user's recently visited movies
router.get('/:userId/recently-visited', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('recentlyVisited.movieId', 'title posterUrl viewCount likes categories language releaseYear')
      .select('recentlyVisited');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      recentlyVisited: user.recentlyVisited
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Add movie to recently visited
router.post('/:userId/recent', async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if movie exists
    const Movie = require('../models/Movie');
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Remove existing entry if it exists (to avoid duplicates)
    user.recentlyVisited = user.recentlyVisited.filter(
      item => !item.movieId.equals(movieId)
    );

    // Add to beginning of array
    user.recentlyVisited.unshift({
      movieId: movieId,
      visitedAt: new Date()
    });

    // Keep only last 15 entries
    if (user.recentlyVisited.length > 15) {
      user.recentlyVisited = user.recentlyVisited.slice(0, 15);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Movie added to recently visited',
      recentlyVisited: user.recentlyVisited
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user's liked movies
router.get('/:userId/liked-movies', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('likedMovies', 'title posterUrl viewCount likes categories')
      .select('likedMovies');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      likedMovies: user.likedMovies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user's disliked movies
router.get('/:userId/disliked-movies', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('dislikedMovies', 'title posterUrl viewCount dislikes categories')
      .select('dislikedMovies');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      dislikedMovies: user.dislikedMovies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user's movie recommendations based on liked movies
router.get('/:userId/recommendations', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('likedMovies', 'categories artists')
      .select('likedMovies');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get categories and artists from liked movies
    const likedCategories = [];
    const likedArtists = [];
    
    user.likedMovies.forEach(movie => {
      likedCategories.push(...movie.categories);
      likedArtists.push(...movie.artists);
    });

    // Find movies with similar categories or artists
    const recommendations = await Movie.find({
      _id: { $nin: user.likedMovies.map(m => m._id) },
      isActive: true,
      $or: [
        { categories: { $in: likedCategories } },
        { artists: { $in: likedArtists } }
      ]
    })
    .sort({ viewCount: -1, likes: -1 })
    .limit(10)
    .select('-downloadLink');

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { username, email },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
