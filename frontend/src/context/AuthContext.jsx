import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Load auth state from localStorage on init
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        try {
          // Sync with backend to get latest profile fields (applicationId, department, isActive, endDate)
          const response = await api.get('/auth/me');
          const freshUser = response.data.data;
          
          localStorage.setItem('user', JSON.stringify(freshUser));
          setUser(freshUser);
        } catch (err) {
          console.error("Failed to sync fresh user profile on init:", err);
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            setNotifications([]);
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Fetch and cache dynamic department labels for formatDepartment
  useEffect(() => {
    const fetchDeptLabels = async () => {
      try {
        const response = await api.get('/dropdowns');
        const depts = response.data.data.preferredDepartment;
        const mapping = {};
        depts.forEach(opt => {
          mapping[opt.value] = opt.label;
        });
        localStorage.setItem('departmentLabels', JSON.stringify(mapping));
      } catch (err) {
        console.error("Failed to load department labels on start:", err);
      }
    };
    fetchDeptLabels();
  }, []);

  // Fetch notifications once authenticated
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const unReadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        notifications,
        fetchNotifications,
        markNotificationRead,
        unReadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
