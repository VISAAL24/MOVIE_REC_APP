import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Shield, User as UserIcon, Calendar, Hash } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, token } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !isAdmin()) {
      showError('You are not authorized to view this page.');
      navigate('/unauthorized');
      return;
    }
    fetchUsers();
  }, [user, isAdmin, navigate, showError]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/users', config);
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      showError('Failed to fetch users.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        await axios.delete(`http://localhost:5000/api/users/${userId}`, config);
        showSuccess('User deleted successfully.');
        fetchUsers(); // Refresh the list
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to delete user.');
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-background">
            <div className="loading-spinner"></div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-background text-primary">
      <h1 className="text-4xl font-bold mb-8">User Management</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {users.map((u) => (
          <div key={u._id} className="bg-card rounded-lg shadow-lg p-5 flex flex-col justify-between transition-transform transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    u.userType === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                  {u.userType}
                </span>
                {user?._id !== u._id && (
                  <button onClick={() => handleDelete(u._id)} className="text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-secondary mx-auto flex items-center justify-center mb-3">
                  {u.userType === 'admin' ? <Shield size={40} className="text-primary" /> : <UserIcon size={40} className="text-primary" />}
                </div>
                <h2 className="text-xl font-bold text-primary truncate">{u.username}</h2>
                <p className="text-sm text-secondary truncate">{u.email}</p>
              </div>
              <div className="text-sm text-secondary space-y-2">
                <div className="flex items-center">
                    <Hash size={14} className="mr-2" />
                    <p className="font-mono text-xs break-all">{u._id}</p>
                </div>
                <div className="flex items-center">
                    <Calendar size={14} className="mr-2" />
                    <span>Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
