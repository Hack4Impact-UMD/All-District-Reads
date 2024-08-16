import {
  getAuth,
  onAuthStateChanged,
  signOut,
  type User,
  type IdTokenResult,
} from "@firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import app from "../../config/firebase";

interface Props {
  children: JSX.Element;
}

interface AuthContextType {
  user: User | null;
  token: IdTokenResult | null;
  loading: boolean;
  logout: () => Promise<void>; // Add logout function to the context type
}

// The AuthContext that other components may subscribe to.
const AuthContext = createContext<AuthContextType>(null!);

// Updates the AuthContext and re-renders children when the user changes.
// See onAuthStateChanged for what events trigger a change.
export const AuthProvider = ({ children }: Props): React.ReactElement => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<IdTokenResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Logout function to sign out the current user
  const logout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth); // Sign out the user using Firebase's signOut method
      setUser(null); // Reset user state after logout
      setToken(null); // Reset token state after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const providerProps = React.useMemo(() => {
    return { user, token, loading, logout };
  }, [user, token, loading]);

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      setUser(newUser);
      if (newUser != null) {
        newUser
          .getIdTokenResult()
          .then((newToken) => {
            setToken(newToken);
          })
          .catch(() => {
            setToken(null);
          });
      } else {
        setToken(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={providerProps}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
