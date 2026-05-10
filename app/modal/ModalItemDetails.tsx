import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { scale, styles } from '../(tabs)/home/styles';
import { auth, db } from '../../firebase';
import { handleRentRequest } from '../../services/transactionService';


// Interface for component props
interface ModalItemDetailsProps {
  selectedItem: any;
  setSelectedItem: (item: any) => void;
}


// Date Formatting
const formatPostedDate = (raw: any): string => {
  let date: Date | null = null;
  if (!raw) return 'Recently';
  if (raw?.seconds) date = new Date(raw.seconds * 1000);
  else if (typeof raw === 'string') return raw;
  else if (raw instanceof Date) date = raw;
  if (!date || isNaN(date.getTime())) return 'Recently';
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};


// Main component
export const ModalItemDetails = ({ selectedItem, setSelectedItem }: ModalItemDetailsProps) => {


  // Navigation and Authentication hooks
  const router = useRouter();
  const user = auth.currentUser;
  const isOwner = user?.uid === selectedItem?.ownerId;


  // State
  const [ownerPhoto, setOwnerPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  // Fetch owner profile image
  useEffect(() => {
    if (!selectedItem?.ownerId) return;
    setOwnerPhoto(null);
    getDoc(doc(db, 'profiles', selectedItem.ownerId)).then((snap) => {
      if (snap.exists()) setOwnerPhoto(snap.data().profilePicUrl || null);
    });
  }, [selectedItem?.ownerId]);


  // Logic to determine button action based on ownership
  const handleActionTrigger = () => {
    if (!user) {
      Alert.alert('Authentication', 'Please log in to continue.');
      return;
    }

    if (isOwner) {
      setSelectedItem(null);
      router.push({
        pathname: '../my-listing/components/EditItem',
        params: { itemId: selectedItem.id },
      });
      return;
    }

    if (selectedItem.status === 'rented') {
      Alert.alert('Unavailable', 'This item is currently rented.');
      return;
    }

    processRentalRequest();
  };


  // Firebase processing rental requests logic
  const processRentalRequest = async () => {
    setLoading(true);
    try {
      const transactionsRef = collection(db, 'transactions');
      const qCheck = query(
        transactionsRef,
        where('itemId', '==', selectedItem.id),
        where('renterId', '==', user!.uid),
        where('status', 'in', ['requested', 'rented'])
      );
      const existingRequests = await getDocs(qCheck);
      if (!existingRequests.empty) {
        Alert.alert(
          'Notice',
          'You already have an active request or an ongoing rental for this item. Check your Transactions.'
        );

        setLoading(false);
        return;
      }

      await handleRentRequest(selectedItem, user);

      const participants = [user!.uid, selectedItem.ownerId].sort();
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', '==', participants));
      const chatQuerySnapshot = await getDocs(q);

      let chatId: string;
      let isNewChat = false;
      if (chatQuerySnapshot.empty) {

        chatId = doc(collection(db, 'chats')).id;
        isNewChat = true;
      } else {
        chatId = chatQuerySnapshot.docs[0].id;
      }

      const timestamp = new Date().toLocaleString();
      const requestMessage =
        `📢 NEW RENTAL REQUEST\n\n` +
        `Item: ${selectedItem.name}\n` +
        `Renter: ${user!.email}\n` +
        `Date/Time: ${timestamp}\n\n` +
        `Check status in Transactions.`;

      const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: requestMessage,
        senderId: user!.uid,
        senderEmail: user!.email,
        createdAt: serverTimestamp(),
        isSystem: true,
      });

      if (!messageRef.id) {
        throw new Error('Failed to create message - chat not initialized');
      }

      await setDoc(
        doc(db, 'chats', chatId),
        {
          participants, 
          lastMessage: `Requested: ${selectedItem.name}`,
          lastSenderEmail: user!.email,
          updatedAt: serverTimestamp(),
          ...(isNewChat && { readBy: [] }), 
        },
        { merge: true } 
      );

      Alert.alert('Success', 'Rental request sent to owner!');
      setSelectedItem(null);

      router.replace({
        pathname: '/(tabs)/transactions',
        params: { initialTab: 'borrowing', ts: Date.now().toString() },
      });
    } catch (error) {
      console.error('Action Error: ', error);
      Alert.alert('Error', 'Failed to process request.');
    } finally {
      setLoading(false);
    }
  };


  // Main render
  return (
    <View>


      <Modal
        visible={selectedItem !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedItem(null)}
      >
        <SafeAreaView style={styles.modalContainer}>

          {/* UI HEADER SECTION */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedItem(null)} style={{ padding: scale(5) }}>
              <Ionicons name="arrow-back" size={scale(24)} color="#222D31" />
            </TouchableOpacity>

            <Text style={[styles.modalHeaderTitle, { flex: 1, marginLeft: scale(15) }]}>
              Item Details
            </Text>

            <View style={{ width: scale(24) }} />
          </View>

          {/* UI SCROLLABLE CONTENT SECTION */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            

            <Image
              source={{ uri: selectedItem?.imageUrl || selectedItem?.image }}
              style={styles.modalImage}
            />

            <View style={styles.modalInfoSection}>

              {/* CATEGORY AND STATUS BADGE DISPLAY */}
              <View style={styles.modalRow}>
                <Text style={styles.modalCategory}>{selectedItem?.category}</Text>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        selectedItem?.status === 'Available' || selectedItem?.status === 'pending'
                          ? '#E8F5E9'
                          : '#FFEBEE',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTextPlain,
                      {
                        color:
                          selectedItem?.status === 'Available' || selectedItem?.status === 'pending'
                            ? '#27AE60'
                            : '#AF0B01',
                      },
                    ]}
                  >
                    {selectedItem?.status}
                  </Text>
                </View>
              </View>

              {/* TITLE AND PRICING DISPLAY */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: scale(10)
              }}>
                
                <Text 
                  style={[styles.modalTitle, { flex: 1, marginRight: scale(10), fontWeight: 700 }]}
                  numberOfLines={2}
                >
                  {selectedItem?.name || selectedItem?.title}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={[styles.modalPrice, { marginBottom: 0, fontWeight: 600 }]}>
                    {selectedItem?.price}
                  </Text>

                  {selectedItem?.rentalPeriod && (
                    <Text style={[styles.modalPrice, { 
                      marginBottom: 0, 
                      fontSize: scale(16), 
                      color: '#1976D2' 
                    }]}>
                      {' '}/ {selectedItem.rentalPeriod}
                    </Text>
                  )}
                </View>

              </View>

              <View style={[styles.divider, { marginBottom: scale(20) }]} />

              {/* DATA CARD FOR OWNER INFO, DESCRIPTION, AND LOCATION */}
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: scale(12), overflow: 'hidden' }}>


                <View style={{ paddingHorizontal: scale(15), paddingVertical: scale(14), borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
                  <Text style={{ fontSize: scale(13), fontWeight: '700', color: '#9CA3AF' }}>Owner</Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scale(4) }}>
                    <View
                      style={{
                        width: scale(28),
                        height: scale(28),
                        borderRadius: scale(14),
                        backgroundColor: '#222D31',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: scale(10),
                        overflow: 'hidden',
                      }}
                    >
                      {ownerPhoto ? (
                        <Image source={{ uri: ownerPhoto }} style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: scale(10) }}>
                          {selectedItem?.ownerEmail?.charAt(0).toUpperCase() ?? '?'}
                        </Text>
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text 
                        style={{ fontSize: scale(15), fontWeight: '700', color: '#222D31' }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {selectedItem?.ownerEmail || 'Not provided'}
                      </Text>
                    </View>
                  </View>
                </View>


                <View style={{ paddingHorizontal: scale(15), paddingVertical: scale(14), borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
                  <Text style={{ fontSize: scale(13), fontWeight: '700', color: '#9CA3AF' }}>Description</Text>

                  <Text style={{ fontSize: scale(15), fontWeight: '600', color: '#222D31', marginTop: scale(4), lineHeight: scale(20) }}>
                    {selectedItem?.description || 'No description provided.'}
                  </Text>
                </View>


                <View style={{ paddingHorizontal: scale(15), paddingVertical: scale(14), borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
                  <Text style={{ fontSize: scale(13), fontWeight: '700', color: '#9CA3AF' }}>Location</Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scale(4) }}>
                    <Ionicons name="location-outline" size={scale(16)} color="#AF0B01" />

                    <View style={{ flex: 1 }}>
                      <Text 
                        style={{ fontSize: scale(15), fontWeight: '600', color: '#222D31', marginLeft: scale(5) }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {selectedItem?.location}
                      </Text>
                    </View>
                  </View>
                </View>


                <View style={{ paddingHorizontal: scale(15), paddingVertical: scale(14) }}>
                  <Text style={{ fontSize: scale(13), fontWeight: '700', color: '#9CA3AF' }}>Posted On</Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scale(4) }}>
                    <Ionicons name="time-outline" size={scale(16)} color="#AF0B01" />

                    <Text style={{ fontSize: scale(15), fontWeight: '600', color: '#222D31', marginLeft: scale(5) }}>
                      {formatPostedDate(selectedItem?.createdAt || selectedItem?.timestamp)}
                    </Text>
                  </View>
                </View>

              </View>

              {/* LEGAL AND PLATFORM DISCLAIMER */}
              <View style={{
                marginTop: scale(15),
                padding: scale(15),
                borderRadius: scale(12),
                backgroundColor: '#E3F2FD',
                borderWidth: 1,
                borderColor: '#1976D2'
              }}>

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: scale(6)
                }}>
                  <Ionicons name="information-circle-outline" size={scale(18)} color="#1976D2" />

                  <Text style={{
                    fontSize: scale(13),
                    fontWeight: '700',
                    color: '#1976D2',
                    marginLeft: scale(6)
                  }}>
                    Disclaimer
                  </Text>
                </View>

                <Text style={{
                  fontSize: scale(13),
                  lineHeight: scale(18),
                  fontWeight: 500,
                  color: '#1976D2'
                }}>
                  Please note that our platform does not handle payments directly.
                </Text>

              </View>

            </View>
          </ScrollView>

          {/* UI FOOTER SECTION WITH ACTION BUTTON */}
          <View style={[styles.modalFooter, { paddingBottom: Platform.OS === 'ios' ? scale(30) : scale(15) }]}>
            <TouchableOpacity
              style={[styles.messageBtn, { borderRadius: scale(50), height: scale(46), marginHorizontal: scale(5) }]}
              onPress={handleActionTrigger}
            >
              <Ionicons
                name={isOwner ? 'create-outline' : 'chatbubble-ellipses-outline'}
                size={scale(20)}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />

              <Text style={styles.messageBtnText}>
                {isOwner
                  ? 'Edit Item'
                  : selectedItem?.status === 'rented'
                  ? 'Not Available'
                  : 'Rent Now'}
              </Text>
            </TouchableOpacity>
          </View>


        </SafeAreaView>
      </Modal>


    </View>
  );
};