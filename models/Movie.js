const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  categories: [{
    type: String,
    required: true,
    trim: true
  }],
  artists: [{
    type: String,
    required: true,
    trim: true
  }],
  musicDirector: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true,
    trim: true
  },
  downloadLink: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  releaseYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 5
  },
  duration: {
    type: String, // e.g., "2h 30m"
    trim: true
  },
  posterUrl: {
    type: String,
    trim: true
  },
  trailerUrl: {
    type: String,
    trim: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
movieSchema.index({ title: 'text', categories: 'text', artists: 'text', language: 'text' });
movieSchema.index({ viewCount: -1 });
movieSchema.index({ likes: -1 });
movieSchema.index({ createdAt: -1 });

// Virtual for trending score
movieSchema.virtual('trendingScore').get(function() {
  const daysSinceCreation = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyFactor = Math.max(0.1, 1 - (daysSinceCreation / 30)); // Decay over 30 days
  return (this.viewCount * 0.4 + this.likes * 0.6) * recencyFactor;
});

// Method to increment view count
movieSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to update likes/dislikes
movieSchema.methods.updateLikes = function(liked, disliked) {
  if (liked) this.likes += 1;
  if (disliked) this.dislikes += 1;
  return this.save();
};

module.exports = mongoose.model('Movie', movieSchema);
