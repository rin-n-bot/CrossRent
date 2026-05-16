import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HEADER_AVATAR_SIZE, convoStyles, scale } from '../styles';
import { AvatarCircle } from './AvatarCircle';

interface ConvoHeaderProps {
  recipientEmail: string | null;
  recipientPhotoUrl: string | null;
  onBack: () => void;
  onProfilePress: () => void;
}

// Top navigation bar showing recipient avatar, email, and back button
export function ConvoHeader({
  recipientEmail,
  recipientPhotoUrl,
  onBack,
  onProfilePress,
}: ConvoHeaderProps) {
  return (
    <View style={convoStyles.redHeaderBar}>
      <SafeAreaView style={convoStyles.redHeaderSafeArea}>
        <View style={convoStyles.headerInnerRow}>
          <TouchableOpacity onPress={onBack} style={convoStyles.backButton}>
            <Ionicons name="arrow-back" size={scale(28)} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onProfilePress} style={{ marginLeft: scale(10) }}>
            <AvatarCircle
              photoUrl={recipientPhotoUrl}
              fallbackLetter={recipientEmail?.charAt(0).toUpperCase() ?? '?'}
              size={HEADER_AVATAR_SIZE}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onProfilePress} style={{ flex: 1 }}>
            <Text style={convoStyles.headerRecipientLabel} numberOfLines={1}>
              {recipientEmail || 'Loading...'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}