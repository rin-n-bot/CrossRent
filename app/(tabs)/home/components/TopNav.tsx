import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { scale, styles } from '../styles';


// Type definitions for component props
interface TopNavProps {
  avatarUrl: string;
  userEmail: string;
  onMenuPress: () => void;
}


// Visual constants
const ACCENT_RED = '#AF0B01';
const CHARCOAL = '#222D31';
const LIGHT_GRAY = '#F5F5F5';


// Main component
export function TopNav({ avatarUrl, userEmail, onMenuPress }: TopNavProps) {
  const router = useRouter();

  // Logic for handling profile navigation
  return (
    <View style={[styles.topNav, { backgroundColor: LIGHT_GRAY }]}>

      <TouchableOpacity onPress={onMenuPress}>
        <Ionicons name="menu-outline" size={scale(28)} color={CHARCOAL} />
      </TouchableOpacity>

      <Text style={styles.logoMini}>
        Cross<Text style={{ color: ACCENT_RED }}>Rent</Text>
      </Text>

      <TouchableOpacity
        onPress={() => router.push('/profile' as any)}
        style={[styles.profileCircle, { overflow: 'hidden' }]}
        activeOpacity={0.8}
      >

        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: '100%', height: '100%', borderRadius: scale(16) }}
          />
        ) : (
          <View style={styles.profileFallback}>
            <Text style={styles.profileFallbackText}>
              {userEmail?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        )}
        
      </TouchableOpacity>

    </View>
  );
}