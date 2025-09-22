const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Movie = require('./models/Movie');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://visaal2405_db_user:VISAAL%232424@cluster0.rl8rpst.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Movie.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create sample users
    console.log('Creating sample users...');
    const adminUser = new User({
      username: 'admin',
      email: 'admin@moviehub.com',
      password: 'admin123',
      userType: 'admin'
    });
    await adminUser.save();

    const regularUser = new User({
      username: 'user',
      email: 'user@moviehub.com',
      password: 'user123',
      userType: 'user'
    });
    await regularUser.save();
    console.log('✅ Created sample users');

    // Create sample movies
    console.log('Creating sample movies...');
    const sampleMovies = [
      {
        title: 'The Dark Knight',
        categories: ['Action', 'Crime', 'Drama'],
        artists: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
        musicDirector: 'Hans Zimmer',
        language: 'English',
        downloadLink: 'https://example.com/dark-knight.mp4',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        releaseYear: 2008,
        duration: '2h 32m',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        viewCount: 1500,
        likes: 89,
        dislikes: 3,
        rating: 9.0
      },
      {
        title: 'Inception',
        categories: ['Action', 'Sci-Fi', 'Thriller'],
        artists: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'],
        musicDirector: 'Hans Zimmer',
        language: 'English',
        downloadLink: 'https://example.com/inception.mp4',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        releaseYear: 2010,
        duration: '2h 28m',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        viewCount: 2100,
        likes: 95,
        dislikes: 2,
        rating: 8.8
      },
      {
        title: 'Interstellar',
        categories: ['Adventure', 'Drama', 'Sci-Fi'],
        artists: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
        musicDirector: 'Hans Zimmer',
        language: 'English',
        downloadLink: 'https://example.com/interstellar.mp4',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        releaseYear: 2014,
        duration: '2h 49m',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        viewCount: 1800,
        likes: 92,
        dislikes: 5,
        rating: 8.6
      },
      {
        title: 'Baahubali: The Beginning',
        categories: ['Action', 'Drama', 'Fantasy'],
        artists: ['Prabhas', 'Rana Daggubati', 'Anushka Shetty'],
        musicDirector: 'M.M. Keeravani',
        language: 'English',
        downloadLink: 'https://example.com/baahubali1.mp4',
        description: 'In the kingdom of Mahishmati, Shivudu grows up with his adoptive parents and falls in love with a warrior princess.',
        releaseYear: 2015,
        duration: '2h 39m',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDliMmNhNDEtODUyOS00MjNlLTgxODEtN2U3NzI3MzlXZTY0XkEyXkFqcGdeQXVyNTgxODY5ODI@._V1_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=sOEg_ZYQs4w',
        viewCount: 3200,
        likes: 98,
        dislikes: 1,
        rating: 8.1
      },
      {
        title: 'Dangal',
        categories: ['Biography', 'Drama', 'Sport'],
        artists: ['Aamir Khan', 'Sakshi Tanwar', 'Fatima Sana Shaikh'],
        musicDirector: 'Pritam',
        language: 'Hindi',
        downloadLink: 'https://example.com/dangal.mp4',
        description: 'Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression.',
        releaseYear: 2016,
        duration: '2h 41m',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTQ4MzQzMzM2NF5BMl5BanBnXkFtZTgwMTQ1NzU3MDI@._V1_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=x_7YlGv9u1g',
        viewCount: 2800,
        likes: 94,
        dislikes: 2,
        rating: 8.4
      },
      {
        title: 'Parasite',
        categories: ['Comedy', 'Drama', 'Thriller'],
        artists: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
        musicDirector: 'Jung Jaeil',
        language: 'Korean',
        downloadLink: 'https://example.com/parasite.mp4',
        description: 'A poor family, the Kims, con their way into becoming the servants of a rich family, the Parks. But their easy life gets complicated when their deception is threatened with exposure.',
        releaseYear: 2019,
        duration: '2h 12m',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LThkN2UtNzY5YzEwZGY3MzYzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
        viewCount: 1900,
        likes: 96,
        dislikes: 1,
        rating: 8.5
      },
      {
        title: 'RRR',
        categories: ['Action', 'Drama', 'History'],
        artists: ['N.T. Rama Rao Jr.', 'Ram Charan', 'Alia Bhatt'],
        musicDirector: 'M.M. Keeravani',
        language: 'English',
        downloadLink: 'https://example.com/rrr.mp4',
        description: 'A fictional story about two legendary revolutionaries and their journey away from home before they started fighting for their country in 1920s.',
        releaseYear: 2022,
        duration: '3h 7m',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyYTEtMDc5Y2E1ZjBmZDNiXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=fo5X6aBUF3I',
        viewCount: 4500,
        likes: 99,
        dislikes: 0,
        rating: 7.8
      },
      {
        title: 'Top Gun: Maverick',
        categories: ['Action', 'Drama'],
        artists: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly'],
        musicDirector: 'Harold Faltermeyer',
        language: 'English',
        downloadLink: 'https://example.com/topgun2.mp4',
        description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN\'s elite graduates on a mission that demands the ultimate sacrifice from those chosen to fly it.',
        releaseYear: 2022,
        duration: '2h 11m',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00ZTQ0LWJkODUtMmVhMjIwMjA1ZmQwXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=qSqVVswa420',
        viewCount: 3600,
        likes: 97,
        dislikes: 1,
        rating: 8.3
      }
    ];

    for (const movieData of sampleMovies) {
      const movie = new Movie(movieData);
      await movie.save();
    }
    console.log('✅ Created sample movies');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSample accounts created:');
    console.log('Admin: admin@moviehub.com / admin123');
    console.log('User: user@moviehub.com / user123');
    console.log('\nYou can now start the application and test with these accounts.');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the seeder
seedData();
