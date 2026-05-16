import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { convoStyles, scale, scaleV } from '../styles';

interface MessageInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  keyboardHeight: number;
}

// Text field and send button pinned above the software keyboard
export function MessageInputBar({
  value,
  onChangeText,
  onSend,
  keyboardHeight,
}: MessageInputBarProps) {
  return (
    <View style={[convoStyles.inputBar, { marginBottom: keyboardHeight + scaleV(24) }]}>
      <TextInput
        style={convoStyles.textInput}
        placeholder="Type message..."
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        multiline
        blurOnSubmit={false}
      />
      <TouchableOpacity onPress={onSend} style={convoStyles.sendButton}>
        <Ionicons name="send" size={scale(18)} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}