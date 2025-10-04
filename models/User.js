const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  recentlyVisited: [{
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie'
    },
    visitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likedMovies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  dislikedMovies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  
  
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Limit recently visited to 15 items
userSchema.methods.addToRecentlyVisited = function(movieId) {
  // Remove if already exists
  this.recentlyVisited = this.recentlyVisited.filter(
    item => !item.movieId.equals(movieId)
  );
  
  // Add to beginning
  this.recentlyVisited.unshift({ movieId, visitedAt: new Date() });
  
  // Keep only last 15
  if (this.recentlyVisited.length > 15) {
    this.recentlyVisited = this.recentlyVisited.slice(0, 15);
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
