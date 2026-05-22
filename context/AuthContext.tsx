// Authentication context managing Firebase auth state and user sessions
import { signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { auth } from "../firebase";

interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Firebase user to app-level user if email verified
const toAppUser = (firebaseUser: any): User | null => {
  if (!firebaseUser?.emailVerified) return null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    emailVerified: firebaseUser.emailVerified,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Refresh current user auth token and verified state
  const refreshUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      setUser(null);
      return null;
    }

    await firebaseUser.reload();
    await firebaseUser.getIdToken(true);

    const refreshedUser = toAppUser(auth.currentUser);
    setUser(refreshedUser);

    return refreshedUser;
  }, []);

  // Listen for auth state changes and verify email on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          return;
        }

        await firebaseUser.reload();
        await firebaseUser.getIdToken(true);

        setUser(toAppUser(auth.currentUser));
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
