
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { usersData } from "@/data/mockData";

type AuthContextType = {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<User>;
  isLoading: boolean;
  userRole: "USER" | "PARTNER" | "ADMIN" | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"USER" | "PARTNER" | "ADMIN" | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("goodfit_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setUserRole(user.role);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    
    // Simulate API call with delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Find user in mock data
        const user = usersData.find(u => u.email === email);
        
        if (user) {
          setCurrentUser(user);
          setUserRole(user.role);
          localStorage.setItem("goodfit_user", JSON.stringify(user));
          setIsLoading(false);
          resolve(user);
        } else {
          setIsLoading(false);
          reject(new Error("Invalid email or password"));
        }
      }, 800);
    });
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call with delay
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentUser(null);
        setUserRole(null);
        localStorage.removeItem("goodfit_user");
        setIsLoading(false);
        resolve();
      }, 500);
    });
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<User> => {
    setIsLoading(true);
    
    // Simulate API call with delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if email already exists
        const existingUser = usersData.find(u => u.email === email);
        
        if (existingUser) {
          setIsLoading(false);
          reject(new Error("Email already in use"));
          return;
        }
        
        // Create new user
        const newUser: User = {
          id: `user_${Date.now()}`,
          name,
          email,
          phone,
          role: "USER",
          createdAt: new Date().toISOString(),
          profileImage: "/placeholder.svg"
        };
        
        setCurrentUser(newUser);
        setUserRole("USER");
        localStorage.setItem("goodfit_user", JSON.stringify(newUser));
        setIsLoading(false);
        resolve(newUser);
      }, 800);
    });
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
    isLoading,
    userRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
