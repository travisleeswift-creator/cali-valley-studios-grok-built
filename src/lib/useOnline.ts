import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/** True unless the device is known to be offline. */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(
    () =>
      NetInfo.addEventListener((s) => {
        setOnline(s.isConnected !== false && s.isInternetReachable !== false);
      }),
    [],
  );
  return online;
}
