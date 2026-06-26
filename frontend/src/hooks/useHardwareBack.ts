import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

/**
 * Wires the Android hardware/gesture back button to `onBack`.
 * Return `true` from `onBack` if the press was handled (stay in the app),
 * or `false` to let the default behavior (exit app / previous screen) proceed.
 * No-op on iOS (no hardware back button) and web (browser back is separate).
 */
export function useHardwareBack(onBack: () => boolean, enabled = true): void {
  useEffect(() => {
    if (!enabled || Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => subscription.remove();
  }, [onBack, enabled]);
}
