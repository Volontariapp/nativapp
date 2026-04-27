// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from "react";

type AuthContextType = {
  isLoading: boolean;
  userToken: string | null;
  signIn: () => void;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  userToken: null,
  signIn: () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element  => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const signIn = () :void => {
    setUserToken("fake-token");
  };

  const signOut = () :void => {
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ isLoading, userToken, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
