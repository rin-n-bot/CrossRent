import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

export interface Layout {
  x: number;   // screen-absolute pageX
  y: number;   // screen-absolute pageY
  w: number;
  h: number;
}

export type SplashPhase = 'splash' | 'spinning' | 'animating' | 'done';

export const useSplashAnimation = () => {
  const [phase, setPhase]                       = useState<SplashPhase>('splash');
  const [splashLogoLayout, setSplashLogoLayout] = useState<Layout | null>(null);
  const [targetLayout, setTargetLayout]         = useState<Layout | null>(null);

  const logoX          = useRef(new Animated.Value(0));
  const logoY          = useRef(new Animated.Value(0));
  const spinnerOpacity = useRef(new Animated.Value(0));
  const spinnerRot     = useRef(new Animated.Value(0));
  const contentOpacity = useRef(new Animated.Value(0));
  const bgOpacity      = useRef(new Animated.Value(1));

  const spinLoop        = useRef<Animated.CompositeAnimation | null>(null);
  const sequenceStarted = useRef(false);

  useEffect(() => {
    if (!splashLogoLayout || !targetLayout || sequenceStarted.current) return;
    sequenceStarted.current = true;

    // Both layouts are screen-absolute (via measure/pageX/pageY) — delta is always correct
    const dx = targetLayout.x - splashLogoLayout.x;
    const dy = targetLayout.y - splashLogoLayout.y;

    const showSpinner = () => {
      setPhase('spinning');
      Animated.timing(spinnerOpacity.current, {
        toValue: 1, duration: 350, useNativeDriver: true,
      }).start();
      spinLoop.current = Animated.loop(
        Animated.timing(spinnerRot.current, {
          toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true,
        })
      );
      spinLoop.current.start();
    };

    const hideSpinner = () => {
      Animated.timing(spinnerOpacity.current, {
        toValue: 0, duration: 400, useNativeDriver: true,
      }).start(() => spinLoop.current?.stop());
    };

    const flyToTarget = () => {
      setPhase('animating');
      Animated.parallel([
        Animated.timing(logoX.current, {
          toValue: dx, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
        Animated.timing(logoY.current, {
          toValue: dy, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
      ]).start();
    };

    const revealContent = () => {
      Animated.parallel([
        Animated.timing(contentOpacity.current, {
          toValue: 1, duration: 400, useNativeDriver: true,
        }),
        Animated.timing(bgOpacity.current, {
          toValue: 0, duration: 400, useNativeDriver: true,
        }),
      ]).start(() => setPhase('done'));
    };

    const t1 = setTimeout(showSpinner,    800);
    const t2 = setTimeout(hideSpinner,   2200);
    const t3 = setTimeout(flyToTarget,   2800);
    const t4 = setTimeout(revealContent, 3400);

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
      spinLoop.current?.stop();
    };
  }, [splashLogoLayout, targetLayout]);

  const spin = spinnerRot.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return {
    phase,
    logoX: logoX.current,
    logoY: logoY.current,
    spinnerOpacity: spinnerOpacity.current,
    contentOpacity: contentOpacity.current,
    bgOpacity: bgOpacity.current,
    spin,
    setSplashLogoLayout,
    setTargetLayout,
  };
};