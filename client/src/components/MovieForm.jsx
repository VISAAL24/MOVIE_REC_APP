import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const MovieForm = ({ movie, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    categories: [''],
    artists: [''],
    movieDirector: '',
    language: '',
    downloadLink: '',
    description: '',
    releaseYear: new Date().getFullYear(),
    duration: '',
    posterUrl: '',
    trailerUrl: '',
    rating: 0 // Initialize rating
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        categories: movie.categories || [''],
        artists: movie.artists || [''],
        movieDirector: movie.musicDirector || '',
        language: movie.language || '',
        downloadLink: movie.downloadLink || '',
        description: movie.description || '',
        releaseYear: movie.releaseYear ? parseInt(movie.releaseYear) : new Date().getFullYear(),
        duration: movie.duration || '',
        posterUrl: movie.posterUrl || '',
        trailerUrl: movie.trailerUrl || '',
        rating: movie.rating ? parseInt(movie.rating) : 0 // Initialize rating
      });
    }
  }, [movie]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: (name === 'releaseYear' || name === 'rating') ? parseInt(value) || '' : value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const addArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData({
        ...formData,
        [field]: newArray
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Filter out empty strings from arrays
    const filteredData = {
      ...formData,
      categories: formData.categories.filter(item => item.trim() !== ''),
      artists: formData.artists.filter(item => item.trim() !== '')
    };

    try {
      await onSubmit(filteredData);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">
          {movie ? 'Edit Movie' : 'Add New Movie'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-secondary hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="form-error-banner">{error}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter movie title"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Language *</label>
            <input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter language"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Release Year</label>
            <input
              type="number"
              name="releaseYear"
              value={formData.releaseYear}
              onChange={handleChange}
              className="form-input"
              min="1900"
              max={new Date().getFullYear() + 5}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Duration</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., 2h 30m"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Movie Director *</label>
          <input
            type="text"
            name="movieDirector"
            value={formData.movieDirector}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter movie director name"
            required
          />
        </div>

        {/* Rating Input */}
        <div className="form-group">
          <label className="form-label">Rating (0-10)</label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className="form-input"
            min="0"
            max="10"
            step="1"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Categories *</label>
          {formData.categories.map((category, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={category}
                onChange={(e) => handleArrayChange('categories', index, e.target.value)}
                className="form-input flex-1"
                placeholder="Enter category"
                required
              />
              {formData.categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('categories', index)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('categories')}
            className="btn btn-outline flex items-center gap-2"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Artists/Actors *</label>
          {formData.artists.map((artist, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={artist}
                onChange={(e) => handleArrayChange('artists', index, e.target.value)}
                className="form-input flex-1"
                placeholder="Enter artist/actor name"
                required
              />
              {formData.artists.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('artists', index)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('artists')}
            className="btn btn-outline flex items-center gap-2"
          >
            <Plus size={16} />
            Add Artist
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Download Link</label>
          <input
            type="url"
            name="downloadLink"
            value={formData.downloadLink}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter download URL"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Poster URL</label>
          <input
            type="url"
            name="posterUrl"
            value={formData.posterUrl}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter poster image URL"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Trailer URL</label>
          <input
            type="url"
            name="trailerUrl"
            value={formData.trailerUrl}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter trailer video URL"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input h-24 resize-none"
            placeholder="Enter movie description"
            rows="3"
          />
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="loading"></div>
                {movie ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              movie ? 'Update Movie' : 'Create Movie'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovieForm;
