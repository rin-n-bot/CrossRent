// Imports for core functionality, UI components, and Firebase hooks
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  InteractionManager,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { GREETING_QUOTES } from '../../../constants/quotes';
import { useDrawer } from '../../../context/DrawerContext';
import { auth, db } from '../../../firebase';
import { ModalItemDetails } from '../../modal/ModalItemDetails';
import { CategoryCard } from '../home/components/CategoryCard';
import { ListingCard } from '../home/components/ListingCard';
import { scale, styles } from './styles';


// Global constants for configuration and styling
const ALL_CATEGORY_ID = 'All';
const QUOTE_INTERVAL = 10000;
const ANIMATION_SPEED = 500;
const REFRESH_DURATION = 1500;
const LOAD_SIMULATION = 800;
const ACCENT_RED = '#AF0B01';
const LIGHT_GRAY = '#F5F5F5';
const CHARCOAL = '#222D31';

export default function HomeScreen() {


  // Navigation and Drawer context
  const { toggleDrawer, isDrawerOpen } = useDrawer();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => setCurrentUser(user));
    return unsub;
  }, []);


  // UI State management
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY_ID);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFullMeaning, setShowFullMeaning] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');


  // Animation values for transitions
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const arrowRotate = useRef(new Animated.Value(0)).current;


  // Category string formatter
  const formatCategoryName = (id: string) => {
    if (id === ALL_CATEGORY_ID) return ALL_CATEGORY_ID;
    return id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  
  // Main listing filter logic
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


// Sync user profile data from Firestore
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


// Sync categories list from Firestore
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
      setDbCategories([{ id: ALL_CATEGORY_ID, displayName: ALL_CATEGORY_ID, icon: 'grid-outline' }, ...fetched]);
    },
    (error) => console.error('Categories snapshot error:', error)
  );
  return unsubCats;
}, [currentUser]); 


// Listen for new item listings
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


  // Control the fading greeting text
  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: ANIMATION_SPEED, useNativeDriver: true }).start(() => {
        setQuoteIndex((prev) => (prev + 1) % GREETING_QUOTES.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: ANIMATION_SPEED, useNativeDriver: true }).start();
      });
    }, QUOTE_INTERVAL);
    return () => clearInterval(timer);
  }, [fadeAnim]);


  // Category switch handler
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === activeCategory) return;
    setIsLoading(true);
    setActiveCategory(categoryId);
    setTimeout(() => setIsLoading(false), LOAD_SIMULATION);
  };


  // List refresh handler
  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), REFRESH_DURATION);
  };


  // Header expansion toggle
  const toggleHCDC = () => {
    const toValue = showFullMeaning ? 0 : 1;
    Animated.spring(arrowRotate, { toValue, useNativeDriver: true, friction: 8 }).start();
    setShowFullMeaning(!showFullMeaning);
  };


  // Top navigation row
  const renderTopNav = () => (
    <View style={[styles.topNav, { backgroundColor: LIGHT_GRAY }]}>
      <TouchableOpacity onPress={() => toggleDrawer(true)}>
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
          <View
            style={{
              width: '100%',
              height: '100%',
              borderRadius: scale(16),
              backgroundColor: CHARCOAL,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: scale(12) }}>
              {userEmail?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );


  // Animated greeting section
  const renderGreeting = () => {
    const rotation = arrowRotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <View style={styles.greetingContainer}>
        <TouchableOpacity onPress={toggleHCDC} activeOpacity={0.7} style={styles.hcdcToggle}>
          <Text style={[styles.hcdcText, showFullMeaning && { color: ACCENT_RED }]}>
            {showFullMeaning ? 'Holy Cross of Davao College' : 'HCDC'}
          </Text>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons
              name="chevron-down"
              size={scale(16)}
              color={showFullMeaning ? ACCENT_RED : '#0038A8'}
            />
          </Animated.View>
        </TouchableOpacity>

        <Animated.Text style={[styles.greetingText, { opacity: fadeAnim, letterSpacing: -1 }]}>
          {GREETING_QUOTES[quoteIndex]}
        </Animated.Text>
      </View>
    );
  };


  // Search input bar
  const renderSearch = () => (
    <View style={styles.searchSection}>
      <View style={[styles.searchBar, { backgroundColor: '#d9dfe665' }]}>
        <Ionicons name="search-outline" size={scale(20)} color={CHARCOAL} style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Search items..."
          style={styles.searchInput}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );


  // Horizontal category list
  const renderCategories = () => (
    <>
      <Text style={styles.sectionLabel}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: scale(20) }}
      >
        {dbCategories.map((cat) => (
          <CategoryCard
            key={cat.id}
            cat={{ ...cat, name: cat.displayName }}
            isActive={activeCategory === cat.id}
            onPress={() => handleCategoryChange(cat.id)}
          />
        ))}
      </ScrollView>
    </>
  );


  // Main listings grid
  const renderListings = () => {
    const filtered = getFilteredListings();

    if (isLoading) {
      return (
        <View style={{ paddingVertical: 40, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={ACCENT_RED} />
        </View>
      );
    }

    return (
      <View style={styles.gridContainer}>
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              onPress={() => setSelectedItem(item)}
            />
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No listings found.</Text>
          </View>
        )}
      </View>
    );
  };

  
  // Master UI layout
  return (
    <View style={{ flex: 1, backgroundColor: LIGHT_GRAY }}>
      <SafeAreaView style={[styles.container, { backgroundColor: LIGHT_GRAY }]}>
        <StatusBar barStyle={isDrawerOpen || selectedItem ? 'light-content' : 'dark-content'} />

        <ModalItemDetails selectedItem={selectedItem} setSelectedItem={setSelectedItem} />

        {renderTopNav()}

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
          {renderGreeting()}
          {renderSearch()}
          {renderCategories()}

          <Text style={styles.sectionLabel}>
            {searchQuery.length > 0
              ? `Results for "${searchQuery}"`
              : activeCategory === ALL_CATEGORY_ID
              ? 'All Items'
              : formatCategoryName(activeCategory)}
          </Text>

          {renderListings()}

          {!isLoading && getFilteredListings().length > 0 && (
            <Text style={styles.endOfListText}>No more listings.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}