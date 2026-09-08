import type { ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';

interface DebugContextType {
  isDebugMode: boolean;
  toggleDebugMode: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [isDebugMode, setIsDebugMode] = useState(false);

  const toggleDebugMode = () => {
    setIsDebugMode((prev) => !prev);
  };

  return (
    <DebugContext.Provider value={{ isDebugMode, toggleDebugMode }}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug(): DebugContextType {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}
