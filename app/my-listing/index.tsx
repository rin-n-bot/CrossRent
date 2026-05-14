import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    where
} from 'firebase/firestore';
import React, { useEffect, useState, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    Animated
} from 'react-native';
import { auth, db } from '../../firebase';
import { handleItemDelete } from '../../services/transactionService';
import { COLORS } from '../../styles/global';
import { listingStyles as styles } from './styles';


// UI MEASUREMENTS AND SCALING CONSTANTS
const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 375) * size;

export default function MyListingScreen() {


   // NAVIGATION AND ROUTING HOOK
   const router = useRouter();

   
   // CORE DATA FOR USER LISTINGS
   const [items, setItems] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);


   // CATEGORY FILTERING AND ACCORDION UI
   const [categories, setCategories] = useState<{ id: string; displayName: string }[]>([]);
   const [activeCategory, setActiveCategory] = useState<string>('All');
   const [isCategoryOpen, setIsCategoryOpen] = useState(false);
   const accordionAnim = useRef(new Animated.Value(0)).current;

   
   // FETCH AND FORMAT GLOBAL CATEGORIES FROM FIRESTORE
   useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;
       const unsub = onSnapshot(collection(db, 'categories'), (snapshot) => {
           const formatName = (id: string) =>
               id.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
           const fetched = snapshot.docs.map((d) => ({
               id: d.id,
               displayName: formatName(d.id),
           }));
           setCategories([{ id: 'All', displayName: 'All' }, ...fetched]);
       });
       return () => unsub();
   }, []);


   // TOGGLE CATEGORY ACCORDION ANIMATION STATE
   const toggleCategory = () => {
       const toValue = isCategoryOpen ? 0 : 1;
       Animated.spring(accordionAnim, {
           toValue,
           useNativeDriver: false,
           friction: 8,
       }).start();
       setIsCategoryOpen(!isCategoryOpen);
   };
   
   // ANIMATION INTERPOLATE ARROW ROTATION
   const arrowRotation = accordionAnim.interpolate({
       inputRange: [0, 1],
       outputRange: ['180deg', '0deg'],
   });


   // ANIMATION INTERPOLATE ACCORDION HEIGHT
   const accordionMaxHeight = accordionAnim.interpolate({
       inputRange: [0, 1],
       outputRange: [0, 200],
   });


   // REAL-TIME FIRESTORE LISTENER FOR USER-SPECIFIC ITEMS
   useEffect(() => {
       const user = auth.currentUser;
       if (!user) {
           setLoading(false);
           return;
       }

       const q = query(
           collection(db, 'items'),
           where('ownerId', '==', user.uid),
           orderBy('createdAt', 'desc')
       );

       const unsubscribe = onSnapshot(q, (snapshot) => {
           const fetchedItems = snapshot.docs.map(doc => ({
               id: doc.id,
               ...doc.data()
           }));

           setItems(fetchedItems);
           setLoading(false);
       }, (error) => {
           console.error("Firestore Catch Error:", error);
           setLoading(false);
       });

       return () => unsubscribe();
   }, []);


   // FILTER ITEMS ARRAY BASED ON SELECTED CATEGORY PILL
   const normalizeCategory = (str: string) =>
    str
        .toLowerCase()
        .replace(/-/g, ' ')
        .trim();

    const filteredItems = items.filter((item) => {
        if (activeCategory === 'All') return true;

        const itemCat = normalizeCategory(item.category || '');
        const selected = normalizeCategory(activeCategory);

        return itemCat === selected;
    });


   // TRIGGER DELETE CONFIRMATION ALERT AND FIRESTORE ACTION
   const handleDelete = (itemId: string, itemName: string) => {
       Alert.alert(
           "Delete Listing",
           "Are you sure? This will remove the item from Firestore permanently.",
           [
               { text: "Cancel", style: "cancel" },
               {
                   text: "Delete",
                   style: "destructive",
                   onPress: async () => {
                       try {
                           await handleItemDelete(itemId, itemName);
                       } catch (error) {
                           Alert.alert("Error", "Failed to delete item.");
                       }
                   }
               }
           ]
       );
   };


   // INDIVIDUAL ITEM CARD RENDERER FOR FLATLIST
   const renderItem = ({ item }: { item: any }) => {
       const isRented = item.status?.toLowerCase() === 'rented';

       return (
           <View style={styles.card}>

               {/* ITEM IMAGE SECTION */}
               <Image
                   source={{ uri: item.imageUrl || item.image }}
                   style={styles.itemImage}
                   contentFit="cover"
                   transition={300}
               />

               {/* ITEM DETAILS SECTION */}
               <View style={styles.itemInfo}>
                   <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                   <Text style={styles.itemPrice}>
                       {item.price} / {(item.rentalPeriod || 'day').toLowerCase()}
                   </Text>

                   {/* DYNAMIC STATUS BADGE */}
                   <View style={{ flexDirection: 'row', marginTop: 6 }}>
                       <View style={{
                           backgroundColor: isRented ? '#FFF3E0' : '#E8F5E9',
                           paddingHorizontal: 8,
                           paddingVertical: 2,
                           borderRadius: 4,
                       }}>
                           <Text style={{
                               fontSize: 10,
                               fontWeight: 'bold',
                               color: isRented ? '#E65100' : '#27AE60',
                               textTransform: 'uppercase'
                           }}>
                               {item.status || 'Active'}
                           </Text>
                       </View>
                   </View>
               </View>

               {/* ACTION BUTTONS SECTION (EDIT/DELETE) */}
               <View style={styles.actions}>
                   <TouchableOpacity
                       style={styles.actionBtn}
                       onPress={() => router.push({
                           pathname: '/my-listing/components/EditItem',
                           params: { itemId: item.id }
                       })}
                   >
                       <Ionicons name="create-outline" size={22} color={COLORS.primary} />
                   </TouchableOpacity>
                   <TouchableOpacity
                       style={styles.actionBtn}
                       onPress={() => handleDelete(item.id, item.name)}
                   >
                       <Ionicons name="trash-outline" size={22} color={COLORS.accent} />
                   </TouchableOpacity>
               </View>
           </View>
       );
   };

   
   // RENDER MAIN SCREEN COMPOSITION
   return (
       <View style={{ flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
           
           {/* SYSTEM STATUS BAR CONFIGURATION */}
           <StatusBar barStyle="dark-content" backgroundColor="white" translucent={true} />
           <SafeAreaView style={{ flex: 0, backgroundColor: COLORS.background }} /> 


           {/* TOP NAVIGATION BAR SECTION */}
           <View style={{ backgroundColor: COLORS.background }}>
               <View style={{
                   flexDirection: 'row',
                   alignItems: 'center',
                   paddingHorizontal: scale(20),
                   height: scale(60),
               }}>
                   <TouchableOpacity onPress={() => router.back()} style={{ padding: scale(5) }}>
                       <Ionicons
                           name="arrow-back"
                           size={scale(24)}
                           color="#222D31"
                       />
                   </TouchableOpacity>
                   
                   <Text style={{
                       flex: 1,
                       marginLeft: scale(15),
                       fontSize: scale(20),
                       fontWeight: '700',
                       color: '#222D31',
                       letterSpacing: -1
                   }}>
                       My Listings
                   </Text>

                   <View style={{ width: scale(40) }} />
               </View>

               {/* CATEGORY SELECTOR ACCORDION SECTION */}
               <View style={{ backgroundColor: COLORS.background, paddingHorizontal: scale(20) }}>
                   <TouchableOpacity
                       onPress={toggleCategory}
                       activeOpacity={0.7}
                       style={{
                           flexDirection: 'row',
                           alignItems: 'center',
                           justifyContent: 'space-between',
                           paddingVertical: scale(10),
                       }}
                   >
                       <Text style={{ fontSize: scale(13), fontWeight: '700', color: '#9CA3AF' }}>
                           {activeCategory === 'All' ? 'All Categories' : activeCategory.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                       </Text>
                       <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
                           <Ionicons name="chevron-down" size={scale(18)} color="#AF0B01" />
                       </Animated.View>
                   </TouchableOpacity>

                   <Animated.View style={{ overflow: 'hidden', maxHeight: accordionMaxHeight }}>
                       <View style={{
                           flexDirection: 'row',
                           flexWrap: 'wrap',
                           justifyContent: 'space-between',
                           paddingVertical: scale(10),
                       }}>
                           {categories.map((cat) => {
                               const isActive = activeCategory === cat.id;
                               const pillWidth = (width - scale(40) - scale(20)) / 3;
                               return (
                                   <TouchableOpacity
                                       key={cat.id}
                                       onPress={() => {
                                           setActiveCategory(cat.id);
                                           Animated.spring(accordionAnim, {
                                               toValue: 0,
                                               useNativeDriver: false,
                                               friction: 8,
                                           }).start();
                                           setIsCategoryOpen(false);
                                       }}
                                       style={{
                                           width: pillWidth,
                                           paddingVertical: scale(12),
                                           borderRadius: scale(25),
                                           borderWidth: 1,
                                           borderColor: isActive ? '#222D31' : '#ffffff',
                                           backgroundColor: isActive ? '#222D31' : '#FFF',
                                           alignItems: 'center',
                                           marginBottom: scale(10),
                                       }}
                                   >
                                       <Text style={{
                                           fontSize: scale(11),
                                           fontWeight: '700',
                                           color: isActive ? '#FFF' : '#666',
                                           textAlign: 'center',
                                       }}>
                                           {cat.displayName}
                                       </Text>
                                   </TouchableOpacity>
                               );
                           })}
                       </View>
                   </Animated.View>
               </View>
           </View>

           {/* DATA LISTING CONTENT SECTION */}
           <View style={{ flex: 1, backgroundColor: COLORS.background }}>
               {loading ? (
                   /* LOADING INDICATOR VIEW */
                   <View style={{ flex: 1, justifyContent: 'center' }}>
                       <ActivityIndicator color={COLORS.accent} size="large" />
                   </View>
               ) : (

                   /* MAIN DATA */
                   <FlatList
                       data={filteredItems}
                       keyExtractor={(item) => item.id}
                       renderItem={renderItem}
                       contentContainerStyle={styles.listContainer}
                       ListEmptyComponent={
              
                           /* EMPTY LIST PLACEHOLDER */
                           <View style={{ alignItems: 'center', marginTop: scale(220) }}>
                               <Ionicons name="list-outline" size={scale(60)} color="#cfd4da" />
                               <Text style={[styles.emptyText, { marginTop: scale(5), color: '#cfd4da', fontWeight: '500' }]}>
                                   {activeCategory === 'All' ? "No listings created." : `No listings in ${activeCategory}`}
                               </Text>
                           </View>
                       }
                   />
               )}
           </View>
       </View>
   );
}