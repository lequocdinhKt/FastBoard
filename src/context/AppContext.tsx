

import React, { createContext, useContext, ReactNode } from 'react';
import { useAppLogic } from '../hooks/useAppLogic';

type AppContextType = ReturnType<typeof useAppLogic>;

const AppContext = createContext<AppContextType | null>(null);


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const logic = useAppLogic();
  return (
    <AppContext.Provider value={logic}>
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
