import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Android emulators often report isInternetReachable=false even when
      // Wi‑Fi is up and the API is reachable. Only treat a definite disconnect
      // as offline so the banner does not block browsing.
      setIsOffline(state.isConnected === false);
    });
    return unsubscribe;
  }, []);

  return { isOffline };
}
