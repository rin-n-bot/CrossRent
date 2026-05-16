import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles, scale } from '../styles';


// Type definitions for component props
interface CategoryCardProps {
  cat: { name: string; icon: string };
  isActive: boolean;
  onPress: () => void;
}


// Visual constants
const ACTIVE_COLOR = "#FFFFFF";
const INACTIVE_COLOR = "#222D31";
const ICON_SIZE = 18;
const BORDER_RADIUS = 25;
const TOUCH_OPACITY = 0.7;

export const CategoryCard = ({ cat, isActive, onPress }: CategoryCardProps) => {
  

  // Logic for dynamic container styling
  const getContainerStyle = (): StyleProp<ViewStyle> => [
    styles.categoryCard,
    isActive && styles.activeCategoryCard,
    {
      flexDirection: 'row',
      width: 'auto',
      paddingHorizontal: scale(16),
      paddingVertical: scale(8),
      marginRight: scale(10),
      borderRadius: scale(BORDER_RADIUS),
      marginBottom: 0,
      height: scale(40),
      alignItems: 'center',
    },
  ];


  // Logic for dynamic content coloring
  const getContentColor = () => (isActive ? ACTIVE_COLOR : INACTIVE_COLOR);

  
  // Main render
  return (
    <TouchableOpacity
      onPress={onPress}
      style={getContainerStyle()}
      activeOpacity={TOUCH_OPACITY}
    >
      
      {/* Category Icon */}
      <Ionicons 
        name={cat.icon as any} 
        size={scale(ICON_SIZE)} 
        color={getContentColor()} 
      />
      
      {/* Category Label */}
      <Text 
        style={[
          styles.categoryCardText, 
          isActive && styles.activeCategoryCardText,
          { marginTop: 0, marginLeft: scale(8) }
        ]}
      >
        {cat.name}
      </Text>

    </TouchableOpacity>
  );

};