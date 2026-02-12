import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  user_id: string;
  username: string;
  profile_picture_url: string | null;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  start_of_day_hour: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, options?: { username?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select(
        "user_id, username, profile_picture_url, total_xp, current_level, current_streak, longest_streak, start_of_day_hour"
      )
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Check remember-me expiry on load
    const checkRememberMe = () => {
      const loginTimestamp = localStorage.getItem("studytracker_login_timestamp");
      if (loginTimestamp) {
        const elapsed = Date.now() - parseInt(loginTimestamp, 10);
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        if (elapsed > threeDaysMs) {
          localStorage.removeItem("studytracker_login_timestamp");
          supabase.auth.signOut();
          return true; // expired
        }
      }
      return false;
    };

    // Set up auth state listener BEFORE checking session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        // Check remember-me expiry on auth state change
        if (checkRememberMe()) {
          setLoading(false);
          return;
        }
        // Use setTimeout to avoid Supabase client deadlock
        setTimeout(() => fetchProfile(currentSession.user.id), 0);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (existingSession?.user && checkRememberMe()) {
        setLoading(false);
        return;
      }

      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, options?: { username?: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          username: options?.username,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    localStorage.removeItem("studytracker_login_timestamp");
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
