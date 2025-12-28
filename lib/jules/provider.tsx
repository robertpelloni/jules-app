'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { JulesClient } from './client';

interface JulesContextType {
  client: JulesClient | null;
  isLoading: boolean;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const JulesContext = createContext<JulesContextType | undefined>(undefined);

export function JulesProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<JulesClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Check for API key in localStorage
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('jules_api_key');
      if (storedKey) {
        setClient(new JulesClient(storedKey));
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem('jules_api_key', key);
    setClient(new JulesClient(key));
  }, []);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem('jules_api_key');
    setClient(null);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <JulesContext.Provider value={{ client, isLoading, setApiKey, clearApiKey, refreshTrigger, triggerRefresh }}>
      {children}
    </JulesContext.Provider>
  );
}

export function useJules() {
  const context = useContext(JulesContext);
  if (context === undefined) {
    throw new Error('useJules must be used within a JulesProvider');
  }
  return context;
}
