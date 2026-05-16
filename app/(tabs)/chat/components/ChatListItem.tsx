import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { COLORS, chatStyles, scale } from '../styles';


// Type definitions for ChatListItem component props
interface ChatListItemProps {
  item: any;
  isSelected: boolean;
  isSelectionMode: boolean;
  timeLabel: string;
  onPress: () => void;
  onLongPress: () => void;
}


// Main component for rendering each chat item in the list
export function ChatListItem({
  item,
  isSelected,
  isSelectionMode,
  timeLabel,
  onPress,
  onLongPress,
}: ChatListItemProps) {


  // Main render function for the chat list item
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onLongPress={onLongPress}
      onPress={onPress}
      style={[
        chatStyles.chatRow,
        { backgroundColor: isSelected ? COLORS.selectionBg : COLORS.background },
      ]}
    >

      {/* Avatar with unread indicator */}
      <View style={chatStyles.avatarWrapper}>
        {item.displayPhoto ? (
          <Image
            source={{ uri: item.displayPhoto }}
            style={{
              width: scale(50),
              height: scale(50),
              borderRadius: scale(25),
            }}
          />
        ) : (
          <View style={chatStyles.avatarFallback}>
            <Text style={chatStyles.avatarFallbackText}>
              {item.displayEmail?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {item.isUnread && <View style={chatStyles.unreadDot} />}
      </View>

      {/* Name, time, and last message */}
      <View style={chatStyles.chatInfo}>
        <View style={chatStyles.chatRowTopLine}>
          <Text
            style={[
              chatStyles.senderName,
              item.isUnread && { color: '#111', fontWeight: '800' },
            ]}
            numberOfLines={1}
          >
            {item.displayEmail}
          </Text>
          {timeLabel ? (
            <Text
              style={[
                chatStyles.timeLabel,
                item.isUnread && { color: COLORS.dark },
              ]}
            >
              {timeLabel}
            </Text>
          ) : null}
        </View>
        <Text
          style={[
            chatStyles.lastMessagePreview,
            item.isUnread && { color: COLORS.dark, fontWeight: '600' },
          ]}
          numberOfLines={1}
        >
          {item.lastMsgDisplay}
        </Text>
      </View>

      {/* Selection mode checkbox */}
      {isSelectionMode && (
        <Ionicons
          name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
          size={scale(24)}
          color={COLORS.primary}
          style={{ marginLeft: scale(8) }}
        />
      )}

    </TouchableOpacity>
  );
  
}