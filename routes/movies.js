const express = require('express');
const Movie = require('../models/Movie');
const Comment = require('../models/Comment');
const User = require('../models/User');
const router = express.Router();

// Get all movies with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      artist,
      language,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { categories: { $regex: search, $options: 'i' } },
        { artists: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.categories = { $in: [category] };
    }

    // Filter by artist
    if (artist) {
      query.artists = { $in: [artist] };
    }

    // Filter by language
    if (language) {
      query.language = language;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const movies = await Movie.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-downloadLink'); // Don't expose download link in list view

    const total = await Movie.countDocuments(query);

    res.json({
      success: true,
      movies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get trending movies
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const movies = await Movie.find({ isActive: true })
      .sort({ releaseYear: -1, rating: -1 }) // Sort by latest release year, then highest rating
      .limit(parseInt(limit))
      .select('-downloadLink');

    res.json({
      success: true,
      movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Create new movie (Admin only)
router.post('/', async (req, res) => {
  try {
    console.log('Received movie creation request. Body:', req.body);
    const movieData = req.body;
    const { userId } = req.body; 
    
    // Ensure movieDirector and rating are passed correctly
    const movieToSave = {
      ...movieData,
      createdBy: userId,
      movieDirector: movieData.movieDirector || movieData.musicDirector, // Fallback for old field name if still present somewhere
      rating: parseInt(movieData.rating) || 0 // Ensure rating is an integer, default to 0
    };
    delete movieToSave.musicDirector; // Remove old field if it exists

    console.log('Movie data to be saved:', movieToSave);

    const movie = new Movie(movieToSave);
    
    await movie.save();

    console.log('Movie saved successfully:', movie);

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update movie (Admin only)
router.put('/:id', async (req, res) => {
  try {
    console.log('Received movie update request. Body:', req.body);
    const updateData = { ...req.body };

    // Ensure rating is parsed as an integer
    if (updateData.rating) {
      updateData.rating = parseInt(updateData.rating) || 0;
    }

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      message: 'Movie updated successfully',
      movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete movie (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Increment view count
router.post('/:id/view', async (req, res) => {
  try {
    const { userId } = req.body;
    const movie = await Movie.findById(req.params.id).populate('createdBy');
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Increment movie's view count
    await movie.incrementViewCount();

    
    

    // Add to user's recently visited if userId provided
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        await user.addToRecentlyVisited(movie._id);
      }
    }

    res.json({
      success: true,
      message: 'View count updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Like/Dislike movie
router.post('/:id/reaction', async (req, res) => {
  try {
    const { userId, action } = req.body; // action: 'like', 'dislike', 'remove'
    const movie = await Movie.findById(req.params.id);
    const user = await User.findById(userId);

    if (!movie || !user) {
      return res.status(404).json({
        success: false,
        message: 'Movie or user not found'
      });
    }

    const movieId = movie._id;
    const wasLiked = user.likedMovies.some(id => id.equals(movieId));
    const wasDisliked = user.dislikedMovies.some(id => id.equals(movieId));

    // Remove from both arrays first
    user.likedMovies = user.likedMovies.filter(id => !id.equals(movieId));
    user.dislikedMovies = user.dislikedMovies.filter(id => !id.equals(movieId));

    
    
    

    // Adjust movie counts based on previous state
    if (wasLiked) {
      movie.likes = Math.max(0, movie.likes - 1);
    }
    if (wasDisliked) {
      movie.dislikes = Math.max(0, movie.dislikes - 1);
    }

    // Add new reaction if not removing
    if (action === 'like') {
      user.likedMovies.push(movieId);
      movie.likes += 1;
    } else if (action === 'dislike') {
      user.dislikedMovies.push(movieId);
      movie.dislikes += 1;
    }

    await user.save();
    await movie.save();

    res.json({
      success: true,
      message: `Movie ${action}d successfully`,
      movie: {
        likes: movie.likes,
        dislikes: movie.dislikes
      },
      userReaction: action === 'remove' ? null : action
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get movie comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ movieId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'username');

    res.json({
      success: true,
      comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Add comment
router.post('/:id/comments', async (req, res) => {
  try {
    console.log('Received comment post request:', req.body);
    const { userId, username, content } = req.body;

    if (!userId || !username || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields for comment.' });
    }
    
    const comment = new Comment({
      movieId: req.params.id,
      userId,
      username,
      content
    });

    await comment.save();

    // Populate the userId to get the username for the response
    await comment.populate('userId', 'username');

    console.log('Comment saved successfully:', comment);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get filter options
router.get('/filters/options', async (req, res) => {
  try {
    const categories = await Movie.distinct('categories');
    const artists = await Movie.distinct('artists');
    const languages = await Movie.distinct('language');

    res.json({
      success: true,
      filters: {
        categories,
        artists,
        languages
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
