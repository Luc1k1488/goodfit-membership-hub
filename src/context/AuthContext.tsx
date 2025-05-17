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
  authInitialized: boolean;
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
  const [authInitialized, setAuthInitialized] = useState(false);

  // Функция получения текущего пользователя
  const fetchCurrentUser = async () => {
    console.log("Fetching current user...");
    
    setIsLoading(true); // Ensure loading is true at start
    
    try {
      const { session, user } = await getCurrentUserSession();
      
      if (user) {
        console.log("User found:", user);
        setCurrentUser(user);
        setUserRole(user.role);
      } else {
        console.log("No user session found");
        setCurrentUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error("Error in fetchCurrentUser:", error);
      setCurrentUser(null);
      setUserRole(null);
    } finally {
      // CRITICAL: Always set these flags to ensure they're updated
      console.log(">>> Finally block reached");
      setIsLoading(false);
      setAuthInitialized(true);
      console.log("Auth initialized, loading complete");
    }
  };

  // Initialize auth state on mount and set up auth listener
  useEffect(() => {
    // First initialization - fetch user and set initialized flag
    fetchCurrentUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session exists:", !!session);
      
      // Set loading to true for any auth event
      setIsLoading(true);
      
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
            // Only reset user if we failed to get the latest data
            setCurrentUser(null);
            setUserRole(null);
          } finally {
            // Always set these flags
            setIsLoading(false);
            setAuthInitialized(true);
            console.log("Auth state change processed, loading complete");
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setCurrentUser(null);
        setUserRole(null);
        
        // Update flags immediately
        setIsLoading(false);
        setAuthInitialized(true);
        console.log("Sign out processed, loading complete");
      } else {
        // For any other event, ensure we're not stuck in loading state
        setIsLoading(false);
        setAuthInitialized(true);
        console.log("Other auth event processed, loading complete");
      }
    });

    // Regular session check to prevent stale sessions
    const sessionCheckInterval = setInterval(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session && currentUser) {
          console.log("Session expired, logging out");
          setCurrentUser(null);
          setUserRole(null);
          setAuthInitialized(true);
          setIsLoading(false);
        }
      });
    }, 60000); // Check every minute

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
      clearInterval(sessionCheckInterval);
    };
  }, [currentUser]); // Add currentUser as dependency to detect session changes

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
      setAuthInitialized(true);
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
      setAuthInitialized(true);
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
    authInitialized,
    userRole
  };

  // For debugging auth states
  useEffect(() => {
    console.log("Auth state updated:", { 
      isLoading, 
      authInitialized, 
      userExists: !!currentUser,
      role: userRole,
      userId: currentUser?.id
    });
  }, [isLoading, authInitialized, currentUser, userRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
