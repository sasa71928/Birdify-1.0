import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const OfflineContext = createContext<boolean>(false);

export function useOffline(): boolean {
  return useContext(OfflineContext);
}

const OFFLINE_DEBOUNCE_MS = 1500;

function isNetworkOnline(state: NetInfoState): boolean {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  // Inicializar como conectado hasta que NetInfo confirme explícitamente desconexión sostenida (AUD-014)
  const [online, setOnline] = useState(true);
  const offlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const applyNetworkState = (state: NetInfoState, immediate = false) => {
      const nextOnline = isNetworkOnline(state);

      if (nextOnline) {
        if (offlineTimerRef.current) {
          clearTimeout(offlineTimerRef.current);
          offlineTimerRef.current = null;
        }
        setOnline(true);
        return;
      }

      if (immediate) {
        setOnline(false);
        return;
      }

      if (!offlineTimerRef.current) {
        offlineTimerRef.current = setTimeout(() => {
          offlineTimerRef.current = null;
          setOnline(false);
        }, OFFLINE_DEBOUNCE_MS);
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      applyNetworkState(state, false);
    });

    NetInfo.fetch().then((state) => applyNetworkState(state, true));

    return () => {
      if (offlineTimerRef.current) {
        clearTimeout(offlineTimerRef.current);
      }
      unsubscribe();
    };
  }, []);

  return (
    <OfflineContext.Provider value={!online}>
      {children}
    </OfflineContext.Provider>
  );
}
