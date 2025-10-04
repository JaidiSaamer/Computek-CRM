import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
const AuthContext = createContext();
import {apiUrl} from "@/lib/utils"

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('computek_user');
    const storedToken = localStorage.getItem('computek_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${apiUrl}/api/v1/auth/login`, {
        username: email,
        password: password
      });
      
      if (response.data.success) {
        setUser(response.data.data.user);
        setToken(response.data.data.token);
        // Store in localStorage
        localStorage.setItem('computek_user', JSON.stringify(response.data.data.user));
        localStorage.setItem('computek_token', response.data.data.token);
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('computek_user');
    localStorage.removeItem('computek_token');
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};