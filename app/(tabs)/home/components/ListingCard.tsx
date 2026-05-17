import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from '../styles';

interface ListingCardProps {
  item: any;
  onPress: () => void;
}

const STATUS_AVAILABLE = 'Available';
const COLOR_SUCCESS_TEXT = '#27AE60';
const COLOR_ERROR_TEXT = '#AF0B01';
const COLOR_RENTAL_TEXT = '#1976D2';
const TOUCH_OPACITY = 0.7;
const RENTAL_PERIOD_FONT_SIZE = 12;

export const ListingCard = ({ item, onPress }: ListingCardProps) => {

  const renderStatusBadge = () => {
    const isAvailable = item.status === STATUS_AVAILABLE;
    const backgroundColor = isAvailable ? COLOR_SUCCESS_TEXT : COLOR_ERROR_TEXT;
    
    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <Text style={[styles.statusTextPlain, { color: '#fff' }]}>
          {item.status}
        </Text>
      </View>
    );
  };

  const renderPriceInfo = () => (
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={styles.cardPricePlain}>
        {item.price}
      </Text>
      {item.rentalPeriod && (
        <Text style={[styles.cardPricePlain, { fontSize: RENTAL_PERIOD_FONT_SIZE, color: COLOR_RENTAL_TEXT }]}>
          {" "}/ {item.rentalPeriod.toLowerCase()}
        </Text>
      )}
    </View>
  );

  return (
    <TouchableOpacity style={styles.card} activeOpacity={TOUCH_OPACITY} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl || item.image }} style={styles.cardImage} resizeMode="cover" />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardCategory}>{item.category}</Text>
          {renderStatusBadge()}
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name || item.title}</Text>
        {renderPriceInfo()}
      </View>
    </TouchableOpacity>
  );
};