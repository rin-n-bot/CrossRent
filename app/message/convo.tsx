import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { chatStyles } from '../(tabs)/chat/styles';
import { auth, db } from '../../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';


// Constants 
const MESSAGE_GROUPING_THRESHOLD_MS = 60 * 1000;
const PHILIPPINES_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;
const BUBBLE_MIN_WIDTH = 60;
const BUBBLE_MAX_WIDTH = Dimensions.get('window').width * 0.75;
const BUBBLE_AVATAR_SIZE = 28;
const HEADER_AVATAR_SIZE = 34;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


// Types 
// Each item in the FlatList is either a rendered message bubble or a time divider label
type MessageItem =
  | { type: 'message'; id: string; data: any; showAvatar: boolean }
  | { type: 'divider'; id: string; label: string };


// Pure Date Helpers 
// Check whether two Date objects land on the exact same calendar day
const isSameCalendarDay = (dateA: Date, dateB: Date): boolean =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();


// Build a 12-hour clock string such as "10:30 PM" from a given Date
const buildClockString = (date: Date): string => {
  const rawHour = date.getHours();
  const rawMinutes = date.getMinutes();
  const period = rawHour >= 12 ? 'PM' : 'AM';
  const displayHour = rawHour % 12 || 12;
  const displayMinutes = rawMinutes < 10 ? `0${rawMinutes}` : `${rawMinutes}`;
  return `${displayHour}:${displayMinutes} ${period}`;
};


// Convert a Firestore seconds value into a Philippines-local Date object
const toPhilippinesDate = (seconds: number): Date => {
  const utcDate = new Date(seconds * 1000);
  const localOffsetMs = utcDate.getTimezoneOffset() * 60000;
  return new Date(utcDate.getTime() + localOffsetMs + PHILIPPINES_UTC_OFFSET_MS);
};


// Get the current moment adjusted to Philippines Time
const getNowInPhilippines = (): Date => {
  const now = new Date();
  const localOffsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() + localOffsetMs + PHILIPPINES_UTC_OFFSET_MS);
};


// Firestore convo/message timestamp 
const formatMessageTimestamp = (seconds: number): string => {
  if (!seconds) return 'Pending';

  const messageDate = toPhilippinesDate(seconds);
  const nowDate = getNowInPhilippines();
  const clockString = buildClockString(messageDate);

  if (isSameCalendarDay(messageDate, nowDate)) return clockString;

  const yesterday = new Date(nowDate);
  yesterday.setDate(nowDate.getDate() - 1);
  if (isSameCalendarDay(messageDate, yesterday)) return `Yesterday ${clockString}`;

  const dayDifference = Math.floor(
    (nowDate.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (dayDifference < 7) return `${WEEKDAY_LABELS[messageDate.getDay()]} ${clockString}`;

  // Older — show the month, day, optional year, and time
  const month = MONTH_LABELS[messageDate.getMonth()];
  const day = messageDate.getDate();
  const year = messageDate.getFullYear();
  const isCurrentYear = year === nowDate.getFullYear();
  return `${month} ${day}${isCurrentYear ? '' : `, ${year}`} ${clockString}`;
};


// Message List Builder 
const buildMessageDisplayList = (rawMessages: any[]): MessageItem[] => {
  const displayItems: MessageItem[] = [];

  for (let index = 0; index < rawMessages.length; index++) {
    const currentMessage = rawMessages[index];

    // In an inverted list the visual predecessor is the next array element
    const visuallyPreviousMessage = rawMessages[index - 1];
    const visuallyNextMessage = rawMessages[index + 1];

    // Only show the avatar on the last consecutive bubble from the same sender
    const isLastInSenderGroup =
      !visuallyPreviousMessage ||
      visuallyPreviousMessage.senderId !== currentMessage.senderId;

    displayItems.push({
      type: 'message',
      id: currentMessage.id,
      data: currentMessage,
      showAvatar: isLastInSenderGroup,
    });

    // Insert a time divider when there is a significant gap to the next message
    if (visuallyNextMessage) {
      const currentMs = (currentMessage.createdAt?.seconds ?? 0) * 1000;
      const nextMs = (visuallyNextMessage.createdAt?.seconds ?? 0) * 1000;
      const gapMs = currentMs - nextMs;

      if (gapMs >= MESSAGE_GROUPING_THRESHOLD_MS && visuallyNextMessage.createdAt?.seconds) {
        displayItems.push({
          type: 'divider',
          id: `divider-${visuallyNextMessage.id}`,
          label: formatMessageTimestamp(visuallyNextMessage.createdAt.seconds),
        });
      }
    } else if (currentMessage.createdAt?.seconds) {
      // Always show a timestamp anchor at the very start of the conversation
      displayItems.push({
        type: 'divider',
        id: `divider-start-${currentMessage.id}`,
        label: formatMessageTimestamp(currentMessage.createdAt.seconds),
      });
    }
  }

  return displayItems;
};


// Sub-components 
// Circular avatar that shows a photo when available, or a single initial letter as fallback
const AvatarCircle = ({
  photoUrl,
  fallbackLetter,
  size,
}: {
  photoUrl: string | null;
  fallbackLetter: string;
  size: number;
}) => (

  // Clip the image and centre the fallback letter inside a fixed circle
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: '#222D31',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible',
    }}
  >
    {photoUrl ? (
      // Profile photo when one has been set
      <Image
        source={{ uri: photoUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    ) : (
      // First letter of the email address as the fallback avatar
      <Text style={{ color: '#FFF', fontWeight: '800', fontSize: size * 0.4 }}>
        {fallbackLetter}
      </Text>
    )}
  </View>
);


// Pill-shaped timestamp label that separates message groups
const TimeDivider = ({ label }: { label: string }) => (
  // Centred horizontally with vertical breathing room above and below
  <View style={{ alignItems: 'center', marginVertical: 15 }}>
    <Text
      style={{
        fontSize: 11,
        fontWeight: '600',
        color: '#9CA3AF',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {label}
    </Text>
  </View>
);


// A single message bubble, handles both sent and received layouts
const MessageBubble = ({
  messageData,
  isSentByCurrentUser,
  showAvatar,
  recipientPhotoUrl,
}: {
  messageData: any;
  isSentByCurrentUser: boolean;
  showAvatar: boolean;
  recipientPhotoUrl: string | null;
}) => {

  const receivedShadow =
    Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        }
      : { elevation: 0 };

  // Fallback
  const senderInitial = (messageData.senderEmail as string)?.charAt(0).toUpperCase() ?? '?';


  return (
    // Row flips direction based on who sent the message
    <View
  style={{
    flexDirection: 'row',
    justifyContent: isSentByCurrentUser ? 'flex-end' : 'flex-start',
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 12,
  }}
>
      {/* Avatar column — only present on received messages */}
      {!isSentByCurrentUser && (

        // The view is always rendered so spacing stays consistent; opacity hides it mid-group
        <View
          style={{
            width: BUBBLE_AVATAR_SIZE,
            height: BUBBLE_AVATAR_SIZE,
            marginRight: 6,
            opacity: showAvatar ? 1 : 0,
          }}
        >
          {showAvatar && (
            <AvatarCircle
              photoUrl={recipientPhotoUrl}
              fallbackLetter={senderInitial}
              size={BUBBLE_AVATAR_SIZE}
            />
          )}
        </View>
      )}

      {/* Bubble shell — explicit pixel width is reliable on all Android devices */}
      <View
        style={{
          maxWidth: BUBBLE_MAX_WIDTH,
          minWidth: BUBBLE_MIN_WIDTH,
          paddingLeft: 14,
          paddingRight: 20,
          paddingVertical: 9,
          borderRadius: 20,
          borderBottomRightRadius: isSentByCurrentUser ? 4 : 20,
          borderBottomLeftRadius: isSentByCurrentUser ? 20 : 4,
          backgroundColor: isSentByCurrentUser ? '#222D31' : '#FFFFFF',
          overflow: 'hidden',
          ...(isSentByCurrentUser ? {} : receivedShadow),
        }}
      >
        {/* Message text — no width, no flex tricks needed once the parent has a pixel cap */}
        <Text
          style={{
            fontSize: 15,
            color: isSentByCurrentUser ? '#FFFFFF' : '#222D31',
          }}
        >
          {messageData.text + ' '}
        </Text>
      </View>
    </View>
  );
};


// Top navigation bar showing the recipient's avatar and email
const ChatHeader = ({
  recipientEmail,
  recipientPhotoUrl,
  onBack,
  onProfilePress,
}: {
  recipientEmail: string | null;
  recipientPhotoUrl: string | null;
  onBack: () => void;
  onProfilePress: () => void;
}) => (

  // Red branded bar that sits behind the status bar on Android
  <View style={chatStyles.redHeader}>
    <SafeAreaView style={chatStyles.safeAreaCustom}>
      <View
        style={{
          height: 50,
          paddingTop: 10,
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 15,
        }}
      >

        {/* Back arrow returns to the chat list */}
        <TouchableOpacity onPress={onBack} style={chatStyles.iconButton}>
          <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* Recipient avatar — tapping opens their profile */}
        <TouchableOpacity onPress={onProfilePress} style={{ marginLeft: 10 }}>
          <AvatarCircle
            photoUrl={recipientPhotoUrl}
            fallbackLetter={recipientEmail?.charAt(0).toUpperCase() ?? '?'}
            size={HEADER_AVATAR_SIZE}
          />
        </TouchableOpacity>

        {/* Recipient email label — also tappable to reach their profile */}
        <TouchableOpacity onPress={onProfilePress} style={{ flex: 1 }}>
          <Text
            style={[chatStyles.headerTitle, { marginLeft: 10, textAlign: 'left' }]}
            numberOfLines={1}
          >
            {recipientEmail || 'Loading...'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  </View>
);


// Text field and send button that stay above the software keyboard
const MessageInputBar = ({
  value,
  onChangeText,
  onSend,
  keyboardHeight,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  keyboardHeight: number;
}) => (

  // Bottom margin lifts the bar as the keyboard rises
  <View style={[chatStyles.inputArea, { marginBottom: keyboardHeight + 24 }]}>

    {/* Multiline field for composing the message */}
    <TextInput
      style={chatStyles.textInput}
      placeholder="Type message..."
      placeholderTextColor="#999"
      value={value}
      onChangeText={onChangeText}
      multiline
      blurOnSubmit={false}
    />

    {/* Send button dispatches the current draft */}
    <TouchableOpacity onPress={onSend} style={chatStyles.sendBtn}>
      <Ionicons name="send" size={18} color="#FFF" />
    </TouchableOpacity>
  </View>
);


// Main Screen 
export default function MessageScreen() {

  const { chatId } = useLocalSearchParams();
  const navigationRouter = useRouter();
  const [rawMessages, setRawMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');

  // Recipient profile fields fetched once when the screen mounts
  const [recipientEmail, setRecipientEmail] = useState<string | null>(null);
  const [recipientPhotoUrl, setRecipientPhotoUrl] = useState<string | null>(null);
  const [recipientUserId, setRecipientUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [currentKeyboardHeight, setCurrentKeyboardHeight] = useState(0);


  // Track keyboard height changes, input bar stays visible above the keyboard
  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', (event) =>
      setCurrentKeyboardHeight(event.endCoordinates.height)
    );
    const hideListener = Keyboard.addListener('keyboardDidHide', () =>
      setCurrentKeyboardHeight(0)
    );
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);


  // Load the recipient's profile and subscribe to the live message stream
  useEffect(() => {
    const authenticatedUser = auth.currentUser;
    if (!authenticatedUser || !chatId) return;

    setCurrentUserId(authenticatedUser.uid);

    // Fetch the chat document once to identify the other participant
    const loadChatAndRecipient = async () => {
      try {
        const chatSnapshot = await getDoc(doc(db, 'chats', chatId as string));

        if (chatSnapshot.exists()) {
          const chatData = chatSnapshot.data();

          const otherUserId = chatData.participants.find(
            (participantId: string) => participantId !== authenticatedUser.uid
          );

          if (otherUserId) {
            setRecipientUserId(otherUserId);

            // Fetch the recipient's email from the users collection
            const userSnapshot = await getDoc(doc(db, 'users', otherUserId));
            if (userSnapshot.exists()) setRecipientEmail(userSnapshot.data().email);

            // Fetch the recipient's profile photo from the profiles collection
            const profileSnapshot = await getDoc(doc(db, 'profiles', otherUserId));
            if (profileSnapshot.exists()) {
              setRecipientPhotoUrl(profileSnapshot.data().profilePicUrl || null);
            }
          }

          // Mark the chat as read for the current user if not already recorded
          const readByList: string[] = chatData.readBy ?? [];
          if (!readByList.includes(authenticatedUser.uid)) {
            await updateDoc(doc(db, 'chats', chatId as string), {
              readBy: arrayUnion(authenticatedUser.uid),
            });
          }
        }
      } catch (error) {
        console.error('Failed to load recipient info:', error);
      }
    };

    loadChatAndRecipient();

    // Subscribe to the messages sub-collection in real time, newest message first
    const messagesQuery = query(
      collection(db, 'chats', chatId as string, 'messages'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeFromMessages = onSnapshot(messagesQuery, (snapshot) => {
      setRawMessages(
        snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
      );
      setIsDataLoading(false);
    });

    // Cancel the Firestore subscription when the screen unmounts or chatId changes
    return () => unsubscribeFromMessages();
  }, [chatId]);


  // Write the new message to Firestore and update the chat preview metadata
  const handleMessageSubmission = async () => {
    const trimmedText = messageInput.trim();
    if (!trimmedText || !chatId) return;

    const sender = auth.currentUser;

    // Clear the input immediately for instant user feedback
    setMessageInput('');

    try {
      // Add the message document to the messages sub-collection
      const messageRef = await addDoc(
        collection(db, 'chats', chatId as string, 'messages'),
        {
          text: trimmedText,
          senderId: sender?.uid,
          senderEmail: sender?.email,
          createdAt: serverTimestamp(),
        }
      );

      if (!messageRef.id) throw new Error('Message creation failed');

      // Update the parent chat document with a preview of the latest message
      await updateDoc(doc(db, 'chats', chatId as string), {
        lastMessage: trimmedText,
        lastSenderEmail: sender?.email,
        updatedAt: serverTimestamp(),
        readBy: [sender?.uid],
      });
    } catch (error) {
      console.error('Message delivery error:', error);
    }
  };


  // Push the user to the recipient's public profile page
  const handleProfileNavigation = () => {
    if (recipientUserId) {
      navigationRouter.push({
        pathname: '/profile',
        params: { viewUserId: recipientUserId },
      });
    }
  };


  // Rebuild the enriched display list only when the raw Firestore array changes
  const messageDisplayItems = useMemo(
    () => buildMessageDisplayList(rawMessages),
    [rawMessages]
  );


  // Decide which component to render for each FlatList row
  const renderListItem = ({ item }: { item: MessageItem }) => {
    // Time divider rows sit between message groups
    if (item.type === 'divider') {
      return <TimeDivider label={item.label} />;
    }


    // Standard message bubble row — use stable currentUserId instead of auth.currentUser which can be null
    return (
      <MessageBubble
        messageData={item.data}
        isSentByCurrentUser={item.data.senderId === currentUserId}
        showAvatar={item.showAvatar}
        recipientPhotoUrl={recipientPhotoUrl}
      />
    );
  };


  // Full-screen root container
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* Keep status bar text white over the red header */}
      <StatusBar barStyle="light-content" backgroundColor="#AF0B01" />

      {/* Top bar with back button and recipient info */}
      <ChatHeader
        recipientEmail={recipientEmail}
        recipientPhotoUrl={recipientPhotoUrl}
        onBack={() => navigationRouter.back()}
        onProfilePress={handleProfileNavigation}
      />

      {/* Scrollable message list and input bar */}
      <View style={chatStyles.contentArea}>
        {isDataLoading ? (

          // Full-area spinner while the first message batch loads
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#AF0B01" />
          </View>
        ) : (
          <>

            {/* Inverted list so newest messages sit at the bottom */}
            <FlatList
              data={messageDisplayItems}
              inverted
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 12 }}
              showsVerticalScrollIndicator={false}
              renderItem={renderListItem}
            />

            {/* Input bar pinned above the keyboard */}
            <MessageInputBar
              value={messageInput}
              onChangeText={setMessageInput}
              onSend={handleMessageSubmission}
              keyboardHeight={currentKeyboardHeight}
            />
          </>
        )}
      </View>
    </View>
  );
}