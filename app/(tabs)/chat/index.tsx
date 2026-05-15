import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
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
  Dimensions,
  FlatList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth, db } from '../../../firebase';
import { scale, transStyles as styles } from '../transactions/styles';
import { chatStyles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';


// Set global layout and color constants
const { width } = Dimensions.get('window');
const COLOR_PRIMARY = '#AF0B01';
const COLOR_BG = '#F5F5F5';
const COLOR_DARK = '#222D31';
const COLOR_MUTED = '#9CA3AF';
const COLOR_SURFACE = '#FFFFFF';
const COLOR_SELECTION_BG = '#FFF4F4';
const COLOR_ICON_INACTIVE = '#cfd4da';


// Logic for generating human-readable timestamps
const formatTimeLabel = (seconds: number): string => {
  const msgDate = new Date(seconds * 1000);
  const now = new Date();

  const isToday =
    msgDate.getDate() === now.getDate() &&
    msgDate.getMonth() === now.getMonth() &&
    msgDate.getFullYear() === now.getFullYear();

  if (isToday) {
    return msgDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const diffDays = Math.floor((now.getTime() - msgDate.getTime()) / 86400000);
  if (diffDays < 7) return msgDate.toLocaleDateString(undefined, { weekday: 'short' });

  const sameYear = msgDate.getFullYear() === now.getFullYear();
  return msgDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
};


// Cleanup task to remove empty or corrupted chat documents
const cleanupGhostChatsOnChatLoad = async (userId: string) => {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId)
    );
    const chatsSnap = await getDocs(chatsQuery);

    for (const chatDoc of chatsSnap.docs) {
      const chatData = chatDoc.data();
      const messagesSnap = await getDocs(collection(db, 'chats', chatDoc.id, 'messages'));

      const isCorrupted =
        !chatData.participants ||
        !chatData.updatedAt ||
        !chatData.lastMessage ||
        !chatData.lastSenderEmail ||
        messagesSnap.empty;

      if (isCorrupted) {
        await deleteDoc(chatDoc.ref);
      }
    }
  } catch (error) {
    console.error('Cleanup Error:', error);
  }
};

type ChatTab = 'listing' | 'renting';

export default function ChatScreen() {
  const router = useRouter();


  // Screen state management
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatTab, setChatTab] = useState<ChatTab>('listing');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tick, setTick] = useState(0);


  // Animation and focus references
  const searchInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;


  // Handle tab transition animations
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [chatTab]);


  // Keep timestamps fresh by re-rendering every minute
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);


  // Fetch and enrich chat data with profile information
useEffect(() => {
  let unsubscribeSnapshot: (() => void) | null = null;

  const unsubscribeAuth = auth.onAuthStateChanged((user) => {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = null;
    }

    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    cleanupGhostChatsOnChatLoad(user.uid);

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    unsubscribeSnapshot = onSnapshot(q, async (snapshot) => {
      const enriched = await Promise.all(
        snapshot.docs.map(async (d) => {
          const data = d.data();
          const otherId = data.participants.find((id: string) => id !== user.uid);
          let name = 'User', photo = null;

          if (otherId) {
            const [profileSnap, uSnap] = await Promise.all([
              getDoc(doc(db, 'profiles', otherId)),
              getDoc(doc(db, 'users', otherId)),
            ]);
            if (uSnap.exists()) name = uSnap.data().email;
            if (profileSnap.exists()) photo = profileSnap.data().profilePicUrl || null;
          }

          const isMe = data.lastSenderEmail === user.email;
          const readBy: string[] = data.readBy ?? [];
          const isUnread = !!data.lastMessage && !isMe && !readBy.includes(user.uid);

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

          return {
            id: d.id,
            ...data,
            displayEmail: name,
            displayPhoto: photo,
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
      setLoading(false);
    });
  });

  return () => {
    unsubscribeAuth();
    if (unsubscribeSnapshot) unsubscribeSnapshot();
  };
}, []);


  // Filter logic for search and tab selection
  const filteredChats = chats.filter((c) => {
    const matchesTab = c.role === chatTab;
    if (!matchesTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.displayEmail?.toLowerCase().includes(q) ||
      c.lastMsgDisplay?.toLowerCase().includes(q)
    );
  });


  // Logic for selecting multiple chats for bulk actions
  const toggleChatSelection = (id: string) => {
    setSelectedChatIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };


  // Perform permanent deletion of selected conversations
  const handleDeleteSelected = () => {
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
                const messagesRef = collection(db, 'chats', id, 'messages');
                const messagesSnap = await getDocs(messagesRef);
                const deletePromises = messagesSnap.docs.map(mDoc => deleteDoc(mDoc.ref));
                await Promise.all(deletePromises);
                await deleteDoc(doc(db, 'chats', id));
              }
              setIsSelectionMode(false);
              setSelectedChatIds([]);
            } catch (error) {
              console.error("Deletion Error:", error);
            }
          },
        },
      ]
    );
  };


  // Header navigation logic
  const renderHeader = () => (
    <View style={[styles.topNav, { backgroundColor: COLOR_BG }, isSelectionMode && { backgroundColor: COLOR_PRIMARY }]}>
      {isSelectionMode && (
        <TouchableOpacity
          onPress={() => { setIsSelectionMode(false); setSelectedChatIds([]); }}
          style={{ marginRight: scale(12) }}
        >
          <Ionicons name="close-outline" size={scale(26)} color={COLOR_SURFACE} />
        </TouchableOpacity>
      )}
      <Text style={[styles.logoMini, { flex: 1, fontWeight: 700 }, isSelectionMode && { color: COLOR_SURFACE }]}>
        {isSelectionMode ? `${selectedChatIds.length} Selected` : 'Messages'}
      </Text>
      {isSelectionMode ? (
        <TouchableOpacity onPress={handleDeleteSelected}>
          <Ionicons name="trash-outline" size={scale(24)} color={COLOR_SURFACE} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setIsSelectionMode(true)}>
          <Text style={{ fontWeight: '700', color: COLOR_PRIMARY }}>Select</Text>
        </TouchableOpacity>
      )}
    </View>
  );


  // Search input UI
  const renderSearchBar = () => !isSelectionMode && (
    <View style={{ paddingHorizontal: scale(16), paddingBottom: scale(10), backgroundColor: COLOR_BG }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d9dfe665',
        borderRadius: 20,
        paddingHorizontal: scale(10),
        height: scale(44),
      }}>
        <Ionicons name="search-outline" size={16} color={COLOR_DARK} style={{ marginRight: 6 }} />
        <TextInput
          ref={searchInputRef}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search messages..."
          placeholderTextColor={COLOR_MUTED}
          style={{ flex: 1, fontSize: scale(14), color: COLOR_DARK }}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={COLOR_MUTED} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );


  // Filter tabs UI
  const renderTabs = () => !isSelectionMode && (
    <View style={{ flexDirection: 'row', paddingHorizontal: scale(10), backgroundColor: COLOR_BG }}>
      {(['listing', 'renting'] as ChatTab[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setChatTab(tab)}
          style={{
            flex: 1,
            paddingVertical: scale(12),
            borderBottomWidth: 2,
            borderBottomColor: chatTab === tab ? COLOR_PRIMARY : 'transparent',
          }}
        >
          <Text style={{
            textAlign: 'center',
            fontSize: scale(13),
            fontWeight: '700',
            color: chatTab === tab ? COLOR_PRIMARY : COLOR_MUTED,
          }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );


  // Individual chat row UI
  const renderChatItem = ({ item }: { item: any }) => {
    const isSelected = selectedChatIds.includes(item.id);
    const timeLabel = item.updatedAtSeconds ? formatTimeLabel(item.updatedAtSeconds) : '';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onLongPress={() => {
          setIsSelectionMode(true);
          toggleChatSelection(item.id);
        }}
        onPress={() =>
          isSelectionMode
            ? toggleChatSelection(item.id)
            : router.push({ pathname: '../../message/convo', params: { chatId: item.id } })
        }
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 15,
          backgroundColor: isSelected ? COLOR_SELECTION_BG : COLOR_BG,
          borderRadius: 12,
          marginBottom: 10,
        }}
      >

        {/* User avatar with unread indicator */}
        <View style={{ marginRight: 15 }}>
          {item.displayPhoto ? (
            <Image
              source={{ uri: item.displayPhoto }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />
          ) : (
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: COLOR_DARK,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: COLOR_SURFACE, fontWeight: '700', fontSize: 16 }}>
                {item.displayEmail?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {item.isUnread && (
            <View style={{
              position: 'absolute',
              bottom: 1,
              right: 1,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: COLOR_PRIMARY,
              borderWidth: 2,
              borderColor: COLOR_SURFACE,
            }} />
          )}
        </View>

        {/* Message preview and metadata */}
        <View style={[chatStyles.chatInfo, { overflow: 'hidden' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              style={[
                chatStyles.userName,
                { flex: 1, marginRight: scale(8) },
                item.isUnread && { color: '#111', fontWeight: '800' },
              ]}
              numberOfLines={1}
            >
              {item.displayEmail}
            </Text>
            {timeLabel && (
              <Text style={{
                fontSize: scale(13),
                fontWeight: '600',
                color: item.isUnread ? COLOR_DARK : COLOR_MUTED,
              }}>
                {timeLabel}
              </Text>
            )}
          </View>
          <Text
            style={[
              chatStyles.lastMsg,
              item.isUnread && { color: COLOR_DARK, fontWeight: '600' },
            ]}
            numberOfLines={1}
          >
            {item.lastMsgDisplay}
          </Text>
        </View>

        {/* Multi-selection toggle icons */}
        {isSelectionMode && (
          <Ionicons
            name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={COLOR_PRIMARY}
            style={{ marginLeft: scale(8) }}
          />
        )}
      </TouchableOpacity>
    );
  };


  // State UI for empty results
  const renderEmptyState = () => (
    <View style={{ alignItems: 'center', marginTop: scale(195) }}>
      <Ionicons 
        name={searchQuery.trim() ? "search-outline" : "chatbubbles-outline"} 
        size={scale(70)} 
        color={COLOR_ICON_INACTIVE} 
      />
      <Text style={[styles.noResultsText, { marginTop: scale(10) }]}>
        {searchQuery.trim() ? `No results for "${searchQuery}"` : "No Messages Yet"}
      </Text>
    </View>
  );

  
  // Main UI layout
  return (
    <SafeAreaView style={[styles.container, { flex: 1,backgroundColor: COLOR_BG }, isSelectionMode && { backgroundColor: COLOR_PRIMARY }]}>
      <StatusBar barStyle={isSelectionMode ? 'light-content' : 'dark-content'} />

      {renderHeader()}
      {renderSearchBar()}
      {renderTabs()}

      <Animated.View style={{ flex: 1, backgroundColor: COLOR_BG, opacity: fadeAnim }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={COLOR_PRIMARY} />
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.id}
            extraData={tick}
            contentContainerStyle={{ padding: scale(20) }}
            renderItem={renderChatItem}
            ListEmptyComponent={renderEmptyState()}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}