// Auth flow layout - shows loading spinner until auth checked
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { SplashTransition } from "../../components/SplashTransition";
import { useEffect, useState } from "react";

// Layout for authentication flow, shows loading spinner while checking auth state, then renders login screen if not authenticated
export default function AuthLayout() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(false);

  // When user logs in, trigger splash
  useEffect(() => {
    if (user) setShowSplash(true);
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#AF0B01" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
      </Stack>
      <SplashTransition visible={showSplash} />
    </>
  );
}