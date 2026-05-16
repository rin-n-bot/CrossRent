import React from 'react';
import { ScrollView, Text } from 'react-native';
import { scale, styles } from '../styles';
import { CategoryCard } from './CategoryCard';


// Type definitions for category data and component props
interface Category {
  id: string;
  displayName: string;
  icon?: string;
}

interface CategoryListProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}


// Main component to render the list of categories with horizontal scrolling
export function CategoryList({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryListProps) {
  return (
    <>
      <Text style={styles.sectionLabel}>Categories</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: scale(20),
          paddingBottom: scale(20),
        }}
      >

        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            cat={{ ...cat, name: cat.displayName, icon: cat.icon ?? 'grid-outline' }}
            isActive={activeCategory === cat.id}
            onPress={() => onSelectCategory(cat.id)}
            />
        ))}

      </ScrollView>

    </>
  );
  
}