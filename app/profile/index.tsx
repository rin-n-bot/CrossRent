import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { auth, db } from '../../firebase';
import { profileStyles as styles, scale } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';


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
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [listingsCount, setListingsCount] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);


  // PERSISTENT STORAGE FOR ORIGINAL DATA COMPARISON
  const originalBio = useRef('');
  const originalPic = useRef('');


  // DATA INITIALIZATION ON COMPONENT MOUNT OR TARGET CHANGE
  useEffect(() => {
    if (!targetId) return;
    setBio('');
    setProfilePicUrl('');
    setMemberSince('');
    setEmail('');
    setIsDirty(false);
    originalBio.current = '';
    originalPic.current = '';

    fetchProfile();
      const cleanup = fetchStats();
      return () => { cleanup?.(); };
  }, [targetId]);


  // FETCH USER PROFILE AND ACCOUNT DETAILS FROM FIRESTORE
  const fetchProfile = async () => {
    try {
      const profileSnap = await getDoc(doc(db, 'profiles', targetId));
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        const fetchedBio = data.bio || '';
        setBio(fetchedBio);
        originalBio.current = fetchedBio;
        setProfilePicUrl(data.profilePicUrl || '');
        originalPic.current = data.profilePicUrl || '';
      }

      const userSnap = await getDoc(doc(db, 'users', targetId));
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setEmail(userData.email || '');
        if (userData.lastLogin?.seconds) {
          const date = new Date(userData.lastLogin.seconds * 1000);
          setMemberSince(date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }));
        }
      }
    } catch (e) {
      console.error('fetchProfile error:', e);
    } finally {
      setLoading(false);
    }
  };


  // REAL-TIME LISTENERS FOR USER STATISTICS
  const fetchStats = () => {
    if (!targetId) return;
    const unsubItems = onSnapshot(
      query(collection(db, 'items'), where('ownerId', '==', targetId)),
      (snap) => setListingsCount(snap.size)
    );
    const unsubTx = onSnapshot(
      query(collection(db, 'transactions'), where('renterId', '==', targetId)),
      (snap) => setTransactionsCount(snap.size)
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
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
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
    setIsDirty(text !== originalBio.current || profilePicUrl !== originalPic.current);
  };


  // SAVE UPDATED PROFILE DATA TO FIRESTORE
  const handleSave = async () => {
    if (!currentUser || !isDirty || isViewingOthers) return;
    if (bio === originalBio.current && profilePicUrl === originalPic.current) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'profiles', currentUser.uid), { bio, profilePicUrl, updatedAt: serverTimestamp() }, { merge: true });
      originalBio.current = bio;
      originalPic.current = profilePicUrl;
      setIsDirty(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };


  // GENERATE HEADER TITLE BASED ON VIEWING CONTEXT
  const getHeaderTitle = () => {
    if (!isViewingOthers) return "Profile";
    return email.split('@')[0];
  };


  // GENERATE INITIALS FOR PLACEHOLDER AVATAR
  const getInitials = () => email?.charAt(0).toUpperCase() ?? '?';


  // RENDER LOADING STATE
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
        <TouchableOpacity onPress={() => router.back()} style={{ padding: scale(5) }}>
          <Ionicons name="arrow-back" size={scale(24)} color="#222D31" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{getHeaderTitle()}</Text>
        {isDirty && !isViewingOthers ? (
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={styles.navAction}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: scale(40) }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: scale(40) }}>
        
        {/* AVATAR AND USER IDENTITY SECTION */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handlePickImage}
            activeOpacity={isViewingOthers ? 1 : 0.8}
          >
            {profilePicUrl ? (
              <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
            )}
            {!isViewingOthers && (
              <View style={styles.avatarEditBtn}>
                <Ionicons name="camera-outline" size={scale(11)} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{email.split('@')[0]}</Text>
          <Text style={styles.userEmail}>{email}</Text>
          {memberSince ? <Text style={styles.memberSince}>Member since {memberSince}</Text> : null}
        </View>

        {/* STATISTICS SECTION */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#ffffff', borderColor: '#cfd4da' }]}>
              <Text style={[styles.statNumber, { color: '#222D31' }]}>{listingsCount}</Text>
              <Text style={[styles.statLabel, { color: '#222D31' }]}>Listings</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#ffffff', borderColor: '#cfd4da' }]}>
              <Text style={[styles.statNumber, { color: '#222D31' }]}>{transactionsCount}</Text>
              <Text style={[styles.statLabel, { color: '#222D31' }]}>Rentals</Text>
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
                <Text style={[styles.infoRowValue, { fontWeight: '700' }]}>{email}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoRowLabel}>Account Status</Text>
                <Text style={[styles.infoRowValue,{ fontWeight: '700' }]}></Text>
              </View>
              <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: scale(8), paddingVertical: scale(3), borderRadius: scale(5) }}>
                <Text style={{ fontSize: scale(10), fontWeight: '700', color: '#27AE60', textTransform: 'uppercase' }}>Verified</Text>
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
                  placeholder={isViewingOthers ? "No bio provided." : "Write a short bio..."}
                  placeholderTextColor="#999"
                  multiline
                  maxLength={160}
                  editable={!isViewingOthers}
                />
              </View>
            </View>
          </View>
          {!isViewingOthers && <Text style={styles.charCount}>{bio.length}/160</Text>}
        </View>

        {/* FLOATING SAVE ACTION BUTTON */}
        {isDirty && !isViewingOthers && (
          <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Ionicons name="checkmark-circle-outline" size={scale(18)} color="#FFF" />}
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}