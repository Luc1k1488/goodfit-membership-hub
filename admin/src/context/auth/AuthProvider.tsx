
import { useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log("No active session found");
        setCurrentUser(null);
        setUserRole(null);
        return;
      }
      
      console.log("Session found, getting user data");
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (userError || !userData) {
        console.error("Error fetching user data:", userError);
        setCurrentUser(null);
        setUserRole(null);
        return;
      }
      
      const user: User = {
        id: userData.id,
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: (userData.role || 'USER') as "USER" | "PARTNER" | "ADMIN",
        createdAt: userData.created_at,
        profileImage: userData.profile_image || '/placeholder.svg',
        subscriptionId: userData.subscription_id || null
      };
      
      setCurrentUser(user);
      setUserRole(user.role);
      console.log("User loaded:", user);
    } catch (error) {
      console.error("Error in fetchCurrentUser:", error);
      setCurrentUser(null);
      setUserRole(null);
    } finally {
      setIsLoading(false);
      setAuthInitialized(true);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    // Auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session exists:", !!session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          fetchCurrentUser();
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setCurrentUser(null);
        setUserRole(null);
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from authentication');
      }

      await fetchCurrentUser();
      toast.success("Успешный вход");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Ошибка входа");
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
      toast.info("Вы вышли из системы");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Ошибка при выходе");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    isLoading,
    authInitialized,
    userRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
