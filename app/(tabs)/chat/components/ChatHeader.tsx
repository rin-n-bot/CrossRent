import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { COLORS, chatStyles, scale } from '../styles';


// Type definitions for ChatHeader component props
interface ChatHeaderProps {
  isSelectionMode: boolean;
  selectedCount: number;
  onCancelSelection: () => void;
  onDeleteSelected: () => void;
  onEnterSelection: () => void;
}


// Main header component
export function ChatHeader({
  isSelectionMode,
  selectedCount,
  onCancelSelection,
  onDeleteSelected,
  onEnterSelection,
}: ChatHeaderProps) {
  return (
    <View
      style={[
        chatStyles.topNav,
        isSelectionMode && { backgroundColor: COLORS.primary },
      ]}
    >
        
      {isSelectionMode && (
        <TouchableOpacity onPress={onCancelSelection} style={{ marginRight: scale(12) }}>
          <Ionicons name="close-outline" size={scale(26)} color={COLORS.surface} />
        </TouchableOpacity>
      )}

      <Text
        style={[
          chatStyles.navLogoText,
          isSelectionMode && { color: COLORS.surface },
        ]}
      >
        {isSelectionMode ? `${selectedCount} Selected` : 'Messages'}
      </Text>

      {isSelectionMode ? (
        <TouchableOpacity onPress={onDeleteSelected}>
          <Ionicons name="trash-outline" size={scale(24)} color={COLORS.surface} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onEnterSelection}>
          <Text style={{ fontWeight: '700', color: COLORS.primary }}>Select</Text>
        </TouchableOpacity>
      )}

    </View>
  );
  
}