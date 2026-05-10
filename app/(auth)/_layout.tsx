import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading || user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#AF0B01" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" />
    </Stack>
  );
}