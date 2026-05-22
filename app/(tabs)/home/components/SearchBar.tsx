// Search input component for filtering listings
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, View } from "react-native";
import { scale, styles } from "../styles";

// Visual constants
const CHARCOAL = "#222D31";

// Type definitions for component props
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

// Main component
export function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View style={styles.searchSection}>
      <View style={[styles.searchBar, { backgroundColor: "#d9dfe665" }]}>
        <Ionicons
          name="search-outline"
          size={scale(20)}
          color={CHARCOAL}
          style={{ marginRight: 10 }}
        />

        <TextInput
          placeholder="Search items for rent..."
          style={styles.searchInput}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}
