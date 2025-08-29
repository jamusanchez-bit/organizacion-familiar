import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import SimpleLogin from '@/components/simple-login';

interface User {
  id: string;
  email: string;
  firstName: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [shouldRetry, setShouldRetry] = useState(0);
  
  // Use simple auth system
  const isIndependentMode = true;
  
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ['/api/simple-auth/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = async () => {
    try {
      await fetch('/api/simple-auth/logout', { method: 'POST' });
      localStorage.removeItem('selectedFamilyUser');
      setShouldRetry(prev => prev + 1);
      refetch();
    } catch (error) {
      console.error('Logout error:', error);
      // Force re-fetch even if logout failed
      setShouldRetry(prev => prev + 1);
      refetch();
    }
  };

  const handleLoginSuccess = () => {
    setShouldRetry(prev => prev + 1);
    refetch();
  };

  // Don't intercept here - let the App component handle the routing
  // The AuthProvider should only provide auth state, not control routing

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};