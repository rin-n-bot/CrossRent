// Greeting section with user avatar and welcome message
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { GREETING_QUOTES } from "../../../../constants/quotes";
import { scale, styles } from "../styles";

// Visual and logic constants for the greeting section
const ACCENT_RED = "#AF0B01";
const QUOTE_INTERVAL = 10000;
const ANIMATION_SPEED = 500;

// Main component
export function GreetingSection() {
  // Local state for quote index and toggle state for full meaning display
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showFullMeaning, setShowFullMeaning] = useState(false);

  // Animation refs for quote fading and arrow rotation
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const arrowRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: ANIMATION_SPEED,
        useNativeDriver: true,
      }).start(() => {
        setQuoteIndex((prev) => (prev + 1) % GREETING_QUOTES.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_SPEED,
          useNativeDriver: true,
        }).start();
      });
    }, QUOTE_INTERVAL);
    return () => clearInterval(timer);
  }, [fadeAnim]);

  // Toggle function for showing full meaning of HCDC
  const toggleFullMeaning = () => {
    const toValue = showFullMeaning ? 0 : 1;
    Animated.spring(arrowRotate, {
      toValue,
      useNativeDriver: true,
      friction: 8,
    }).start();
    setShowFullMeaning((prev) => !prev);
  };

  // Arrow rotation animation interpolation
  const arrowRotation = arrowRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Main render
  return (
    <View style={styles.greetingContainer}>
      <TouchableOpacity
        onPress={toggleFullMeaning}
        activeOpacity={0.7}
        style={styles.hcdcToggle}
      >
        <Text
          style={[styles.hcdcText, showFullMeaning && { color: ACCENT_RED }]}
        >
          {showFullMeaning ? "Holy Cross of Davao College" : "HCDC"}
        </Text>

        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          <Ionicons
            name="chevron-down"
            size={scale(16)}
            color={showFullMeaning ? ACCENT_RED : "#0038A8"}
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.Text
        style={[styles.greetingText, { opacity: fadeAnim, letterSpacing: -1 }]}
      >
        {GREETING_QUOTES[quoteIndex]}
      </Animated.Text>
    </View>
  );
}
