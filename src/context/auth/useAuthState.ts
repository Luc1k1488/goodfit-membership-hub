
import { useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserSession } from "@/services/auth";

export const useAuthState = () => {
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

  // Setup auth state change listeners and session checks
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
            
            const user = await getCurrentUserSession();
            setCurrentUser(user.user);
            setUserRole(user.user?.role || null);
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
  }, [currentUser]);

  // Debug logging for auth state changes
  useEffect(() => {
    console.log("Auth state updated:", {
      isLoading,
      authInitialized,
      userExists: !!currentUser,
      role: userRole,
      userId: currentUser?.id
    });
  }, [isLoading, authInitialized, currentUser, userRole]);

  return {
    currentUser,
    setCurrentUser,
    isLoading,
    setIsLoading,
    userRole,
    setUserRole,
    authInitialized,
  };
};
