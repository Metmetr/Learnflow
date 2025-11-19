import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, saveAuthToken, removeAuthToken } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "educator" | "admin";
  verified: boolean;
  avatar?: string;
  specialty?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const currentUser = await authAPI.getMe();
        setUser(currentUser);
      } catch {
        // Not logged in
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user, token } = await authAPI.login(email, password);
    saveAuthToken(token);
    setUser(user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const { user, token } = await authAPI.signup(name, email, password);
    saveAuthToken(token);
    setUser(user);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout errors
    }
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
