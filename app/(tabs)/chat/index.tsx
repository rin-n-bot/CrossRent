import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  StatusBar,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { COLORS, chatStyles } from './styles';
import { ChatHeader } from './components/ChatHeader';
import { ChatSearchBar } from './components/ChatSearchBar';
import { ChatTabSelector } from './components/ChatTabSelector';
import { ChatListItem } from './components/ChatListItem';
import { ChatEmptyState } from './components/ChatEmptyState';
import { useChatList } from '../../../hooks/useChatList';
import { useChatSelection } from '../../../hooks/useChatSelection';
import { useChatSearch } from '../../../hooks/useChatSearch';
import { useChatFadeAnimation } from '../../../hooks/useChatFadeAnimation';
import { formatTimeLabel } from '../../../hooks/useChatTimeLabel';

type ChatTab = 'listing' | 'renting';

export default function ChatScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ChatTab>('listing');
  const searchInputRef = useRef<TextInput | null>(null);

  const { chats, isLoading, tick } = useChatList();
  const {
    isSelectionMode,
    setIsSelectionMode,
    selectedChatIds,
    toggleChatSelection,
    cancelSelectionMode,
    deleteSelectedChats,
  } = useChatSelection();
  const { searchQuery, setSearchQuery, filteredChats } = useChatSearch(chats, activeTab);
  const { fadeAnim } = useChatFadeAnimation(activeTab);

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
}