
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

  // Create a timer for automatically setting authInitialized to true
  // if it hasn't been set for some reason
  useEffect(() => {
    console.log("Setting up auth initialization safety timer");
    const timer = setTimeout(() => {
      if (!authInitialized) {
        console.log("Forced authInitialized → true (timeout)");
        setAuthInitialized(true);
      }
    }, 5000); // After 5 seconds
    
    return () => clearTimeout(timer);
  }, [authInitialized]);

  const fetchCurrentUser = async () => {
    console.log("Fetching current user...");
    setIsLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        setCurrentUser(null);
        setUserRole(null);
        return;
      }
      
      if (!session) {
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
        
      if (userError) {
        console.error("Error fetching user data:", userError);
        setCurrentUser(null);
        setUserRole(null);
        return;
      }
      
      if (!userData) {
        console.error("No user data found for ID:", session.user.id);
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
      // Always set these states regardless of success/failure
      setIsLoading(false);
      setAuthInitialized(true);
      console.log("authInitialized → true");
    }
  };

  useEffect(() => {
    // Initial fetch of user data with timeout for safety
    const fetchTimeout = setTimeout(() => {
      setAuthInitialized(true);
      setIsLoading(false);
      console.log("Fetch timeout reached, forcing initialization");
    }, 10000);
    
    fetchCurrentUser().then(() => {
      clearTimeout(fetchTimeout);
    });

    // Auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session exists:", !!session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          fetchCurrentUser();
        } else {
          // No session even though we got a SIGNED_IN event
          console.warn("Received SIGNED_IN event but no session was provided");
          setIsLoading(false);
          setAuthInitialized(true);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setCurrentUser(null);
        setUserRole(null);
        setIsLoading(false);
        setAuthInitialized(true);
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
      clearTimeout(fetchTimeout);
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
        console.error("Login error:", error.message);
        throw error;
      }

      if (!data.user) {
        const noUserError = new Error('No user returned from authentication');
        console.error(noUserError.message);
        throw noUserError;
      }

      await fetchCurrentUser();
      
      // Check if the user has admin or partner role
      if (userRole !== 'ADMIN' && userRole !== 'PARTNER') {
        console.warn("User does not have admin or partner role:", userRole);
        await logout();
        throw new Error('У вас нет прав доступа к административной панели');
      }
      
      toast.success("Успешный вход");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Ошибка входа");
      throw error;
    } finally {
      setIsLoading(false);
      setAuthInitialized(true);
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
      setAuthInitialized(true);
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

  useEffect(() => {
    console.log("Admin Auth state updated:", {
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
