import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [likedMovies, setLikedMovies] = useState([]);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Normalize user id fields so components can use either `id` or `_id`
        const normalizedUser = {
          ...parsedUser,
          id: parsedUser.id || parsedUser._id,
          _id: parsedUser._id || parsedUser.id,
        };
        setUser(normalizedUser);
        setToken(normalizedUser.token);
        // Fetch liked movies for persistent like state
        try {
          const userId = normalizedUser._id || normalizedUser.id;
          const res = await axios.get(`http://localhost:5000/api/users/${userId}/liked-movies`);
          if (res.data.success) {
            setLikedMovies(res.data.likedMovies.map(m => String(m._id)));
          }
        } catch (err) {
          setLikedMovies([]);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { user: userData, token: userToken } = response.data;
        const userWithToken = { ...userData, token: userToken };
        // Normalize id fields
        const normalizedUser = {
          ...userWithToken,
          id: userWithToken.id || userWithToken._id,
          _id: userWithToken._id || userWithToken.id,
        };
        setUser(normalizedUser);
        setToken(userToken);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        // Fetch liked movies for persistent like state
        try {
          const userId = normalizedUser._id || normalizedUser.id;
          const res = await axios.get(`http://localhost:5000/api/users/${userId}/liked-movies`);
          if (res.data.success) {
            setLikedMovies(res.data.likedMovies.map(m => String(m._id)));
          }
        } catch (err) {
          setLikedMovies([]);
        }
        return { success: true, user: normalizedUser };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
      });

      if (response.data.success) {
        const { user: userData, token: userToken } = response.data;
        const userWithToken = { ...userData, token: userToken };
        const normalizedUser = {
          ...userWithToken,
          id: userWithToken.id || userWithToken._id,
          _id: userWithToken._id || userWithToken.id,
        };
        setUser(normalizedUser);
        setToken(userToken);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        return { success: true, user: normalizedUser };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
  };

  const isAdmin = () => {
    return user?.userType === 'admin';
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAdmin,
    loading,
    likedMovies,
    setLikedMovies
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
