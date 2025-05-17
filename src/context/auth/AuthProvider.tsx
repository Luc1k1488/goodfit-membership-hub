
import { useState, useEffect, ReactNode } from "react";
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
import AuthContext from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"USER" | "PARTNER" | "ADMIN" | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  const fetchCurrentUser = async () => {
    console.log("Fetching current user...");
    setIsLoading(true);
    try {
      const { session, user } = await getCurrentUserSession();
      
      if (session && user) {
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
      // Always set these states regardless of success/failure
      setIsLoading(false);
      setAuthInitialized(true);
    }
  };

  useEffect(() => {
    // Initial fetch of user data
    fetchCurrentUser();

    // Session expiry check
    const sessionCheckInterval = setInterval(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session && currentUser) {
          console.log("Session expired, logging out");
          setCurrentUser(null);
          setUserRole(null);
          // Don't reset authInitialized here since we've already initialized
        }
      });
    }, 60000);

    // Auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session exists:", !!session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          setIsLoading(true);
          try {
            const userData: Record<string, string> = {};
            if (session.user.email) userData.email = session.user.email;
            if (session.user.phone) userData.phone = session.user.phone;
            
            const user = await getUserOrCreate(session.user.id, userData);
            setCurrentUser(user);
            setUserRole(user.role);
            console.log("User data updated after auth change:", user);
          } catch (error) {
            console.error("Error during auth state change:", error);
            // Don't reset user here if there's an error, only if explicitly signed out
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
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
      clearInterval(sessionCheckInterval);
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
    try {
      const supabaseUser = await verifyOTPCode(contact, otp);
      const userData: Record<string, string> = {};
      if (isEmail(contact)) userData.email = contact;
      else userData.phone = formatPhoneNumber(contact);
      const pendingName = localStorage.getItem('pendingRegistrationName');
      if (pendingName) {
        userData.name = pendingName;
        localStorage.removeItem('pendingRegistrationName');
      }
      const user = await getUserOrCreate(supabaseUser.id, userData);
      setCurrentUser(user);
      setUserRole(user.role);
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
      await sendOTP(contact);
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
