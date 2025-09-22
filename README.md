# Movie Recommendation System

A complete Movie Recommendation System built with the MERN stack (MongoDB, Express, React, Node.js) featuring user authentication, movie management, and recommendation features.

## Features

### General Features
- **Modern UI**: Clean, responsive design with dark/light mode toggle
- **Authentication**: Separate login for Admin and General users
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Admin Features
- **Movie Management**: Add, edit, and delete movies
- **Movie Details**: Title, categories, artists, music director, language, download link
- **Filtering**: Filter movies by category, artist, and language
- **View Toggle**: Switch between grid and list view
- **Statistics**: View movie statistics (views, likes, dislikes)
- **Trending Movies**: See trending movies based on view counts

### User Features
- **Movie Browsing**: Browse all movies with filtering and search
- **Interactions**: Like, dislike, and comment on movies
- **Recently Visited**: Track last 15 visited movies
- **Recommendations**: Get personalized movie recommendations
- **View Tracking**: Automatic view count increment on movie clicks

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **RESTful APIs** for all operations
- **bcryptjs** for password hashing

### Frontend
- **React** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons
- **Context API** for state management

## Project Structure

```
movie-recommendation-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.jsx         # Main app component
├── models/                 # MongoDB models
├── routes/                 # API routes
├── server.js              # Express server
└── package.json           # Dependencies
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd movie-recommendation-system
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
npm install
```

#### Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://visaal2405_db_user:VISAAL%232424@cluster0.rl8rpst.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 4. Start the Application

#### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

#### Or Start Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile/:userId` - Get user profile

### Movies
- `GET /api/movies` - Get all movies (with filtering)
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/:id` - Get movie by ID
- `POST /api/movies` - Create new movie (Admin)
- `PUT /api/movies/:id` - Update movie (Admin)
- `DELETE /api/movies/:id` - Delete movie (Admin)
- `POST /api/movies/:id/view` - Increment view count
- `POST /api/movies/:id/reaction` - Like/dislike movie
- `GET /api/movies/:id/comments` - Get movie comments
- `POST /api/movies/:id/comments` - Add comment
- `GET /api/movies/filters/options` - Get filter options

### Users
- `GET /api/users/:userId/recently-visited` - Get recently visited movies
- `GET /api/users/:userId/liked-movies` - Get liked movies
- `GET /api/users/:userId/recommendations` - Get recommendations
- `PUT /api/users/:userId` - Update user profile

## Usage Guide

### For Admins
1. **Sign Up/Login** as Admin
2. **Add Movies**: Click "Add Movie" button to add new movies
3. **Edit Movies**: Click edit icon on any movie card
4. **Delete Movies**: Click delete icon on any movie card
5. **Filter Movies**: Use search and filter options
6. **View Statistics**: See trending movies and individual movie stats

### For Users
1. **Sign Up/Login** as General User
2. **Browse Movies**: Use the dashboard to browse all movies
3. **Search & Filter**: Use search bar and filters to find movies
4. **Interact**: Like, dislike, and comment on movies
5. **View Details**: Click on any movie to see detailed information
6. **Get Recommendations**: Check the recommendations tab for personalized suggestions

## Database Models

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  userType: String (admin/user),
  recentlyVisited: Array,
  likedMovies: Array,
  dislikedMovies: Array
}
```

### Movie Model
```javascript
{
  title: String,
  categories: Array,
  artists: Array,
  musicDirector: String,
  language: String,
  downloadLink: String,
  description: String,
  releaseYear: Number,
  duration: String,
  posterUrl: String,
  trailerUrl: String,
  viewCount: Number,
  likes: Number,
  dislikes: Number,
  rating: Number
}
```

### Comment Model
```javascript
{
  movieId: ObjectId,
  userId: ObjectId,
  username: String,
  content: String,
  likes: Number,
  dislikes: Number,
  isEdited: Boolean
}
```

## Features Implementation

### Dark/Light Mode
- Toggle button in navbar
- Persists user preference in localStorage
- Smooth transitions between themes

### Responsive Design
- Mobile-first approach
- Grid layouts that adapt to screen size
- Touch-friendly interface elements

### Search & Filtering
- Real-time search across movie titles, categories, and artists
- Multiple filter options (category, artist, language)
- Sort by various criteria (date, views, likes, title)

### View Modes
- Grid view: Card-based layout for visual browsing
- List view: Table-based layout for detailed information

### User Interactions
- Like/dislike system with visual feedback
- Comment system with real-time updates
- Recently visited tracking (last 15 movies)
- Personalized recommendations based on liked movies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
