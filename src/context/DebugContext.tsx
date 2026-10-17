import type { ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface DebugContextType {
  isDebugMode: boolean;
  toggleDebugMode: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [isDebugMode, setIsDebugMode] = useState(false);

  const toggleDebugMode = useCallback(() => {
    setIsDebugMode((prev) => !prev);
  }, []);

  const value = useMemo(() => ({ isDebugMode, toggleDebugMode }), [isDebugMode, toggleDebugMode]);

  return <DebugContext.Provider value={value}>{children}</DebugContext.Provider>;
}

export function useDebug(): DebugContextType {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}
