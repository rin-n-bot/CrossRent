import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDrawer } from '../../../context/DrawerContext';
import { auth, db } from '../../../firebase';
import { ModalItemDetails } from '../../modal/ModalItemDetails';
import { styles } from './styles';

import { CategoryList } from './components/CategoryList';
import { GreetingSection } from './components/GreetingSection';
import { ListingsGrid } from './components/ListingsGrid';
import { SearchBar } from './components/SearchBar';
import { TopNav } from './components/TopNav';


// UI and logic constants
const ALL_CATEGORY_ID = 'All';
const REFRESH_DURATION = 1500;
const LOAD_SIMULATION = 800;
const ACCENT_RED = '#AF0B01';
const LIGHT_GRAY = '#F5F5F5';


// Main Home Screen component
export default function HomeScreen() {

  // Drawer state management and user authentication state
  const { toggleDrawer, isDrawerOpen } = useDrawer();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  // Sync auth state on component mount
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => setCurrentUser(user));
    return unsub;
  }, []);

  // Local state for categories, listings, search query, loading states, and user profile info
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY_ID);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  // Utility function to format category IDs into user-friendly display names
  const formatCategoryName = (id: string) => {
    if (id === ALL_CATEGORY_ID) return ALL_CATEGORY_ID;
    return id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Filtering logic for listings based on active category and search query
  const getFilteredListings = () => {
    return listings.filter((item) => {
      const itemCatId = (item.categoryId || '').toLowerCase().trim();
      const itemCatLabel = (item.category || '').toLowerCase().trim();
      const currentActive = activeCategory.toLowerCase().trim();
      const queryLower = searchQuery.toLowerCase().trim();

      const matchesCategory =
        activeCategory === ALL_CATEGORY_ID ||
        itemCatId === currentActive ||
        itemCatId === currentActive + 's' ||
        itemCatId + 's' === currentActive ||
        itemCatLabel === currentActive;

      const matchesSearch =
        (item.name || '').toLowerCase().includes(queryLower) ||
        (item.category || '').toLowerCase().includes(queryLower);

      return matchesCategory && matchesSearch;
    });
  };

  // Sync user profile
  useEffect(() => {
    if (!currentUser) return;
    setUserEmail(currentUser.email || '');
    const unsubProfile = onSnapshot(
      doc(db, 'profiles', currentUser.uid),
      (snap) => { if (snap.exists()) setAvatarUrl(snap.data().profilePicUrl || ''); },
      (error) => console.error('Profile snapshot error:', error)
    );
    return unsubProfile;
  }, [currentUser?.uid]);

  // Sync categories
  useEffect(() => {
    if (!currentUser) return;
    const unsubCats = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          displayName: formatCategoryName(doc.id),
        }));
        setDbCategories([
          { id: ALL_CATEGORY_ID, displayName: ALL_CATEGORY_ID, icon: 'grid-outline' },
          ...fetched,
        ]);
      },
      (error) => console.error('Categories snapshot error:', error)
    );
    return unsubCats;
  }, [currentUser]);

  // Sync listings
  useEffect(() => {
    if (!currentUser) return;
    let unsubItems: (() => void) | null = null;
    const task = InteractionManager.runAfterInteractions(() => {
      const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
      unsubItems = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              name: data.name || 'Untitled Item',
              title: data.name || 'Untitled Item',
              category: data.category || '',
              categoryId: data.categoryId || '',
              image: data.imageUrl,
              timestamp: data.createdAt?.toDate().toLocaleDateString() || 'Just now',
            };
          });
          setListings(items);
          setIsLoading(false);
        },
        (error) => {
          console.error('Firestore Error:', error);
          setIsLoading(false);
        }
      );
    });
    return () => {
      task.cancel();
      if (unsubItems) unsubItems();
    };
  }, [currentUser]);

  // Handler for category selection changes, simulates loading state
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === activeCategory) return;
    setIsLoading(true);
    setActiveCategory(categoryId);
    setTimeout(() => setIsLoading(false), LOAD_SIMULATION);
  };

  // Pull-to-refresh handler, simulates a refresh action with a timeout
  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), REFRESH_DURATION);
  };

  // Compute filtered listings based on current active category and search query
  const filteredListings = getFilteredListings();

  // Dynamic section label based on search query and active category
  const listingsSectionLabel =
    searchQuery.length > 0
      ? `Results for "${searchQuery}"`
      : activeCategory === ALL_CATEGORY_ID
      ? 'All Items'
      : formatCategoryName(activeCategory);

  // Determine status bar style based on drawer and item selection state
  return (
    <View style={{ flex: 1, backgroundColor: LIGHT_GRAY }}>
      <SafeAreaView style={[styles.container, { flex: 1, backgroundColor: LIGHT_GRAY }]}>
        <StatusBar barStyle={isDrawerOpen || selectedItem ? 'light-content' : 'dark-content'} />

        <ModalItemDetails selectedItem={selectedItem} setSelectedItem={setSelectedItem} />

        <TopNav
          avatarUrl={avatarUrl}
          userEmail={userEmail}
          onMenuPress={() => toggleDrawer(true)}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={ACCENT_RED}
              colors={[ACCENT_RED]}
            />
          }
        >

          <GreetingSection />

          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

          <CategoryList
            categories={dbCategories}
            activeCategory={activeCategory}
            onSelectCategory={handleCategoryChange}
          />

          <Text style={styles.sectionLabel}>{listingsSectionLabel}</Text>

          <ListingsGrid
            listings={filteredListings}
            isLoading={isLoading}
            onSelectItem={setSelectedItem}
          />

          {!isLoading && filteredListings.length > 0 && (
            <Text style={styles.endOfListText}>No more listings.</Text>
          )}

        </ScrollView>

      </SafeAreaView>
    </View>
  );
}