import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Text, View } from "react-native";

type Props = {
  visible: boolean;
};

export function SplashTransition({ visible }: Props) {
  const [phase, setPhase] = useState<"modal" | "fullscreen">("modal");

  useEffect(() => {
    if (!visible) {
      setPhase("modal");
      return;
    }
    // After 1s of small modal, switch to full white screen
    const timer = setTimeout(() => setPhase("fullscreen"), 1000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  // Phase 1 — small modal box with spinner
  if (phase === "modal") {
    return (
      <Modal transparent animationType="fade" visible={visible}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 32, alignItems: "center", width: 80, height: 80, justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#AF0B01" />
          </View>
        </View>
      </Modal>
    );
  }

  // Phase 2 — full white screen with logo
  return (
    <Modal transparent={false} animationType="fade" visible={visible}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 28, fontWeight: "600", letterSpacing: -1 }}>
          Cross<Text style={{ color: "#AF0B01" }}>Rent</Text>
        </Text>
      </View>
    </Modal>
  );
}