'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserPersonalizationProfile } from '@/lib/types/auth';
import { DEMO_PROFILES } from '@/lib/auth/demoProfiles';

const AUTH_STORAGE_KEY = 'nevada_nexus_current_user_v1';
const USERS_REGISTRY_KEY = 'nevada_nexus_registered_users_v1';

interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    account: { email: string; password?: string },
    profile: UserPersonalizationProfile
  ) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (demoId: string) => void;
  logout: () => void;
  updateProfile: (profileUpdates: Partial<UserPersonalizationProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from localStorage on client mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('Failed to load user session from localStorage:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistUser = (userData: UserAccount | null) => {
    setUser(userData);
    try {
      if (userData) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save user session to localStorage:', e);
    }
  };

  const getRegisteredUsers = (): UserAccount[] => {
    try {
      const data = localStorage.getItem(USERS_REGISTRY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  };

  const saveRegisteredUsers = (users: UserAccount[]) => {
    try {
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save registered users store:', e);
    }
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check demo accounts first
    const demo = DEMO_PROFILES.find((d) => d.email.toLowerCase() === trimmedEmail);
    if (demo) {
      const demoAccount: UserAccount = {
        id: demo.id,
        email: demo.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: demo.profile,
      };
      persistUser(demoAccount);
      return { success: true };
    }

    // Check registered users
    const users = getRegisteredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!existing) {
      return { success: false, error: 'No account found with this email. Please check your spelling or sign up.' };
    }

    if (password && existing.password && existing.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    persistUser(existing);
    return { success: true };
  };

  const signup = async (
    account: { email: string; password?: string },
    profile: UserPersonalizationProfile
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = account.email.trim().toLowerCase();
    if (!trimmedEmail) {
      return { success: false, error: 'Email is required.' };
    }

    const users = getRegisteredUsers();
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === trimmedEmail);

    const now = new Date().toISOString();
    const newAccount: UserAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: trimmedEmail,
      password: account.password,
      createdAt: now,
      updatedAt: now,
      profile: {
        ...profile,
        email: trimmedEmail,
        onboardingCompleted: true,
      },
    };

    if (existingIndex >= 0) {
      users[existingIndex] = newAccount;
    } else {
      users.push(newAccount);
    }

    saveRegisteredUsers(users);
    persistUser(newAccount);
    return { success: true };
  };

  const loginAsDemo = (demoId: string) => {
    const demo = DEMO_PROFILES.find((d) => d.id === demoId) || DEMO_PROFILES[0];
    const demoAccount: UserAccount = {
      id: demo.id,
      email: demo.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: { ...demo.profile },
    };
    persistUser(demoAccount);
  };

  const logout = () => {
    persistUser(null);
  };

  const updateProfile = (profileUpdates: Partial<UserPersonalizationProfile>) => {
    if (!user) return;
    const updatedUser: UserAccount = {
      ...user,
      updatedAt: new Date().toISOString(),
      profile: {
        ...user.profile,
        ...profileUpdates,
      },
    };

    // Update in registered users registry as well
    const users = getRegisteredUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = updatedUser;
      saveRegisteredUsers(users);
    }

    persistUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginAsDemo,
        logout,
        updateProfile,
      }}
    >
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
