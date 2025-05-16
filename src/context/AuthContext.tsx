
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

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
        // Get current user session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setCurrentUser(null);
          setUserRole(null);
          return;
        }
        
        if (!session) {
          setCurrentUser(null);
          setUserRole(null);
          return;
        }
        
        // Get user data from database
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
          // Transform database user to app user format
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
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
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
      // Format phone number to ensure E.164 format
      const formattedPhone = formatPhoneNumber(phone);
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        throw error;
      }
      
      toast.success("Код подтверждения отправлен на ваш телефон", {
        description: "Пожалуйста, введите полученный код"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось войти';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (phone: string, otp: string): Promise<User> => {
    setIsLoading(true);
    
    try {
      const formattedPhone = formatPhoneNumber(phone);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Пользователь не найден');
      }

      // Check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // If user doesn't exist in our table, create a new record
      if (userError) {
        // Create new user with default role USER
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              name: '',  // Will be updated later
              phone: formattedPhone,
              role: 'USER',
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        const user: User = {
          id: newUser.id,
          name: newUser.name || '',
          email: newUser.email || '',
          phone: newUser.phone || '',
          role: newUser.role as "USER" | "PARTNER" | "ADMIN",
          createdAt: newUser.created_at,
          profileImage: newUser.profile_image || '/placeholder.svg'
        };

        setCurrentUser(user);
        setUserRole(user.role);
        return user;
      }

      const user: User = {
        id: userData.id,
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role as "USER" | "PARTNER" | "ADMIN",
        createdAt: userData.created_at,
        profileImage: userData.profile_image || '/placeholder.svg'
      };

      setCurrentUser(user);
      setUserRole(user.role);
      
      toast.success(`Добро пожаловать${user.name ? ', ' + user.name : ''}!`);
      return user;
    } catch (error) {
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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setCurrentUser(null);
      setUserRole(null);
      toast.info('Вы вышли из системы');
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
      const formattedPhone = formatPhoneNumber(phone);
      
      // For registration, we first send OTP
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        throw error;
      }
      
      // Store name temporarily (will be saved after OTP verification)
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

  // Helper function to format phone to E.164
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Ensure it starts with country code (Russia)
    if (digits.startsWith('7') || digits.startsWith('8')) {
      return `+7${digits.substring(1)}`;
    } else if (!digits.startsWith('+')) {
      return `+7${digits}`;
    }
    
    return phone;
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
