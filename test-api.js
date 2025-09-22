const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('Testing Movie Recommendation System API...\n');

  try {
    // Test server connection
    console.log('1. Testing server connection...');
    const healthCheck = await axios.get(`${API_BASE}/health`).catch(() => null);
    if (healthCheck) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server is not responding');
      return;
    }

    // Test user registration
    console.log('\n2. Testing user registration...');
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      userType: 'user'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
      console.log('✅ User registration successful');
      console.log('User ID:', registerResponse.data.user.id);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('✅ User already exists (expected)');
      } else {
        console.log('❌ User registration failed:', error.response?.data?.message || error.message);
      }
    }

    // Test user login
    console.log('\n3. Testing user login...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ User login successful');
      console.log('User Type:', loginResponse.data.user.userType);
    } catch (error) {
      console.log('❌ User login failed:', error.response?.data?.message || error.message);
    }

    // Test admin registration
    console.log('\n4. Testing admin registration...');
    const testAdmin = {
      username: 'testadmin',
      email: 'admin@example.com',
      password: 'password123',
      userType: 'admin'
    };

    try {
      const adminRegisterResponse = await axios.post(`${API_BASE}/auth/register`, testAdmin);
      console.log('✅ Admin registration successful');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('✅ Admin already exists (expected)');
      } else {
        console.log('❌ Admin registration failed:', error.response?.data?.message || error.message);
      }
    }

    // Test movies endpoint
    console.log('\n5. Testing movies endpoint...');
    try {
      const moviesResponse = await axios.get(`${API_BASE}/movies`);
      console.log('✅ Movies endpoint working');
      console.log('Total movies:', moviesResponse.data.movies.length);
    } catch (error) {
      console.log('❌ Movies endpoint failed:', error.response?.data?.message || error.message);
    }

    // Test filter options
    console.log('\n6. Testing filter options...');
    try {
      const filtersResponse = await axios.get(`${API_BASE}/movies/filters/options`);
      console.log('✅ Filter options endpoint working');
      console.log('Categories:', filtersResponse.data.filters.categories.length);
      console.log('Artists:', filtersResponse.data.filters.artists.length);
      console.log('Languages:', filtersResponse.data.filters.languages.length);
    } catch (error) {
      console.log('❌ Filter options failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 API testing completed!');
    console.log('\nYou can now:');
    console.log('1. Start the frontend: cd client && npm run dev');
    console.log('2. Visit http://localhost:5173 to use the application');
    console.log('3. Login with test@example.com / password123 (user)');
    console.log('4. Login with admin@example.com / password123 (admin)');

  } catch (error) {
    console.log('❌ API test failed:', error.message);
    console.log('\nMake sure the server is running: npm run server');
  }
}

testAPI();
