import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        if (savedToken) {
          setToken(savedToken);
          const profile = await api.get('/auth/me');
          setUser(profile);
        }
      } catch (err) {
        await AsyncStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (name, email, password, shopName) => {
    const data = await api.post('/auth/signup', {
      name,
      email,
      password,
      shopName,
    });
    await AsyncStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const setSession = async (tokenValue, userValue) => {
    await AsyncStorage.setItem('token', tokenValue);
    setToken(tokenValue);
    setUser(userValue);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.get('/auth/me');
      setUser(profile);
      return profile;
    } catch (e) {
      return null;
    }
  };

  const refreshSubscription = async () => {
    try {
      const sub = await api.get('/billing/subscription');
      if (sub?.plan) {
        updateUser({ plan: sub.plan, planExpiresAt: sub.planExpiresAt });
      }
      return sub;
    } catch (e) {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        setSession,
        updateUser,
        refreshProfile,
        refreshSubscription,
        isLoggedIn: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}