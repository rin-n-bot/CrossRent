import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from '../styles';


// Type definitions for component props
interface ListingCardProps {
  item: any;
  onPress: () => void;
}


// Visual and logic constants
const STATUS_AVAILABLE = 'Available';
const COLOR_SUCCESS_BG = '#E8F5E9';
const COLOR_SUCCESS_TEXT = '#27AE60';
const COLOR_ERROR_BG = '#FFEBEE';
const COLOR_ERROR_TEXT = '#AF0B01';
const COLOR_RENTAL_TEXT = '#1976D2';
const TOUCH_OPACITY = 0.7;
const RENTAL_PERIOD_FONT_SIZE = 12;

export const ListingCard = ({ item, onPress }: ListingCardProps) => {


  // Renders the status badge with dynamic styling based on availability
  const renderStatusBadge = () => {
    const isAvailable = item.status === STATUS_AVAILABLE;
    const backgroundColor = isAvailable ? COLOR_SUCCESS_BG : COLOR_ERROR_BG;
    const textColor = isAvailable ? COLOR_SUCCESS_TEXT : COLOR_ERROR_TEXT;
    
    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <Text style={[styles.statusTextPlain, { color: textColor }]}>
          {item.status}
        </Text>
      </View>
    );
  };


  // Pricing information rendering logic, handles both price and optional rental period
  const renderPriceInfo = () => (
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={styles.cardPricePlain}>
        {item.price}
      </Text>
      
      {item.rentalPeriod && (
        <Text 
          style={[
            styles.cardPricePlain, 
            { fontSize: RENTAL_PERIOD_FONT_SIZE, color: COLOR_RENTAL_TEXT }
          ]}
        >
          {" "}/ {item.rentalPeriod.toLowerCase()}
        </Text>
      )}
    </View>
  );

  
  // Main render
  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={TOUCH_OPACITY} 
      onPress={onPress}
    >

      {/* Visual media section */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.imageUrl || item.image }} 
          style={styles.cardImage} 
          resizeMode="cover" 
        />
      </View>

      {/* Item details section */}
      <View style={styles.cardContent}>

        {/* Category and Status row */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardCategory}>
            {item.category}
          </Text>
          {renderStatusBadge()}
        </View>

        {/* Item name label */}
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name || item.title}
        </Text>
        
        {/* Pricing details */}
        {renderPriceInfo()}

      </View>

    </TouchableOpacity>
  );

};