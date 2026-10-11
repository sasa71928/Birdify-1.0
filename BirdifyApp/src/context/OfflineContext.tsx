import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const OfflineContext = createContext<boolean>(false);

export function useOffline(): boolean {
  return useContext(OfflineContext);
}

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOnline(!!state.isConnected);
    });
    NetInfo.fetch().then(state => setOnline(!!state.isConnected));
    return unsubscribe;
  }, []);

  return (
    <OfflineContext.Provider value={!online}>
      {children}
    </OfflineContext.Provider>
  );
}
