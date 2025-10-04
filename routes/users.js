const express = require('express');
const User = require('../models/User');
const Movie = require('../models/Movie');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Get all users (Admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

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

    // Keep the list at a certain size, e.g., 10
    if (user.recentlyVisited.length > 10) {
      user.recentlyVisited.pop();
    }

    await user.save();

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

// Update user profile (also used by admin to update any user)
router.put('/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only admin or the user themselves can update
    if (req.user.userType !== 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    // Only admin can change userType
    if (req.user.userType === 'admin') {
      user.userType = req.body.userType || user.userType;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        userType: updatedUser.userType,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// Update user (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.userType = req.body.userType || user.userType;

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          userType: updatedUser.userType,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Optional: Add logic to prevent admin from deleting themselves
      if (req.user.id.toString() === user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Admins cannot delete their own account.' });
      }
      await user.deleteOne();
      res.json({ success: true, message: 'User removed' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


module.exports = router;
