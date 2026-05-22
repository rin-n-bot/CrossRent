// Add listing form for creating new rental items
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth, db } from "../../firebase";
import styles from "./styles";

// Standard options for the form selection chips
// Form options for listing creation
const CATEGORY_OPTIONS = [
  "Laptops",
  "Books",
  "Tech",
  "Calculators",
  "Lab Gear",
];
const STATUS_OPTIONS = ["Available", "Reserved", "Rented"];
const DURATION_OPTIONS = ["Hour", "Day", "Week", "Month"];

// Slug mapping for database category identification
// Slug mapping for database category identification
const CATEGORY_SLUG_MAP: Record<string, string> = {
  laptop: "laptops",
  book: "books",
  calculator: "calculators",
  tech: "tech",
  "lab gear": "lab-gear",
};

export default function AddScreen() {
  const navigationRouter = useRouter();
  const insets = useSafeAreaInsets();

  // Hold the form data in local state
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [rentalDuration, setRentalDuration] = useState("Day");
  const [itemDescription, setItemDescription] = useState("");
  const [itemLocation, setItemLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(
    null,
  );

  // Convert the category name into a clean ID for sorting and filtering
  const generateCategorySlug = (categoryName: string) => {
    const standardizedName = categoryName.toLowerCase().trim();
    return (
      CATEGORY_SLUG_MAP[standardizedName] ||
      standardizedName.replace(/\s+/g, "-")
    );
  };

  // Open the phone gallery to select an item photo
  const handleImagePick = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your gallery to upload photos.",
      );
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!pickerResult.canceled && pickerResult.assets[0].base64) {
      setSelectedImageBase64(
        `data:image/jpeg;base64,${pickerResult.assets[0].base64}`,
      );
    }
  };

  // Check if all required fields are filled and save the item to Firestore
  const saveListingToDatabase = async () => {
    const isFormInvalid =
      !itemName.trim() ||
      !itemPrice.trim() ||
      !itemDescription.trim() ||
      !itemLocation.trim() ||
      !selectedCategory ||
      !currentStatus ||
      !selectedImageBase64;

    if (isFormInvalid) {
      return Alert.alert(
        "Incomplete Form",
        "Please fill out all fields and provide an item image.",
      );
    }

    try {
      await addDoc(collection(db, "items"), {
        name: itemName.trim(),
        price: `₱${itemPrice.trim()}`,
        rentalPeriod: rentalDuration,
        description: itemDescription.trim(),
        category: selectedCategory,
        categoryId: generateCategorySlug(selectedCategory),
        location: itemLocation.trim(),
        status: currentStatus,
        ownerEmail: auth.currentUser?.email,
        ownerId: auth.currentUser?.uid,
        imageUrl: selectedImageBase64,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Item posted successfully!");
      navigationRouter.replace("/(tabs)/home");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save listing.");
    }
  };

  // Show the red top bar with back and post buttons (now with extra adaptive padding)
  const renderHeader = () => (
    <View style={styles.redHeader}>
      <View style={{ paddingBottom: 10, paddingTop: insets.top + 10 }}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => {
              if (navigationRouter.canGoBack()) {
                navigationRouter.back();
              } else {
                navigationRouter.replace("/(tabs)/home");
              }
            }}
            style={styles.iconButton}
          >
            <Ionicons name="close-outline" size={30} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontWeight: 600 }]}>
            List an Item
          </Text>
          <TouchableOpacity
            onPress={saveListingToDatabase}
            style={styles.iconButton}
          >
            <Text style={[styles.postBtnText, { fontWeight: 600 }]}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Reusable component for rendering selection chips
  const renderSelectionChips = (
    options: string[],
    selectedValue: string,
    onSelect: (val: string) => void,
    chipWidth: any,
    activeStyle = styles.chipActive,
  ) => (
    <View style={styles.chipGrid}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onSelect(option)}
          style={[
            styles.chip,
            { width: chipWidth },
            selectedValue === option ? activeStyle : styles.chipInactive,
          ]}
        >
          <Text
            style={[
              styles.chipText,
              selectedValue === option && styles.chipTextActive,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Show the image picker button or the selected image preview
  const renderImagePicker = () => (
    <TouchableOpacity
      style={styles.imageButton}
      onPress={handleImagePick}
      activeOpacity={0.8}
    >
      {selectedImageBase64 ? (
        <Image
          source={{ uri: selectedImageBase64 }}
          style={styles.imagePreview}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="camera-outline" size={24} color="#AF0B01" />
          <Text style={styles.imageButtonText}>Select Photo</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Final footer showing the user's email
  const renderFooter = () => (
    <View style={styles.centeredFooter}>
      <View style={styles.infoBox}>
        <Ionicons name="mail-outline" size={14} color="#999" />
        <Text style={styles.infoText}>
          Posting as: {auth.currentUser?.email}
        </Text>
      </View>
    </View>
  );

  // Main UI layout
  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#AF0B01" />

      {renderHeader()}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.formContainer, { paddingTop: 16 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Scientific Calculator"
            placeholderTextColor="#999"
            value={itemName}
            onChangeText={setItemName}
          />

          <Text style={styles.label}>Category</Text>
          {renderSelectionChips(
            CATEGORY_OPTIONS,
            selectedCategory,
            setSelectedCategory,
            "31%",
          )}

          <Text style={styles.label}>Price (₱)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={itemPrice}
            onChangeText={setItemPrice}
          />

          <Text style={styles.label}>Rental Duration</Text>
          {renderSelectionChips(
            DURATION_OPTIONS,
            rentalDuration,
            setRentalDuration,
            "22%",
          )}

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. J605 or any specific location"
            placeholderTextColor="#999"
            value={itemLocation}
            onChangeText={setItemLocation}
          />

          <Text style={styles.label}>Status</Text>
          {renderSelectionChips(
            STATUS_OPTIONS,
            currentStatus,
            setCurrentStatus,
            "31%",
            styles.chipActiveBlack,
          )}

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe condition..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={itemDescription}
            onChangeText={setItemDescription}
          />

          <Text style={styles.label}>Item Image</Text>
          {renderImagePicker()}

          {renderFooter()}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
