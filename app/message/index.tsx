import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StatusBar,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { auth, db } from '../../firebase';
import { ConvoHeader } from './components/ConvoHeader';
import { MessageBubble } from './components/MessageBubble';
import { MessageInputBar } from './components/MessageInputBar';
import { TimeDivider } from './components/TimeDivider';
import { CONVO_COLORS, convoStyles } from './styles';

// Minimum gap between messages before a time divider is inserted (ms)
const MESSAGE_GROUP_GAP_MS = 60 * 1000;
const PHILIPPINES_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAY_LABELS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Each FlatList row is either a message bubble or a time divider
type MessageItem =
  | { type: 'message'; id: string; data: any; showAvatar: boolean }
  | { type: 'divider'; id: string; label: string };

// Returns true if two dates share the same calendar day
const isSameCalendarDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Formats a Date as a 12-hour clock string e.g. "10:30 PM"
const toClockString = (date: Date): string => {
  const h = date.getHours();
  const m = date.getMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  const displayM = m < 10 ? `0${m}` : `${m}`;
  return `${displayH}:${displayM} ${period}`;
};

// Converts a Firestore seconds value to a Philippines-local Date
const toPhilippinesDate = (seconds: number): Date => {
  const utc = new Date(seconds * 1000);
  return new Date(utc.getTime() + utc.getTimezoneOffset() * 60000 + PHILIPPINES_UTC_OFFSET_MS);
};

// Returns the current moment in Philippines Time
const nowInPhilippines = (): Date => {
  const now = new Date();
  return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + PHILIPPINES_UTC_OFFSET_MS);
};

// Converts a Firestore timestamp seconds value to a display label
const formatMessageTimestamp = (seconds: number): string => {
  if (!seconds) return 'Pending';
  const msgDate = toPhilippinesDate(seconds);
  const now = nowInPhilippines();
  const clock = toClockString(msgDate);

  if (isSameCalendarDay(msgDate, now)) return clock;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameCalendarDay(msgDate, yesterday)) return `Yesterday ${clock}`;

  const dayDiff = Math.floor((now.getTime() - msgDate.getTime()) / 86400000);
  if (dayDiff < 7) return `${WEEKDAY_LABELS[msgDate.getDay()]} ${clock}`;

  const month = MONTH_LABELS[msgDate.getMonth()];
  const day = msgDate.getDate();
  const year = msgDate.getFullYear();
  return `${month} ${day}${year !== now.getFullYear() ? `, ${year}` : ''} ${clock}`;
};

// Builds the enriched display list with dividers inserted between message groups
const buildMessageDisplayList = (rawMessages: any[]): MessageItem[] => {
  const items: MessageItem[] = [];

  for (let i = 0; i < rawMessages.length; i++) {
    const current = rawMessages[i];
    const prev = rawMessages[i - 1];
    const next = rawMessages[i + 1];

    // Show avatar only on the last bubble in a consecutive sender group
    const isLastInGroup = !prev || prev.senderId !== current.senderId;

    items.push({
      type: 'message',
      id: current.id,
      data: current,
      showAvatar: isLastInGroup,
    });

    // Insert a time divider when there is a significant gap to the next message
    if (next) {
      const currentMs = (current.createdAt?.seconds ?? 0) * 1000;
      const nextMs = (next.createdAt?.seconds ?? 0) * 1000;
      if (currentMs - nextMs >= MESSAGE_GROUP_GAP_MS && next.createdAt?.seconds) {
        items.push({
          type: 'divider',
          id: `divider-${next.id}`,
          label: formatMessageTimestamp(next.createdAt.seconds),
        });
      }
    } else if (current.createdAt?.seconds) {
      // Anchor divider at the very start of the conversation
      items.push({
        type: 'divider',
        id: `divider-start-${current.id}`,
        label: formatMessageTimestamp(current.createdAt.seconds),
      });
    }
  }

  return items;
};

export default function ConvoScreen() {
  const { chatId } = useLocalSearchParams();
  const router = useRouter();

  const [rawMessages, setRawMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [recipientEmail, setRecipientEmail] = useState<string | null>(null);
  const [recipientPhotoUrl, setRecipientPhotoUrl] = useState<string | null>(null);
  const [recipientUserId, setRecipientUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    auth.currentUser?.uid ?? null
  );
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Track keyboard height so the input bar lifts above it
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Load recipient profile and subscribe to the live message stream
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !chatId) return;

    setCurrentUserId(user.uid);

    const loadRecipientProfile = async () => {
      try {
        const chatSnap = await getDoc(doc(db, 'chats', chatId as string));
        if (!chatSnap.exists()) return;

        const chatData = chatSnap.data();
        const otherId = chatData.participants.find(
          (id: string) => id !== user.uid
        );

        if (otherId) {
          setRecipientUserId(otherId);
          const [userSnap, profileSnap] = await Promise.all([
            getDoc(doc(db, 'users', otherId)),
            getDoc(doc(db, 'profiles', otherId)),
          ]);
          if (userSnap.exists()) setRecipientEmail(userSnap.data().email);
          if (profileSnap.exists())
            setRecipientPhotoUrl(profileSnap.data().profilePicUrl || null);
        }

        // Mark chat as read for the current user
        const readBy: string[] = chatData.readBy ?? [];
        if (!readBy.includes(user.uid)) {
          await updateDoc(doc(db, 'chats', chatId as string), {
            readBy: arrayUnion(user.uid),
          });
        }
      } catch (error) {
        console.error('Failed to load recipient profile:', error);
      }
    };

    loadRecipientProfile();

    const messagesQuery = query(
      collection(db, 'chats', chatId as string, 'messages'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setRawMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setIsDataLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Send a new message and update the chat preview
  const sendMessage = async () => {
    const text = messageInput.trim();
    if (!text || !chatId) return;

    const sender = auth.currentUser;
    setMessageInput('');

    try {
      await addDoc(collection(db, 'chats', chatId as string, 'messages'), {
        text,
        senderId: sender?.uid,
        senderEmail: sender?.email,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'chats', chatId as string), {
        lastMessage: text,
        lastSenderEmail: sender?.email,
        updatedAt: serverTimestamp(),
        readBy: [sender?.uid],
      });
    } catch (error) {
      console.error('Message send error:', error);
    }
  };

  // Navigate to the recipient's profile page
  const openRecipientProfile = () => {
    if (recipientUserId) {
      router.push({ pathname: '/profile', params: { viewUserId: recipientUserId } });
    }
  };

  // Rebuild display list only when raw messages change
  const messageDisplayItems = useMemo(
    () => buildMessageDisplayList(rawMessages),
    [rawMessages]
  );

  // Render a single FlatList row — either a bubble or a divider
  const renderMessageItem = ({ item }: { item: MessageItem }) => {
    if (item.type === 'divider') return <TimeDivider label={item.label} />;
    return (
      <MessageBubble
        messageData={item.data}
        isSentByCurrentUser={item.data.senderId === currentUserId}
        showAvatar={item.showAvatar}
        recipientPhotoUrl={recipientPhotoUrl}
      />
    );
  };

  return (
    <View style={convoStyles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor={CONVO_COLORS.primary} />

      <ConvoHeader
        recipientEmail={recipientEmail}
        recipientPhotoUrl={recipientPhotoUrl}
        onBack={() => router.back()}
        onProfilePress={openRecipientProfile}
      />

      <View style={convoStyles.contentArea}>
        {isDataLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={CONVO_COLORS.primary} />
          </View>
        ) : (
          <>
            <FlatList
              data={messageDisplayItems}
              inverted
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 12 }}
              showsVerticalScrollIndicator={false}
              renderItem={renderMessageItem}
            />
            <MessageInputBar
              value={messageInput}
              onChangeText={setMessageInput}
              onSend={sendMessage}
              keyboardHeight={keyboardHeight}
            />
          </>
        )}
      </View>
    </View>
  );
}