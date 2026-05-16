import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';

interface AvatarCircleProps {
  photoUrl: string | null;
  fallbackLetter: string;
  size: number;
}

// Circular avatar showing a photo or a single initial letter as fallback
export function AvatarCircle({ photoUrl, fallbackLetter, size }: AvatarCircleProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#222D31',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={{ color: '#FFF', fontWeight: '800', fontSize: size * 0.4 }}>
          {fallbackLetter}
        </Text>
      )}
    </View>
  );
}