
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

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

  const login = async (email: string, password: string): Promise<User> => {
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
        throw new Error('No user returned from login');
      }

      // Get user data from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        throw userError;
      }

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
      
      toast.success(`Welcome back, ${user.name}!`);
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
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
      toast.info('You have been logged out');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<User> => {
    setIsLoading(true);
    
    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from registration');
      }
      
      // Insert new user into users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          { 
            id: data.user.id,
            name, 
            email,
            phone,
            role: 'USER',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (userError) {
        // If user creation in database fails, try to delete the auth user
        await supabase.auth.admin.deleteUser(data.user.id);
        throw userError;
      }
      
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
      
      toast.success('Registration successful! Welcome to GoodFit');
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
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
