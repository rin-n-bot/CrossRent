// User profile screen showing listings, transactions, and bio
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebase";
import { scale, profileStyles as styles } from "./styles";

// MAIN PROFILE SCREEN COMPONENT
// MAIN PROFILE SCREEN COMPONENT
export default function ProfileScreen() {
  // NAVIGATION AND ROUTING HOOKS
  const router = useRouter();
  const { viewUserId } = useLocalSearchParams();
  const currentUser = auth.currentUser;

  // DETERMINE PROFILE OWNERSHIP AND TARGET USER ID
  const isViewingOthers = !!viewUserId && viewUserId !== currentUser?.uid;
  const targetId = (isViewingOthers ? viewUserId : currentUser?.uid) as string;

  // PROFILE DATA AND UI LOADING STATES
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [listingsCount, setListingsCount] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // PERSISTENT STORAGE FOR ORIGINAL DATA COMPARISON
  const originalBio = useRef("");
  const originalPic = useRef("");

  // DATA INITIALIZATION ON COMPONENT MOUNT OR TARGET CHANGE
  useEffect(() => {
    if (!targetId) return;
    setBio("");
    setProfilePicUrl("");
    setMemberSince("");
    setEmail("");
    setIsDirty(false);
    originalBio.current = "";
    originalPic.current = "";

    fetchProfile();
    const cleanup = fetchStats();
    return () => {
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  // FETCH USER PROFILE AND ACCOUNT DETAILS FROM FIRESTORE
  const fetchProfile = async () => {
    try {
      const profileSnap = await getDoc(doc(db, "profiles", targetId));
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        const fetchedBio = data.bio || "";
        setBio(fetchedBio);
        originalBio.current = fetchedBio;
        setProfilePicUrl(data.profilePicUrl || "");
        originalPic.current = data.profilePicUrl || "";
      }

      const userSnap = await getDoc(doc(db, "users", targetId));
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setEmail(userData.email || "");
        if (userData.lastLogin?.seconds) {
          const date = new Date(userData.lastLogin.seconds * 1000);
          setMemberSince(
            date.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            }),
          );
        }
      }
    } catch (e) {
      console.error("fetchProfile error:", e);
    } finally {
      setLoading(false);
    }
  };

  // REAL-TIME LISTENERS FOR USER STATISTICS
  const fetchStats = () => {
    if (!targetId) return;
    const unsubItems = onSnapshot(
      query(collection(db, "items"), where("ownerId", "==", targetId)),
      (snap) => setListingsCount(snap.size),
    );
    const unsubTx = onSnapshot(
      query(collection(db, "transactions"), where("renterId", "==", targetId)),
      (snap) => setTransactionsCount(snap.size),
    );
    return () => {
      unsubItems();
      unsubTx();
    };
  };

  // PROFILE IMAGE SELECTION FROM LIBRARY
  const handlePickImage = async () => {
    if (isViewingOthers) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfilePicUrl(uri);
      setIsDirty(true);
    }
  };

  // UPDATE BIO STATE AND CHECK FOR UNSAVED CHANGES
  const handleBioChange = (text: string) => {
    setBio(text);
    setIsDirty(
      text !== originalBio.current || profilePicUrl !== originalPic.current,
    );
  };

  // SAVE UPDATED PROFILE DATA TO FIRESTORE
  const handleSave = async () => {
    if (!currentUser || !isDirty || isViewingOthers) return;

    setSaving(true);

    try {
      await setDoc(
        doc(db, "profiles", currentUser.uid),
        {
          userId: currentUser.uid,
          userEmail: currentUser.email || "",
          bio,
          profilePicUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      originalBio.current = bio;
      originalPic.current = profilePicUrl;

      setIsDirty(false);

      Alert.alert("Saved", "Your profile has been updated.");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // DELETE ACCOUNT AND ALL RELATED DATA
  const handleDeleteAccount = async () => {
    if (!currentUser) return;

    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const userId = currentUser.uid;

              // Delete all items
              const items = await getDocs(
                query(collection(db, "items"), where("ownerId", "==", userId))
              );
              for (const item of items.docs) await deleteDoc(item.ref);

              // Delete all chats + messages inside
              const chats = await getDocs(
                query(collection(db, "chats"), where("participants", "array-contains", userId))
              );
              for (const chatDoc of chats.docs) {
                const messages = await getDocs(collection(db, "chats", chatDoc.id, "messages"));
                for (const msg of messages.docs) await deleteDoc(msg.ref);
                await deleteDoc(chatDoc.ref);
              }

              // Delete transactions as renter
              const txRenter = await getDocs(
                query(collection(db, "transactions"), where("renterId", "==", userId))
              );
              for (const tx of txRenter.docs) await deleteDoc(tx.ref);

              // Delete transactions as owner
              const txOwner = await getDocs(
                query(collection(db, "transactions"), where("ownerId", "==", userId))
              );
              for (const tx of txOwner.docs) await deleteDoc(tx.ref);

              // Delete profile and user documents
              await deleteDoc(doc(db, "profiles", userId));
              await deleteDoc(doc(db, "users", userId));

              // Delete Auth account
              await currentUser.delete();

              // Redirect to login
              router.replace("/(auth)/login");
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          },
        },
      ]
    );
  };

  // GENERATE HEADER TITLE BASED ON VIEWING CONTEXT
  const getHeaderTitle = () => {
    if (!isViewingOthers) return "Profile";
    return email.split("@")[0];
  };

  // GENERATE INITIALS FOR PLACEHOLDER AVATAR
  const getInitials = () => email?.charAt(0).toUpperCase() ?? "?";

  // RENDER LOADING STATE
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color="#AF0B01" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // RENDER MAIN PROFILE CONTENT
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* TOP NAVIGATION BAR */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)/home");
            }
          }}
          style={{ padding: scale(5) }}
        >
          <Ionicons name="arrow-back" size={scale(24)} color="#222D31" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{getHeaderTitle()}</Text>
        {isDirty && !isViewingOthers ? (
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={styles.navAction}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: scale(40) }} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scale(40) }}
      >
        {/* AVATAR AND USER IDENTITY SECTION */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handlePickImage}
            activeOpacity={isViewingOthers ? 1 : 0.8}
          >
            {profilePicUrl ? (
              <Image
                source={{ uri: profilePicUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
            )}
            {!isViewingOthers && (
              <View style={styles.avatarEditBtn}>
                <Ionicons
                  name="camera-outline"
                  size={scale(11)}
                  color="#FFFFFF"
                />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{email.split("@")[0]}</Text>
          <Text style={styles.userEmail}>{email}</Text>
          {memberSince ? (
            <Text style={styles.memberSince}>Member since {memberSince}</Text>
          ) : null}
        </View>

        {/* STATISTICS SECTION */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: "#ffffff", borderColor: "#cfd4da" },
              ]}
            >
              <Text style={[styles.statNumber, { color: "#222D31" }]}>
                {listingsCount}
              </Text>
              <Text style={[styles.statLabel, { color: "#222D31" }]}>
                Listings
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: "#ffffff", borderColor: "#cfd4da" },
              ]}
            >
              <Text style={[styles.statNumber, { color: "#222D31" }]}>
                {transactionsCount}
              </Text>
              <Text style={[styles.statLabel, { color: "#222D31" }]}>
                Rentals
              </Text>
            </View>
          </View>
        </View>

        {/* ACCOUNT INFORMATION SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoRowLabel}>Email</Text>
                <Text style={[styles.infoRowValue, { fontWeight: "600" }]}>
                  {email}
                </Text>
              </View>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoRowLabel}>Account Status</Text>
                <Text
                  style={[styles.infoRowValue, { fontWeight: "600" }]}
                ></Text>
              </View>
              <View style={styles.statusBadgeVerified}>
                <Text style={styles.statusTextVerified}>VERIFIED</Text>
              </View>
            </View>
          </View>
        </View>

        {/* BIO / ABOUT ME SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Bio</Text>
          <View style={styles.infoCard}>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoRowLabel}>About Me</Text>
                <TextInput
                  style={styles.bioInput}
                  value={bio}
                  onChangeText={handleBioChange}
                  placeholder={
                    isViewingOthers
                      ? "No bio provided."
                      : "Write a short bio..."
                  }
                  placeholderTextColor="#999"
                  multiline
                  maxLength={160}
                  editable={!isViewingOthers}
                />
              </View>
            </View>
          </View>
          {!isViewingOthers && (
            <Text style={styles.charCount}>{bio.length}/160</Text>
          )}
        </View>

        {/* DELETE ACCOUNT BUTTON */}
        {!isViewingOthers && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={handleDeleteAccount}
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#FF3B30",
                borderRadius: scale(10),
                padding: scale(14),
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FF3B30", fontWeight: "600", fontSize: scale(14) }}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
