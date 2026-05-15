import { Stack } from 'expo-router';
import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DrawerMenu } from '../components/ui/DrawerMenu';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { DrawerProvider } from '../context/DrawerContext';
import { db } from '../firebase';
import { StatusBar } from 'expo-status-bar';

function RootLayoutContent() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user) return;

    const cleanupGhostChats = async () => {
      try {
        const chatsQuery = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', user.uid)
        );
        const chatsSnap = await getDocs(chatsQuery);

        let deletedCount = 0;

        for (const chatDoc of chatsSnap.docs) {
          const chatData = chatDoc.data();
          const hasParticipants = chatData.participants && Array.isArray(chatData.participants);
          const hasUpdatedAt = chatData.updatedAt;
          const hasLastMessage = chatData.lastMessage;
          const hasSenderEmail = chatData.lastSenderEmail;

          const messagesSnap = await getDocs(collection(db, 'chats', chatDoc.id, 'messages'));

          const shouldDelete =
            !hasParticipants ||
            !hasUpdatedAt ||
            !hasLastMessage ||
            !hasSenderEmail ||
            messagesSnap.empty;

          if (shouldDelete) {
            await deleteDoc(chatDoc.ref);
            deletedCount++;
          }
        }

        if (deletedCount > 0) {
          console.log(`Cleaned up ${deletedCount} ghost chat document(s)`);
        }
      } catch (error) {
        console.error('Ghost chat cleanup error:', error);
      }
    };

    cleanupGhostChats();
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#AF0B01" />
      </View>
    );
  }

  return (
    <DrawerProvider>
      <View style={{ flex: 1 }}>
        {user && <DrawerMenu />}
        <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="add" options={{ presentation: 'modal' }} />
          <Stack.Screen name="profile" />
          <Stack.Screen name="my-listing" />
          <Stack.Screen name="message" />
          <Stack.Screen name="modal" />
        </Stack>
      </View>
    </DrawerProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" translucent={false} /> 
        <RootLayoutContent />
      </SafeAreaProvider>
    </AuthProvider>
  );
}