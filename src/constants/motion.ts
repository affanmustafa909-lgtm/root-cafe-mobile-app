import { useEffect, useState } from 'react';
import { AccessibilityInfo, Easing } from 'react-native';

export const easing = Easing.bezier(0.22, 1, 0.36, 1);

export const duration = {
  fast: 180,
  normal: 240,
  slow: 280,
  enter: 420,
} as const;

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduced,
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
