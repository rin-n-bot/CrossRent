import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { styles } from '../styles';
import { ListingCard } from './ListingCard';


// Visual and logic constants
const ACCENT_RED = '#AF0B01';


// Type definitions for component props
interface ListingsGridProps {
  listings: any[];
  isLoading: boolean;
  onSelectItem: (item: any) => void;
}


// Main component
export function ListingsGrid({
  listings,
  isLoading,
  onSelectItem,
}: ListingsGridProps) {

  if (isLoading) {
    return (
      <View style={{ paddingVertical: 40, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={ACCENT_RED} />
      </View>
    );
  }


  // Main Render
  return (
    <View style={styles.gridContainer}>
      {listings.length > 0 ? (
        listings.map((item) => (
          <ListingCard
            key={item.id}
            item={item}
            onPress={() => onSelectItem(item)}
          />
        ))
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No listings found.</Text>
        </View>
      )}
    </View>
  );
  
}