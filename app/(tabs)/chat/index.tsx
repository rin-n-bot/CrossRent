import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  StatusBar,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { auth, db } from '../../../firebase';
import { COLORS, chatStyles, scale } from './styles';
import { ChatHeader } from './components/ChatHeader';
import { ChatSearchBar } from './components/ChatSearchBar';
import { ChatTabSelector } from './components/ChatTabSelector';
import { ChatListItem } from './components/ChatListItem';
import { ChatEmptyState } from './components/ChatEmptyState';


// Timestamps re-render
const TIMESTAMP_REFRESH_INTERVAL = 60000;

type ChatTab = 'listing' | 'renting';


// Converts Firestore seconds into a readable relative time label
const formatTimeLabel = (seconds: number): string => {
  const msgDate = new Date(seconds * 1000);
  const now = new Date();

  const isToday =
    msgDate.getDate() === now.getDate() &&
    msgDate.getMonth() === now.getMonth() &&
    msgDate.getFullYear() === now.getFullYear();

  if (isToday) {
    return msgDate.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  const diffDays = Math.floor((now.getTime() - msgDate.getTime()) / 86400000);
  if (diffDays < 7) return msgDate.toLocaleDateString(undefined, { weekday: 'short' });

  return msgDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(msgDate.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
};


// Removes empty or corrupted chat documents for the given user
const removeGhostChats = async (userId: string) => {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId)
    );
    const chatsSnap = await getDocs(chatsQuery);

    for (const chatDoc of chatsSnap.docs) {
      const data = chatDoc.data();
      const messagesSnap = await getDocs(collection(db, 'chats', chatDoc.id, 'messages'));

      const isCorrupted =
        !data.participants ||
        !data.updatedAt ||
        !data.lastMessage ||
        !data.lastSenderEmail ||
        messagesSnap.empty;

      if (isCorrupted) await deleteDoc(chatDoc.ref);
    }
  } catch (error) {
    console.error('Ghost chat cleanup error:', error);
  }
};


// Main chat screen component
export default function ChatScreen() {
  const router = useRouter();


  // State variables 
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ChatTab>('listing');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tick, setTick] = useState(0);

  const searchInputRef = useRef<TextInput | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;


  // Fade animation whenever the active tab changes
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);


  // Re-render timestamps every minute so relative labels stay accurate
  useEffect(() => {
    const interval = setInterval(
      () => setTick((prev) => prev + 1),
      TIMESTAMP_REFRESH_INTERVAL
    );
    return () => clearInterval(interval);
  }, []);


  // Set up Firestore listeners for the user's chats
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!user) {
        setChats([]);
        setIsLoading(false);
        return;
      }

      removeGhostChats(user.uid);


      // Listen to all chats where the user is a participant, enrich with display info, and sort by last update time
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid)
      );


      // Set up real-time listener for chat threads
      unsubscribeSnapshot = onSnapshot(chatsQuery, async (snapshot) => {
        const enriched = await Promise.all(
          snapshot.docs.map(async (d) => {
            const data = d.data();
            const otherId = data.participants.find((id: string) => id !== user.uid);
            let displayEmail = 'User';
            let displayPhoto = null;

            if (otherId) {
              const [profileSnap, userSnap] = await Promise.all([
                getDoc(doc(db, 'profiles', otherId)),
                getDoc(doc(db, 'users', otherId)),
              ]);
              if (userSnap.exists()) displayEmail = userSnap.data().email;
              if (profileSnap.exists()) displayPhoto = profileSnap.data().profilePicUrl || null;
            }

            const isMe = data.lastSenderEmail === user.email;
            const readBy: string[] = data.readBy ?? [];
            const isUnread = !!data.lastMessage && !isMe && !readBy.includes(user.uid);


            // Determine if current user is the owner (listing) or renter (renting)
            let role: ChatTab = 'renting';
            if (otherId) {
              const txSnap = await getDocs(
                query(
                  collection(db, 'transactions'),
                  where('ownerId', '==', user.uid),
                  where('renterId', '==', otherId)
                )
              );
              if (!txSnap.empty) role = 'listing';
            }


            // Return enriched chat data for rendering
            return {
              id: d.id,
              ...data,
              displayEmail,
              displayPhoto,
              updatedAtSeconds: data.updatedAt?.seconds ?? null,
              lastMsgDisplay: data.lastMessage
                ? `${isMe ? 'You: ' : ''}${data.lastMessage}`
                : 'No messages yet',
              isUnread,
              role,
            };
          })
        );

        enriched.sort((a, b) => (b.updatedAtSeconds ?? 0) - (a.updatedAtSeconds ?? 0));
        setChats(enriched);
        setIsLoading(false);
      });
    });


    // Clean up listeners on unmount
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);


  // Filter chats by active tab and search query
  const filteredChats = chats.filter((chat) => {
    if (chat.role !== activeTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      chat.displayEmail?.toLowerCase().includes(q) ||
      chat.lastMsgDisplay?.toLowerCase().includes(q)
    );
  });


  // Toggle a single chat in/out of the selection set
  const toggleChatSelection = (id: string) => {
    setSelectedChatIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };


  // Cancel selection mode and clear all selections
  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedChatIds([]);
  };


  // Permanently delete all selected chat threads and their messages
  const deleteSelectedChats = () => {
    if (selectedChatIds.length === 0) return;

    Alert.alert(
      'Delete Conversations',
      `This will permanently delete ${selectedChatIds.length} conversation(s).`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const id of selectedChatIds) {
                const messagesSnap = await getDocs(
                  collection(db, 'chats', id, 'messages')
                );
                await Promise.all(messagesSnap.docs.map((m) => deleteDoc(m.ref)));
                await deleteDoc(doc(db, 'chats', id));
              }
              cancelSelectionMode();
            } catch (error) {
              console.error('Deletion error:', error);
            }
          },
        },
      ]
    );
  };

  
  // Navigate to the conversation screen for a given chat
  const openChat = (chatId: string) => {
    router.push({
      pathname: '../../message',
      params: { chatId },
    });
  };


  // Main render
  return (
    <SafeAreaView
      style={[
        chatStyles.screenContainer,
        isSelectionMode && { backgroundColor: COLORS.primary },
      ]}
    >
      <StatusBar barStyle={isSelectionMode ? 'light-content' : 'dark-content'} />

      <ChatHeader
        isSelectionMode={isSelectionMode}
        selectedCount={selectedChatIds.length}
        onCancelSelection={cancelSelectionMode}
        onDeleteSelected={deleteSelectedChats}
        onEnterSelection={() => setIsSelectionMode(true)}
      />

      {!isSelectionMode && (
        <ChatSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          inputRef={searchInputRef}
        />
      )}

      {!isSelectionMode && (
        <ChatTabSelector activeTab={activeTab} onSelectTab={setActiveTab} />
      )}

      <Animated.View style={[chatStyles.listAnimatedWrapper, { opacity: fadeAnim }]}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (

          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.id}
            extraData={tick}
            contentContainerStyle={chatStyles.listContentPadding}
            renderItem={({ item }) => (

              <ChatListItem
                item={item}
                isSelected={selectedChatIds.includes(item.id)}
                isSelectionMode={isSelectionMode}
                timeLabel={
                  item.updatedAtSeconds ? formatTimeLabel(item.updatedAtSeconds) : ''
                }
                onLongPress={() => {
                  setIsSelectionMode(true);
                  toggleChatSelection(item.id);
                }}
                onPress={() =>
                  isSelectionMode ? toggleChatSelection(item.id) : openChat(item.id)
                }
              />

            )}
            ListEmptyComponent={<ChatEmptyState searchQuery={searchQuery} />}
          />
        )}

      </Animated.View>
    </SafeAreaView>
  );

};