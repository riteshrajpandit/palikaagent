"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  loginUser as apiLoginUser,
  logoutUser as apiLogoutUser,
  getUserData,
  isAuthenticated as checkAuth,
  type LoginCredentials,
  type UserData,
} from "@/lib/auth";

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      if (checkAuth()) {
        const userData = getUserData();
        setUser(userData);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiLoginUser(credentials);
      const userData: UserData = {
        email_address: response.email_address,
        user_id: response.user_id,
        name: response.name,
        surname: response.surname,
        palika: response.palika,
        is_staff_user: response.is_staff_user,
        is_system_admin: response.is_system_admin,
      };
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    apiLogoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
