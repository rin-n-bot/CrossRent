import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, chatStyles, scale } from '../styles';


// Type definitions for ChatSearchBar component props
interface ChatSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  inputRef: React.RefObject<TextInput | null>;
}


// Main ChatSearchBar component
export function ChatSearchBar({
  value,
  onChangeText,
  onClear,
  inputRef,
}: ChatSearchBarProps) {


  // Main ChatSearchBar renderer
  return (
    <View style={chatStyles.searchWrapper}>
      <View style={chatStyles.searchRow}>

        <Ionicons
          name="search-outline"
          size={scale(16)}
          color={COLORS.dark}
          style={{ marginRight: scale(6) }}
        />

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder="Search messages..."
          placeholderTextColor={COLORS.textMuted}
          style={chatStyles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />

        {value.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <Ionicons name="close-circle" size={scale(16)} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}

      </View>
    </View>
  );  
}