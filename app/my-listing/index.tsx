// User's listings management screen with category filtering
import { Ionicons } from "@expo/vector-icons";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StatusBar,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth, db } from "../../firebase";
import { COLORS } from "../../styles/global";
import { listingStyles as styles } from "./styles";

import { CategoryAccordion } from "./components/CategoryAccordion";
import { ListingCard } from "./components/ListingCard";
import { TopNav } from "./components/TopNav";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;

export default function MyListingScreen() {
  // Fetch user's items from Firestore
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // CATEGORY FILTERING STATE
  const [categories, setCategories] = useState<
    { id: string; displayName: string }[]
  >([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // FETCH AND FORMAT GLOBAL CATEGORIES FROM FIRESTORE
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsub = onSnapshot(collection(db, "categories"), (snapshot) => {
      const formatName = (id: string) =>
        id
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      const fetched = snapshot.docs.map((d) => ({
        id: d.id,
        displayName: formatName(d.id),
      }));
      setCategories([{ id: "All", displayName: "All" }, ...fetched]);
    });
    return () => unsub();
  }, []);

  // REAL-TIME FIRESTORE LISTENER FOR USER-SPECIFIC ITEMS
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "items"),
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(fetchedItems);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Catch Error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // FILTER ITEMS BASED ON SELECTED CATEGORY
  const filteredItems = items.filter((item) => {
    if (activeCategory === "All") return true;
    return item.categoryId === activeCategory;
  });

  // RENDER MAIN SCREEN
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        {/* TOP NAVIGATION */}
        <View style={{ backgroundColor: COLORS.background }}>
          <TopNav />
          <CategoryAccordion
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </View>

        {/* DATA LISTING CONTENT */}
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
          {loading ? (
            <View style={{ flex: 1, justifyContent: "center" }}>
              <ActivityIndicator color={COLORS.accent} size="large" />
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ListingCard item={item} />}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={{ alignItems: "center", marginTop: scale(220) }}>
                  <Ionicons
                    name="list-outline"
                    size={scale(60)}
                    color="#cfd4da"
                  />
                  <Text
                    style={[
                      styles.emptyText,
                      {
                        marginTop: scale(5),
                        color: "#cfd4da",
                        fontWeight: "500",
                      },
                    ]}
                  >
                    {activeCategory === "All"
                      ? "No listings created."
                      : `No listings in ${activeCategory}`}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
