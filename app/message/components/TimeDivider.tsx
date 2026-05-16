import React from 'react';
import { Text, View } from 'react-native';
import { convoStyles } from '../styles';

interface TimeDividerProps {
  label: string;
}

// Pill-shaped timestamp label between message groups
export function TimeDivider({ label }: TimeDividerProps) {
  return (
    <View style={convoStyles.timeDividerWrapper}>
      <Text style={convoStyles.timeDividerLabel}>{label}</Text>
    </View>
  );
}