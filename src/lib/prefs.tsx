import * as Haptics from 'expo-haptics';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

type Prefs = {
  /** System Reduce Motion OR the in-app override. */
  reducedMotion: boolean;
  systemReducedMotion: boolean;
  forceReducedMotion: boolean;
  setForceReducedMotion: (v: boolean) => void;
  hapticsOn: boolean;
  setHapticsOn: (v: boolean) => void;
};

const Ctx = createContext<Prefs | null>(null);

/** View preferences. Kept in memory only — viewing a screen never writes. */
export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [systemReducedMotion, setSystem] = useState(false);
  const [forceReducedMotion, setForceReducedMotion] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(true);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => alive && setSystem(Boolean(v)))
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v: boolean) => setSystem(Boolean(v)));
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);

  const value = useMemo<Prefs>(
    () => ({
      reducedMotion: systemReducedMotion || forceReducedMotion,
      systemReducedMotion,
      forceReducedMotion,
      setForceReducedMotion,
      hapticsOn,
      setHapticsOn,
    }),
    [systemReducedMotion, forceReducedMotion, hapticsOn],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs(): Prefs {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePrefs must be used inside <PrefsProvider>');
  return v;
}

export function useReducedMotion(): boolean {
  return usePrefs().reducedMotion;
}

export type HapticKind = 'selection' | 'light' | 'success' | 'warning';

/**
 * Haptics: selection on chips, light on buttons, success once on send,
 * warning on errors — all behind the off switch. No-op on web.
 */
export function useHaptic() {
  const { hapticsOn } = usePrefs();
  return useCallback(
    (kind: HapticKind) => {
      if (!hapticsOn || Platform.OS === 'web') return;
      const run = async () => {
        switch (kind) {
          case 'selection':
            return Haptics.selectionAsync();
          case 'light':
            return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          case 'success':
            return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          case 'warning':
            return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      };
      run().catch(() => undefined);
    },
    [hapticsOn],
  );
}
