
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
  formatPhoneNumber
} from "@/services/authService";

type AuthContextType = {
  currentUser: User | null;
  login: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (name: string, phone: string) => Promise<void>;
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
        } else {
          setCurrentUser(null);
          setUserRole(null);
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
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userError) {
              console.error("Error fetching user data:", userError);
              setCurrentUser(null);
              setUserRole(null);
              return;
            }

            if (userData) {
              const user: User = {
                id: userData.id,
                name: userData.name,
                email: userData.email || '',
                phone: userData.phone || '',
                role: userData.role as "USER" | "PARTNER" | "ADMIN",
                createdAt: userData.created_at,
                profileImage: userData.profile_image || '/placeholder.svg'
              };

              setCurrentUser(user);
              setUserRole(user.role);
            }
          } catch (error) {
            console.error("Error during auth state change:", error);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUserRole(null);
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (phone: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log("Attempting login with phone:", phone);
      await sendOTP(phone);
      
      toast.success("Код подтверждения отправлен на ваш телефон", {
        description: "Пожалуйста, введите полученный код"
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

  const verifyOTP = async (phone: string, otp: string): Promise<User> => {
    setIsLoading(true);
    console.log("Starting OTP verification for phone:", phone, "with code:", otp);
    
    try {
      const supabaseUser = await verifyOTPCode(phone, otp);
      console.log("OTP verification successful, getting user data...");
      
      // Получаем или создаем пользователя в базе данных
      const user = await getUserOrCreate(supabaseUser.id, { phone: formatPhoneNumber(phone) });

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

  const register = async (name: string, phone: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log("Starting registration for:", name, phone);
      
      // Для регистрации сначала отправляем OTP
      await sendOTP(phone);
      
      // Сохраняем имя временно (будет сохранено после проверки OTP)
      localStorage.setItem('pendingRegistrationName', name);
      
      toast.success("Код подтверждения отправлен на ваш телефон", {
        description: "Пожалуйста, введите полученный код для завершения регистрации"
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
