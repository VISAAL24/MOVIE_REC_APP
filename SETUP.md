# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Seed Sample Data (Optional)
```bash
# This will populate the database with sample movies and users
npm run seed
```

### 3. Start the Application
```bash
# Start both frontend and backend
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔑 Test Accounts

After running `npm run seed`, you can use these accounts:

### Admin Account
- **Email**: admin@moviehub.com
- **Password**: admin123
- **Features**: Add, edit, delete movies, view statistics

### User Account
- **Email**: user@moviehub.com
- **Password**: user123
- **Features**: Browse movies, like/dislike, comment, get recommendations

## 🧪 Test the API

```bash
# Test if the backend is working
npm run test-api
```

## 📱 Features to Try

### As Admin:
1. Login with admin account
2. Add a new movie using the "Add Movie" button
3. Edit existing movies
4. Filter movies by category/artist/language
5. Switch between grid and list view
6. View trending movies

### As User:
1. Login with user account
2. Browse movies and use search/filters
3. Click on movies to view details
4. Like/dislike movies
5. Add comments
6. Check "Recently Visited" tab
7. Check "Recommendations" tab

## 🎨 UI Features
- **Dark/Light Mode**: Toggle in the navbar
- **Responsive Design**: Works on mobile, tablet, desktop
- **View Modes**: Grid view (cards) and List view (table)
- **Search & Filter**: Real-time search and multiple filters

## 🛠️ Troubleshooting

### Backend not starting?
```bash
# Check if MongoDB connection is working
npm run test-api
```

### Frontend not loading?
```bash
# Make sure you're in the client directory
cd client
npm run dev
```

### Database connection issues?
- Check your MongoDB Atlas connection string
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify network connectivity

## 📁 Project Structure
```
movie-recommendation-system/
├── client/                 # React frontend
├── models/                 # MongoDB models
├── routes/                 # API routes
├── server.js              # Express server
├── seed-data.js           # Sample data seeder
├── test-api.js            # API tester
└── README.md              # Full documentation
```

## 🎯 Next Steps

1. **Customize**: Modify the UI colors, fonts, or layout
2. **Add Features**: Implement user profiles, advanced recommendations
3. **Deploy**: Deploy to Heroku, Vercel, or your preferred platform
4. **Extend**: Add more movie metadata, user reviews, ratings

## 📞 Need Help?

- Check the full README.md for detailed documentation
- Review the API endpoints in the routes/ directory
- Test individual components in the client/src/ directory
