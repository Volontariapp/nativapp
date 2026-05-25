import { createContext, use } from 'react';

export const AdminContext = createContext<{ setMode: (mode: 'menu' | 'app' | 'sandbox') => void }>({
  setMode: () => {},
});

export const useAdmin = (): { setMode: (mode: 'menu' | 'app' | 'sandbox') => void } =>
  use(AdminContext);
