// Hook for fade animation when switching chat tabs
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export const useChatFadeAnimation = (activeTab: string) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Fade animation whenever the active tab changes
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeTab, fadeAnim]);

  return { fadeAnim };
};
