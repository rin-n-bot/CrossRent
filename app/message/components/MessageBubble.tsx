// Individual message bubble with timestamp and sender avatar
import React from "react";
import { Platform, Text, View } from "react-native";
import {
    BUBBLE_AVATAR_SIZE,
    BUBBLE_MAX_WIDTH,
    BUBBLE_MIN_WIDTH,
    convoStyles,
    scale,
} from "../styles";
import { AvatarCircle } from "./AvatarCircle";

interface MessageBubbleProps {
  messageData: any;
  isSentByCurrentUser: boolean;
  showAvatar: boolean;
  recipientPhotoUrl: string | null;
}

// Shadow applied only on iOS for received bubbles
const iosBubbleShadow =
  Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      }
    : {};

// Single chat bubble, handles sent and received layouts
export function MessageBubble({
  messageData,
  isSentByCurrentUser,
  showAvatar,
  recipientPhotoUrl,
}: MessageBubbleProps) {
  const senderInitial =
    (messageData.senderEmail as string)?.charAt(0).toUpperCase() ?? "?";

  return (
    <View
      style={[
        convoStyles.messageRow,
        { justifyContent: isSentByCurrentUser ? "flex-end" : "flex-start" },
      ]}
    >
      {/* Avatar column — only for received messages, hidden mid-group for clean grouping */}
      {!isSentByCurrentUser && (
        <View
          style={[
            convoStyles.avatarPlaceholder,
            { marginRight: scale(6), opacity: showAvatar ? 1 : 0 },
          ]}
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

      {/* Bubble shell */}
      <View
        style={{
          maxWidth: BUBBLE_MAX_WIDTH,
          minWidth: BUBBLE_MIN_WIDTH,
          paddingLeft: scale(14),
          paddingRight: scale(20),
          paddingVertical: scale(9),
          borderRadius: scale(20),
          borderBottomRightRadius: isSentByCurrentUser ? scale(4) : scale(20),
          borderBottomLeftRadius: isSentByCurrentUser ? scale(20) : scale(4),
          backgroundColor: isSentByCurrentUser ? "#222D31" : "#FFFFFF",
          overflow: "hidden",
          ...(isSentByCurrentUser ? {} : iosBubbleShadow),
        }}
      >
        <Text
          style={{
            fontSize: scale(15),
            color: isSentByCurrentUser ? "#FFFFFF" : "#222D31",
          }}
        >
          {messageData.text + " "}
        </Text>
      </View>
    </View>
  );
}
