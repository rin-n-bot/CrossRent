import React, { useRef } from 'react';
import { Animated, View, Dimensions, StyleSheet, Text } from 'react-native';
import { Layout } from '../../../hooks/useSplashAnimation';

const { width } = Dimensions.get('window');
const scaleW = (size: number) => (width / 390) * size;

interface Props {
  logoX: Animated.Value;
  logoY: Animated.Value;
  spinnerOpacity: Animated.Value;
  bgOpacity: Animated.Value;
  spin: Animated.AnimatedInterpolation<string>;
  onLogoLayout: (layout: Layout) => void;
  visible: boolean;
}

export const SplashAnimation = ({
  logoX,
  logoY,
  spinnerOpacity,
  bgOpacity,
  spin,
  onLogoLayout,
  visible,
}: Props) => {
  const logoRef = useRef<View>(null);

  if (!visible) return null;

  const onLayout = () => {
    setTimeout(() => {

      logoRef.current?.measure((_x: number, _y: number, w: number, h: number, pageX: number, pageY: number) => {
        onLogoLayout({ x: pageX, y: pageY, w, h });
      });
    }, 50);
  };


  return (
    <Animated.View
      style={[styles.overlay, { opacity: bgOpacity }]}
      pointerEvents="none"
    >
      {/* Logo — centered by overlay, measured in screen-absolute coords */}
      <Animated.View
        ref={logoRef}
        onLayout={onLayout}
        style={[styles.logoWrapper, { transform: [{ translateX: logoX }, { translateY: logoY }] }]}
      >
        <Text style={styles.logoText}>
          Cross<Text style={{ color: '#AF0B01' }}>Rent</Text>
        </Text>
      </Animated.View>

      {/* Spinner — positioned relative to logo using margin, not hardcoded screen coords */}
      <Animated.View style={[styles.spinnerWrapper, { opacity: spinnerOpacity }]}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  logoWrapper: {
    zIndex: 101,
  },
  logoText: {
    fontSize: scaleW(18),
    fontWeight: '700',
    color: '#222D31',
    letterSpacing: -0.5,
  },
  // Spinner sits below the centered logo using absolute + top offset from center
  // Using marginTop on a sibling of the centered logo would shift the logo too,
  // so we use absolute positioning anchored to center via top: '50%'
  spinnerWrapper: {
    position: 'absolute',
    // Center of screen + logo half-height (~10) + gap (32)
    top: '50%',
    marginTop: 42,
    alignSelf: 'center',
    zIndex: 101,
  },
  spinner: {
    width: scaleW(28),
    height: scaleW(28),
    borderRadius: scaleW(14),
    borderWidth: 3,
    borderColor: '#e0e0e0',
    borderTopColor: '#AF0B01',
  },
});