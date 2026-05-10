import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  or,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth, db } from '../../../firebase';
import { updateTransactionStatus } from '../../../services/transactionService';
import { scale, transStyles as styles } from './styles';

interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  ownerId: string;
  ownerEmail: string;
  renterId: string;
  renterEmail: string;
  status: 'requested' | 'rented' | 'completed' | 'cancelled';
  itemDeleted?: boolean;
  createdAt?: Timestamp;
  showToOwner?: boolean;
  showToRenter?: boolean;
}

type ViewMode = 'lending' | 'borrowing' | 'completed' | 'returned';


// Standard colors and timing used throughout the screen
const COLOR_PRIMARY_RED = '#AF0B01';
const COLOR_BACKGROUND_LIGHT = '#F5F5F5';
const COLOR_DARK_MODE = '#222D31';
const COLOR_INFO_BLUE = '#1976D2';
const COLOR_INFO_LIGHT_BLUE = '#E3F2FD';
const ANIMATION_DURATION = 300;

export default function TransactionsScreen() {
  const router = useRouter();
  const navigationParameters = useLocalSearchParams();
  const currentUser = auth.currentUser;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTabMode, setActiveTabMode] = useState<ViewMode>('lending');
  const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);
  
  const fadeAnimationValue = useRef(new Animated.Value(1)).current;

  
  // Set the active tab based on incoming navigation parameters
  useEffect(() => {
    if (navigationParameters.initialTab) {
      setActiveTabMode(navigationParameters.initialTab as ViewMode);
    }
  }, [navigationParameters.initialTab, navigationParameters.ts]);


  // Run a fade animation whenever the user switches between tabs
  useEffect(() => {
    fadeAnimationValue.setValue(0);
    Animated.timing(fadeAnimationValue, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [activeTabMode]);


  // Listen to the transactions collection for changes involving the current user
  useEffect(() => {
    if (!currentUser) return;
    
    const transactionsQuery = query(
      collection(db, 'transactions'),
      or(
        where('ownerId', '==', currentUser.uid),
        where('renterId', '==', currentUser.uid)
      )
    );

    const stopDatabaseSubscription = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionData = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as Transaction[];
      
      setTransactions(transactionData);
      setIsLoading(false);
    });

    return stopDatabaseSubscription;
  }, [currentUser]);


  // Turn off selection mode and clear the list of checked items
  const exitSelectionMode = () => {
    setIsSelectionModeActive(false);
    setSelectedTransactionIds([]);
  };


  // Add or remove a transaction ID from the current selection list
  const toggleSelection = (transactionId: string) => {
    setSelectedTransactionIds((previousIds) =>
      previousIds.includes(transactionId)
        ? previousIds.filter((id) => id !== transactionId)
        : [...previousIds, transactionId]
    );
  };


  // Filter transactions based on whether the user is the owner or renter and the current tab
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const isOwner = transaction.ownerId === currentUser?.uid;
      const isVisible = isOwner ? transaction.showToOwner !== false : transaction.showToRenter !== false;
      
      if (!isVisible) return false;

      const viewFilters: Record<ViewMode, boolean> = {
        lending: isOwner && (transaction.status === 'requested' || transaction.status === 'rented'),
        borrowing: !isOwner && (transaction.status === 'requested' || transaction.status === 'rented'),
        completed: transaction.status === 'completed',
        returned: transaction.status === 'cancelled',
      };

      return viewFilters[activeTabMode];
    });
  }, [transactions, activeTabMode, currentUser]);


  // Handle hiding the record for owners or permanent deletion for renters
  const handleDataRemoval = async (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction || !currentUser) return;

    const isRenter = transaction.renterId === currentUser.uid;

    try {
      if (isRenter) {
        await deleteDoc(doc(db, 'transactions', transactionId));
      } else {
        await updateDoc(doc(db, 'transactions', transactionId), { showToOwner: false });
      }
    } catch (error) {
      Alert.alert('Error', 'Action failed.');
    }
  };


  // Show a confirmation popup before removing multiple selected items
  const confirmBulkDelete = () => {
    if (selectedTransactionIds.length === 0) return;
    
    Alert.alert(
      'Remove Records',
      `This will remove ${selectedTransactionIds.length} record(s). Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const id of selectedTransactionIds) {
                await handleDataRemoval(id);
              }
              exitSelectionMode();
            } catch (e) {
              Alert.alert('Error', 'Bulk action failed.');
            }
          },
        },
      ]
    );
  };


  // Ask for confirmation before completing a transaction via item return
  const confirmReturnProcess = (transactionId: string, itemId: string) => {
    Alert.alert(
      'Confirm Return',
      'Are you sure the item has been returned safely? This will complete the transaction.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => updateTransactionStatus(transactionId, itemId, 'completed')
        }
      ]
    );
  };


  // Determine the background and text color for the status badge
  const getStatusBadgeTheme = (status: string, isDeleted: boolean) => {
    if (isDeleted) return { background: '#F3F4F6', text: '#6B7280' };
    
    const themeLookup: Record<string, { background: string; text: string }> = {
      requested: { background: '#FFF3E0', text: '#E65100' },
      rented: { background: '#E8F5E9', text: '#27AE60' },
      completed: { background: '#E3F2FD', text: '#1976D2' },
      cancelled: { background: '#FFEBEE', text: '#AF0B01' },
    };

    return themeLookup[status] || { background: '#F3F4F6', text: '#000' };
  };


  // Convert the Firebase timestamp into a readable date and time string
  const getFormattedTimestamp = (timestamp?: Timestamp) => {
    if (!timestamp) return 'Pending';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' · ' + date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  // Show action buttons like Approve, Decline, or Confirm Return
  const renderItemActions = (item: Transaction, isOwner: boolean, isItemDeleted: boolean) => {
    if (isSelectionModeActive) return null;

    if (isItemDeleted) {
      return (
        <TouchableOpacity
          style={[styles.messageBtn, { backgroundColor: COLOR_PRIMARY_RED, flex: 1, height: scale(40) }]}
          onPress={() => handleDataRemoval(item.id)}
        >
          <Text style={styles.messageBtnText}>{isOwner ? 'Remove Record' : 'Delete Request'}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={{ flexDirection: 'row', marginTop: scale(15), gap: scale(10) }}>
        {isOwner && item.status === 'requested' && (
          <>
            <TouchableOpacity
              style={[styles.messageBtn, { backgroundColor: COLOR_DARK_MODE, flex: 1, height: scale(40) }]}
              onPress={() => updateTransactionStatus(item.id, item.itemId, 'rented')}
            >
              <Text style={[styles.messageBtnText, { fontWeight: 700 }]}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.messageBtn, { backgroundColor: COLOR_PRIMARY_RED, flex: 1, height: scale(40) }]}
              onPress={() => updateTransactionStatus(item.id, item.itemId, 'cancelled')}
            >
              <Text style={[styles.messageBtnText, { fontWeight: 700 }]}>Decline</Text>
            </TouchableOpacity>
          </>
        )}

        {isOwner && item.status === 'rented' && (
          <TouchableOpacity
            style={[styles.messageBtn, { backgroundColor: COLOR_DARK_MODE, flex: 1, height: scale(40) }]}
            onPress={() => confirmReturnProcess(item.id, item.itemId)}
          >
            <Text style={[styles.messageBtnText, { fontWeight: 700 }]}>Confirm Return</Text>
          </TouchableOpacity>
        )}

        {!isOwner && item.status === 'requested' && (
          <TouchableOpacity
            style={[styles.messageBtn, { backgroundColor: COLOR_PRIMARY_RED, flex: 1, height: scale(40) }]}
            onPress={() => updateTransactionStatus(item.id, item.itemId, 'cancelled')}
          >
            <Text style={[styles.messageBtnText, { fontWeight: 700 }]}>Cancel Request</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };


  // Define how each transaction card is displayed in the list
  const renderTransactionCard = ({ item }: { item: Transaction }) => {
    const isOwner = item.ownerId === currentUser?.uid;
    const isSelected = selectedTransactionIds.includes(item.id);
    const isItemDeleted = item.itemDeleted === true || !item.itemName || item.itemName === 'Deleted Item';
    const badgeTheme = getStatusBadgeTheme(item.status, isItemDeleted);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => {
          setIsSelectionModeActive(true);
          toggleSelection(item.id);
        }}
        onPress={() => (isSelectionModeActive ? toggleSelection(item.id) : null)}
        style={[styles.card, isSelected && { backgroundColor: '#FFF9F9' }]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { flex: 1 }]} numberOfLines={1}>
            {isItemDeleted ? 'Item no longer available' : item.itemName}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: badgeTheme.background }]}>
            <Text style={[styles.statusTextPlain, { color: badgeTheme.text }]}>
              {isItemDeleted ? 'Unavailable' : item.status}
            </Text>
          </View>
          {isSelectionModeActive && (
            <Ionicons
              name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={COLOR_PRIMARY_RED}
              style={{ marginLeft: scale(10) }}
            />
          )}
        </View>

        <Text style={[styles.cardTimestamp, { fontWeight: 700 }]}>
          {isOwner ? `Renter: ${item.renterEmail}` : `Owner: ${item.ownerEmail}`}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="calendar-outline" size={14} color={COLOR_PRIMARY_RED} />
          <Text style={[styles.cardTimestamp, { marginLeft: 5, marginBottom: 0, fontWeight: 600 }]}>
            {getFormattedTimestamp(item.createdAt)}
          </Text>
        </View>

        {renderItemActions(item, isOwner, isItemDeleted)}
      </TouchableOpacity>
    );
  };


  // Show the header title and the Select or Trash icons
  const renderScreenHeader = () => (
    <View style={[styles.topNav, { backgroundColor: COLOR_BACKGROUND_LIGHT }, isSelectionModeActive && { backgroundColor: COLOR_PRIMARY_RED }]}>
      {isSelectionModeActive && (
        <TouchableOpacity onPress={exitSelectionMode} style={{ marginRight: scale(12) }}>
          <Ionicons name="close-outline" size={scale(26)} color="#FFF" />
        </TouchableOpacity>
      )}

      <Text style={[styles.logoMini, { flex: 1, fontWeight: 700 }, isSelectionModeActive && { color: '#FFF' }]}>
        {isSelectionModeActive ? `${selectedTransactionIds.length} Selected` : 'Transactions'}
      </Text>

      {isSelectionModeActive ? (
        <TouchableOpacity onPress={confirmBulkDelete}>
          <Ionicons name="trash-outline" size={scale(24)} color="#FFF" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setIsSelectionModeActive(true)}>
          <Text style={{ fontWeight: '700', color: COLOR_PRIMARY_RED }}>Select</Text>
        </TouchableOpacity>
      )}
    </View>
  );


  // Show the tab bar used to switch between lending, borrowing, and completed
  const renderTabBar = () => {
    if (isSelectionModeActive) return null;
    const tabOptions: ViewMode[] = ['lending', 'borrowing', 'completed', 'returned'];

    return (
      <View style={{ flexDirection: 'row', paddingHorizontal: scale(10), backgroundColor: COLOR_BACKGROUND_LIGHT }}>
        {tabOptions.map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => setActiveTabMode(mode)}
            style={{
              flex: 1,
              paddingVertical: scale(12),
              borderBottomWidth: 2,
              borderBottomColor: activeTabMode === mode ? COLOR_PRIMARY_RED : 'transparent',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: scale(13),
                fontWeight: '700',
                color: activeTabMode === mode ? COLOR_PRIMARY_RED : '#9CA3AF',
              }}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };


  // Show a disclaimer box specifically when the user is on the Lending tab
  const renderLendingDisclaimer = () => {
    if (isSelectionModeActive || activeTabMode !== 'lending') return null;

    return (
      <View style={{
        marginTop: scale(15),
        marginHorizontal: scale(20),
        padding: scale(15),
        borderRadius: scale(12),
        backgroundColor: COLOR_INFO_LIGHT_BLUE,
        borderWidth: 1,
        borderColor: COLOR_INFO_BLUE
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale(6) }}>
          <Ionicons name="information-circle-outline" size={scale(18)} color={COLOR_INFO_BLUE} />
          <Text style={{ fontSize: scale(13), fontWeight: '700', color: COLOR_INFO_BLUE, marginLeft: scale(6) }}>
            Disclaimer
          </Text>
        </View>
        <Text style={{ fontSize: scale(13), lineHeight: scale(18), color: COLOR_INFO_BLUE, fontWeight: 500}}>
          All transactions are made between users outside the app.
        </Text>
      </View>
    );
  };


  // Display a placeholder message when there are no transactions to show
  const renderEmptyState = () => (
    <View style={{ alignItems: 'center', marginTop: scale(200) }}>
      <Ionicons name="receipt-outline" size={scale(60)} color="#cfd4da" />
      <Text style={[styles.noResultsText, { marginTop: scale(10), fontWeight: 600 }]}>
        No records found in {activeTabMode}.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLOR_BACKGROUND_LIGHT }, isSelectionModeActive && { backgroundColor: COLOR_PRIMARY_RED }]}>
      <StatusBar barStyle={isSelectionModeActive ? 'light-content' : 'dark-content'} />

      {renderScreenHeader()}
      {renderTabBar()}

      <Animated.View style={{ flex: 1, backgroundColor: COLOR_BACKGROUND_LIGHT, opacity: fadeAnimationValue }}>
        {renderLendingDisclaimer()}

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator color={COLOR_PRIMARY_RED} size="large" />
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransactionCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: scale(20), paddingBottom: scale(100) }}
            ListEmptyComponent={renderEmptyState()}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}