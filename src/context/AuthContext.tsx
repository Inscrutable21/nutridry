'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Admin } from '@/types/admin';

type User = {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  isVerified: boolean;
};

type UserLoginCredentials = {
  email: string;
  password: string;
};

type LoginResponse = {
  success: boolean;
  message: string;
  redirectUrl?: string;
};

type AuthContextType = {
  admin: Admin | null;
  user: User | null;
  isLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  userLogin: (credentials: UserLoginCredentials) => Promise<LoginResponse>;
  userSignup: (name: string, email: string, password: string, mobile?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<number>(0);
  const router = useRouter();

  // Function to refresh authentication state
  const refreshAuth = useCallback(async () => {
    const now = Date.now();
    // Only refresh if it's been more than 5 seconds since the last check
    if (now - lastChecked < 5000) {
      return;
    }
    
    try {
      setIsLoading(true);
      setLastChecked(now);
      
      // Check user auth with cache-busting query parameter
      const userRes = await fetch(`/api/user/auth/check?t=${now}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        console.log('Auth check response:', userData);
        
        if (userData.isAuthenticated && userData.user) {
          setUser(userData.user);
        } else {
          setUser(null);
        }
      } else {
        console.error('User auth check failed with status:', userRes.status);
        setUser(null);
      }
      
    } catch (error) {
      console.error('Auth check failed', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [lastChecked]);

  // Check if admin or user is logged in on initial load
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Debug logging - remove in production
  useEffect(() => {
    console.log('AuthContext State Updated:', {
      admin: admin?.name || null,
      user: user?.name || null,
      isAuthenticated: !!user,
      isAdminAuthenticated: !!admin,
      isLoading
    });
  }, [admin, user, isLoading]);

  const adminLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Admin login failed:', errorData);
        return false;
      }

      const data = await res.json();
      setAdmin(data.admin);
      setUser(null); // Clear user state when admin logs in
      console.log('Admin login successful:', data.admin);
      return true;
    } catch (error) {
      console.error('Admin login failed', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const userLogin = async (credentials: UserLoginCredentials): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/user/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Immediately update the user state instead of waiting for refreshAuth
        if (data.user) {
          setUser(data.user);
        } else {
          // If no user data returned, fetch it immediately
          await refreshAuth();
        }
        
        // Add a slight delay before refreshing to ensure cookies are set
        setTimeout(() => {
          // Force a full page refresh to ensure all auth state is updated
          window.location.href = data.redirectUrl || '/';
        }, 500);
        
        return { 
          success: true, 
          message: data.message || 'Login successful', 
          redirectUrl: data.redirectUrl 
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const userSignup = async (name: string, email: string, password: string, mobile?: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/user/auth/signup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, mobile }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('User signup failed:', errorData);
        return false;
      }

      const data = await res.json();
      setUser(data.user);
      setAdmin(null); // Clear admin state when user signs up
      console.log('User signup successful:', data.user);
      return true;
    } catch (error) {
      console.error('User signup failed', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logout initiated...');
      
      if (admin) {
        console.log('Logging out admin...');
        const res = await fetch('/api/auth/logout', { 
          method: 'POST',
          credentials: 'include',
        });
        
        if (!res.ok) {
          console.warn('Admin logout API failed, but clearing local state');
        }
        
        setAdmin(null);
        console.log('Admin logged out, redirecting to admin login');
        router.push('/admin/login');
        
      } else if (user) {
        console.log('Logging out user...');
        const res = await fetch('/api/user/auth/logout', { 
          method: 'POST',
          credentials: 'include',
        });
        
        if (!res.ok) {
          console.warn('User logout API failed, but clearing local state');
        }
        
        setUser(null);
        console.log('User logged out, redirecting to home');
        router.push('/');
      }
      
    } catch (error) {
      console.error('Logout failed', error);
      // Even if the API call fails, clear the local state
      setAdmin(null);
      setUser(null);
      router.push('/');
    }
  };

  const contextValue: AuthContextType = {
    admin,
    user,
    isLoading,
    adminLogin,
    userLogin,
    userSignup,
    logout,
    refreshAuth,
    isAuthenticated: !!user && !admin, // User is authenticated only if user exists and admin doesn't
    isAdminAuthenticated: !!admin, // Admin is authenticated if admin exists
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
