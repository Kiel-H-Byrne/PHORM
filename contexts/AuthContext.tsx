import { logoutUser, onAuthStateChanged } from "@/pages/api/auth/fbAuth";
import { removeAuthCookie, setupAuthCookieListener } from "@/util/authCookies";
import { User } from "firebase/auth";
import { useRouter } from "next/router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Listen for auth state changes
  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Set up cookie listener
    const cookieUnsubscribe = setupAuthCookieListener();

    // Cleanup subscriptions
    return () => {
      unsubscribe();
      cookieUnsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      await logoutUser();
      // Remove auth cookie
      removeAuthCookie();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
