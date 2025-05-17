
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { 
  sendOTP, 
  verifyOTPCode, 
  getUserOrCreate, 
  logoutUser,
  getCurrentUserSession,
  formatPhoneNumber,
  isEmail
} from "@/services/authService";

type AuthContextType = {
  currentUser: User | null;
  login: (contact: string) => Promise<void>;
  verifyOTP: (contact: string, otp: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (name: string, contact: string) => Promise<void>;
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

  // Check user session and set current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      setIsLoading(true);
      
      try {
        const { session, user } = await getCurrentUserSession();
        
        if (user) {
          setCurrentUser(user);
          setUserRole(user.role);
          console.log("User session established:", user);
        } else {
          setCurrentUser(null);
          setUserRole(null);
          console.log("No user session found");
        }
      } catch (error) {
        console.error("Error in getCurrentUser:", error);
        setCurrentUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          try {
            // Get or create user in DB when signed in
            const userData: Record<string, string> = {};
            
            if (session.user.email) {
              userData.email = session.user.email;
            }
            
            if (session.user.phone) {
              userData.phone = session.user.phone;
            }
            
            const user = await getUserOrCreate(session.user.id, userData);
            
            setCurrentUser(user);
            setUserRole(user.role);
            console.log("User data updated after auth change:", user);
          } catch (error) {
            console.error("Error during auth state change:", error);
            setCurrentUser(null);
            setUserRole(null);
          } finally {
            setIsLoading(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setCurrentUser(null);
        setUserRole(null);
        setIsLoading(false);
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (contact: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log("Attempting login with contact:", contact);
      await sendOTP(contact);
      
      toast.success("Код подтверждения отправлен", {
        description: isEmail(contact) 
          ? "Пожалуйста, проверьте вашу почту" 
          : "Пожалуйста, введите полученный SMS-код"
      });
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Не удалось войти';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (contact: string, otp: string): Promise<User> => {
    setIsLoading(true);
    console.log("Starting OTP verification for:", contact, "with code:", otp);
    
    try {
      // Verify the OTP code
      const supabaseUser = await verifyOTPCode(contact, otp);
      console.log("OTP verification successful, getting user data...");
      
      // Get user data based on contact type
      const userData: Record<string, string> = {};
      
      // Determine whether this is a login via email or phone
      if (isEmail(contact)) {
        userData.email = contact;
      } else {
        userData.phone = formatPhoneNumber(contact);
      }
      
      // Get pending registration name if this is part of a registration flow
      const pendingName = localStorage.getItem('pendingRegistrationName');
      if (pendingName) {
        userData.name = pendingName;
        localStorage.removeItem('pendingRegistrationName');
      }
      
      // Get or create user in database
      const user = await getUserOrCreate(supabaseUser.id, userData);

      setCurrentUser(user);
      setUserRole(user.role);
      
      console.log("User successfully authenticated:", user);
      return user;
    } catch (error) {
      console.error("Error during verification process:", error);
      const errorMessage = error instanceof Error ? error.message : 'Неверный код';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при выходе';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, contact: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log("Starting registration for:", name, contact);
      
      // Для регистрации сначала отправляем OTP
      await sendOTP(contact);
      
      // Сохраняем имя временно (будет сохранено после проверки OTP)
      localStorage.setItem('pendingRegistrationName', name);
      
      toast.success("Код подтверждения отправлен", {
        description: isEmail(contact) 
          ? "Пожалуйста, проверьте вашу почту" 
          : "Пожалуйста, введите полученный SMS-код для завершения регистрации"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка регистрации';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    login,
    verifyOTP,
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
