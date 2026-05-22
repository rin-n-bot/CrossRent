// Empty state message when no chats exist for the selected tab
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { chatStyles, COLORS, scale } from "../styles";

// Props definition for the empty state component
interface ChatEmptyStateProps {
  searchQuery: string;
}

// Component to display when there are no messages or search results
export function ChatEmptyState({ searchQuery }: ChatEmptyStateProps) {
  const hasQuery = searchQuery.trim().length > 0;

  // Render different icons and messages based on whether it's an empty inbox or no search results
  return (
    <View style={chatStyles.emptyStateWrapper}>
      <Ionicons
        name={hasQuery ? "search-outline" : "chatbubbles-outline"}
        size={scale(70)}
        color={COLORS.iconInactive}
      />
      <Text style={chatStyles.emptyStateText}>
        {hasQuery ? `No results for "${searchQuery}"` : "No Messages Yet"}
      </Text>
    </View>
  );
}
