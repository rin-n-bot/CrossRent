// app/(tabs)/transactions/index.tsx
// Transactions screen showing lending, borrowing, completed and returned items
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
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
} from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../../firebase";
import { updateTransactionStatus } from "../../../services/transactionService";
import { scale, transStyles as styles } from "./styles";

interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  ownerId: string;
  ownerEmail: string;
  renterId: string;
  renterEmail: string;
  status: "requested" | "rented" | "completed" | "cancelled";
  itemDeleted?: boolean;
  createdAt?: Timestamp;
  statusChangedAt?: Timestamp;
  approvedAt?: Timestamp;
  completedAt?: Timestamp;
  cancelledAt?: Timestamp;
  rentPeriod?: string;
  rentPrice?: number | string;
  showToOwner?: boolean;
  showToRenter?: boolean;
}

type ViewMode = "lending" | "borrowing" | "completed" | "returned";

const COLOR_PRIMARY_RED = "#AF0B01";
const COLOR_BACKGROUND_LIGHT = "#F5F5F5";
const COLOR_DARK_MODE = "#222D31";
const COLOR_INFO_BLUE = "#1976D2";
const COLOR_INFO_LIGHT_BLUE = "#E3F2FD";
const ANIMATION_DURATION = 300;

export default function TransactionsScreen() {
  const navigationParameters = useLocalSearchParams();
  const currentUser = auth.currentUser;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTabMode, setActiveTabMode] = useState<ViewMode>("lending");
  const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    string[]
  >([]);
  const [expandedTransactionIds, setExpandedTransactionIds] = useState<
    string[]
  >([]);

  const fadeAnimationValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (navigationParameters.initialTab) {
      setActiveTabMode(navigationParameters.initialTab as ViewMode);
    }
  }, [navigationParameters.initialTab, navigationParameters.ts]);

  useEffect(() => {
    fadeAnimationValue.setValue(0);
    Animated.timing(fadeAnimationValue, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabMode]);

  useEffect(() => {
    if (!currentUser) return;

    const transactionsQuery = query(
      collection(db, "transactions"),
      or(
        where("ownerId", "==", currentUser.uid),
        where("renterId", "==", currentUser.uid),
      ),
    );

    const stopDatabaseSubscription = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactionData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        })) as Transaction[];

        setTransactions(transactionData);
        setIsLoading(false);
      },
    );

    return stopDatabaseSubscription;
  }, [currentUser]);

  const exitSelectionMode = () => {
    setIsSelectionModeActive(false);
    setSelectedTransactionIds([]);
  };

  const toggleSelection = (transactionId: string) => {
    setSelectedTransactionIds((previousIds) =>
      previousIds.includes(transactionId)
        ? previousIds.filter((id) => id !== transactionId)
        : [...previousIds, transactionId],
    );
  };

  const toggleExpandedDetails = (transactionId: string) => {
    setExpandedTransactionIds((previousIds) =>
      previousIds.includes(transactionId)
        ? previousIds.filter((id) => id !== transactionId)
        : [...previousIds, transactionId],
    );
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const isOwner = transaction.ownerId === currentUser?.uid;
      const isVisible = isOwner
        ? transaction.showToOwner !== false
        : transaction.showToRenter !== false;

      if (!isVisible) return false;

      const viewFilters: Record<ViewMode, boolean> = {
        lending:
          isOwner &&
          (transaction.status === "requested" ||
            transaction.status === "rented"),
        borrowing:
          !isOwner &&
          (transaction.status === "requested" ||
            transaction.status === "rented"),
        completed: transaction.status === "completed",
        returned: transaction.status === "cancelled",
      };

      return viewFilters[activeTabMode];
    });
  }, [transactions, activeTabMode, currentUser]);

  const handleDataRemoval = async (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction || !currentUser) return;

    const isRenter = transaction.renterId === currentUser.uid;

    try {
      if (isRenter) {
        await deleteDoc(doc(db, "transactions", transactionId));
      } else {
        await updateDoc(doc(db, "transactions", transactionId), {
          showToOwner: false,
        });
      }
    } catch {
      Alert.alert("Error", "Action failed.");
    }
  };

  const confirmBulkDelete = () => {
    if (selectedTransactionIds.length === 0) return;

    Alert.alert(
      "Remove Records",
      `This will remove ${selectedTransactionIds.length} record(s). Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: async () => {
            try {
              for (const id of selectedTransactionIds) {
                await handleDataRemoval(id);
              }
              exitSelectionMode();
            } catch {
              Alert.alert("Error", "Bulk action failed.");
            }
          },
        },
      ],
    );
  };

  const confirmReturnProcess = (transactionId: string, itemId: string) => {
    Alert.alert(
      "Confirm Return",
      "Are you sure the item has been returned safely? This will complete the transaction.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () =>
            updateTransactionStatus(transactionId, itemId, "completed"),
        },
      ],
    );
  };

  const getStatusBadgeTheme = (status: string, isDeleted: boolean) => {
    if (isDeleted) return { background: "#6B7280", text: "#fff" };

    const themeLookup: Record<string, { background: string; text: string }> = {
      requested: { background: "#E65100", text: "#fff" },
      rented: { background: "#27AE60", text: "#fff" },
      completed: { background: "#1976D2", text: "#fff" },
      cancelled: { background: "#AF0B01", text: "#fff" },
    };

    return themeLookup[status] || { background: "#000", text: "#fff" };
  };

  const getFormattedTimestamp = (timestamp?: Timestamp) => {
    if (!timestamp) return "Pending";
    const date = new Date(timestamp.seconds * 1000);
    return (
      date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " · " +
      date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const getStatusDateLabel = (item: Transaction) => {
    if (item.status === "rented") return "Approved on";
    if (item.status === "completed") return "Completed on";
    if (item.status === "cancelled") return "Cancelled on";
    return "Status update";
  };

  const getStatusDate = (item: Transaction) => {
    if (item.status === "rented")
      return item.approvedAt || item.statusChangedAt;
    if (item.status === "completed")
      return item.completedAt || item.statusChangedAt;
    if (item.status === "cancelled")
      return item.cancelledAt || item.statusChangedAt;
    return item.statusChangedAt;
  };

  const getFormattedPrice = (price?: number | string) => {
    if (price === undefined || price === null || price === "")
      return "Not specified";

    if (typeof price === "number") {
      return `₱${price.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    }

    return price;
  };

  const renderExpandedDetails = (item: Transaction) => {
    const statusDate = getStatusDate(item);

    return (
      <View style={styles.detailsPanel}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{getStatusDateLabel(item)}</Text>
          <Text style={styles.detailValue}>
            {getFormattedTimestamp(statusDate)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Rent period</Text>
          <Text style={styles.detailValue}>
            {item.rentPeriod || "Not specified"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price</Text>
          <Text style={styles.detailValue}>
            {getFormattedPrice(item.rentPrice)}
          </Text>
        </View>
      </View>
    );
  };

  const renderItemActions = (
    item: Transaction,
    isOwner: boolean,
    isItemDeleted: boolean,
  ) => {
    if (isSelectionModeActive) return null;

    if (isItemDeleted) {
      return (
        <TouchableOpacity
          style={[
            styles.messageBtn,
            { backgroundColor: COLOR_PRIMARY_RED, flex: 1, height: scale(40) },
          ]}
          onPress={() => handleDataRemoval(item.id)}
        >
          <Text style={styles.messageBtnText}>
            {isOwner ? "Remove Record" : "Delete Request"}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={{ flexDirection: "row", marginTop: scale(-2), gap: scale(10) }}
      >
        {isOwner && item.status === "requested" && (
          <>
            <TouchableOpacity
              style={[
                styles.messageBtn,
                {
                  backgroundColor: COLOR_DARK_MODE,
                  flex: 1,
                  height: scale(40),
                  marginTop: 12,
                },
              ]}
              onPress={() =>
                updateTransactionStatus(item.id, item.itemId, "rented")
              }
            >
              <Text style={[styles.messageBtnText, { fontWeight: "600" }]}>
                Approve
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.messageBtn,
                {
                  backgroundColor: COLOR_PRIMARY_RED,
                  flex: 1,
                  height: scale(40),
                  marginTop: 12,
                },
              ]}
              onPress={() =>
                updateTransactionStatus(item.id, item.itemId, "cancelled")
              }
            >
              <Text style={[styles.messageBtnText, { fontWeight: "600" }]}>
                Decline
              </Text>
            </TouchableOpacity>
          </>
        )}

        {isOwner && item.status === "rented" && (
          <TouchableOpacity
            style={[
              styles.messageBtn,
              {
                backgroundColor: COLOR_DARK_MODE,
                flex: 1,
                height: scale(40),
                marginTop: 12,
              },
            ]}
            onPress={() => confirmReturnProcess(item.id, item.itemId)}
          >
            <Text style={[styles.messageBtnText, { fontWeight: "600" }]}>
              Confirm Return
            </Text>
          </TouchableOpacity>
        )}

        {!isOwner && item.status === "requested" && (
          <TouchableOpacity
            style={[
              styles.messageBtn,
              {
                backgroundColor: COLOR_PRIMARY_RED,
                flex: 1,
                height: scale(40),
                marginTop: 12,
              },
            ]}
            onPress={() =>
              updateTransactionStatus(item.id, item.itemId, "cancelled")
            }
          >
            <Text style={[styles.messageBtnText, { fontWeight: "600" }]}>
              Cancel Request
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderTransactionCard = ({ item }: { item: Transaction }) => {
    const isOwner = item.ownerId === currentUser?.uid;
    const isSelected = selectedTransactionIds.includes(item.id);
    const isExpanded = expandedTransactionIds.includes(item.id);
    const isItemDeleted =
      item.itemDeleted === true ||
      !item.itemName ||
      item.itemName === "Deleted Item";
    const badgeTheme = getStatusBadgeTheme(item.status, isItemDeleted);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => {
          setIsSelectionModeActive(true);
          toggleSelection(item.id);
        }}
        onPress={() =>
          isSelectionModeActive ? toggleSelection(item.id) : null
        }
        style={[styles.card, isSelected && { backgroundColor: "#FFF9F9" }]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { flex: 1 }]} numberOfLines={1}>
            {isItemDeleted ? "Item no longer available" : item.itemName}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: badgeTheme.background },
            ]}
          >
            <Text style={[styles.statusTextPlain, { color: badgeTheme.text }]}>
              {isItemDeleted ? "Unavailable" : item.status}
            </Text>
          </View>
          {isSelectionModeActive && (
            <Ionicons
              name={isSelected ? "checkmark-circle" : "ellipse-outline"}
              size={22}
              color={COLOR_PRIMARY_RED}
              style={{ marginLeft: scale(10) }}
            />
          )}
        </View>

        <Text style={[styles.cardTimestamp, { fontWeight: "600" }]}>
          {isOwner
            ? `Renter: ${item.renterEmail}`
            : `Owner: ${item.ownerEmail}`}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={COLOR_PRIMARY_RED}
          />
          <Text
            style={[
              styles.cardTimestamp,
              { marginLeft: 5, marginBottom: 0, fontWeight: "600" },
            ]}
          >
            {getFormattedTimestamp(item.createdAt)}
          </Text>
        </View>

        {!isSelectionModeActive && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => toggleExpandedDetails(item.id)}
            style={styles.detailsToggle}
          >
            <Text style={styles.detailsToggleText}>
              {isExpanded ? "Hide details" : "View details"}
            </Text>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={scale(18)}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}

        {isExpanded && !isSelectionModeActive && renderExpandedDetails(item)}

        {renderItemActions(item, isOwner, isItemDeleted)}
      </TouchableOpacity>
    );
  };

  const renderScreenHeader = () => (
    <View
      style={[
        styles.topNav,
        { backgroundColor: COLOR_BACKGROUND_LIGHT },
        isSelectionModeActive && { backgroundColor: COLOR_PRIMARY_RED },
      ]}
    >
      {isSelectionModeActive && (
        <TouchableOpacity
          onPress={exitSelectionMode}
          style={{ marginRight: scale(12) }}
        >
          <Ionicons name="close-outline" size={scale(26)} color="#FFF" />
        </TouchableOpacity>
      )}

      <Text
        style={[
          styles.logoMini,
          { flex: 1, fontWeight: "600" },
          isSelectionModeActive && { color: "#FFF" },
        ]}
      >
        {isSelectionModeActive
          ? `${selectedTransactionIds.length} Selected`
          : "Transactions"}
      </Text>

      {isSelectionModeActive ? (
        <TouchableOpacity onPress={confirmBulkDelete}>
          <Ionicons name="trash-outline" size={scale(24)} color="#FFF" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setIsSelectionModeActive(true)}>
          <Text style={{ fontWeight: "600", color: COLOR_PRIMARY_RED }}>
            Select
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTabBar = () => {
    if (isSelectionModeActive) return null;
    const tabOptions: ViewMode[] = [
      "lending",
      "borrowing",
      "completed",
      "returned",
    ];

    return (
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: scale(10),
          backgroundColor: COLOR_BACKGROUND_LIGHT,
        }}
      >
        {tabOptions.map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => setActiveTabMode(mode)}
            style={{
              flex: 1,
              paddingVertical: scale(12),
              borderBottomWidth: 2,
              borderBottomColor:
                activeTabMode === mode ? COLOR_PRIMARY_RED : "transparent",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: scale(13),
                fontWeight: "600",
                color: activeTabMode === mode ? COLOR_PRIMARY_RED : "#9CA3AF",
              }}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderLendingDisclaimer = () => {
    if (isSelectionModeActive || activeTabMode !== "lending") return null;

    return (
      <View
        style={{
          marginTop: scale(15),
          marginHorizontal: scale(20),
          padding: scale(15),
          borderRadius: scale(12),
          backgroundColor: COLOR_INFO_LIGHT_BLUE,
          borderWidth: 1,
          borderColor: COLOR_INFO_BLUE,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: scale(6),
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={scale(18)}
            color={COLOR_INFO_BLUE}
          />
          <Text
            style={{
              fontSize: scale(13),
              fontWeight: "600",
              color: COLOR_INFO_BLUE,
              marginLeft: scale(6),
            }}
          >
            Disclaimer
          </Text>
        </View>
        <Text
          style={{
            fontSize: scale(13),
            lineHeight: scale(18),
            color: COLOR_INFO_BLUE,
            fontWeight: "500",
          }}
        >
          All transactions are made between users outside the app.
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={{ alignItems: "center", marginTop: scale(200) }}>
      <Ionicons name="receipt-outline" size={scale(60)} color="#cfd4da" />
      <Text
        style={[
          styles.noResultsText,
          { marginTop: scale(10), fontWeight: "500" },
        ]}
      >
        No records found in {activeTabMode}.
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: COLOR_BACKGROUND_LIGHT },
        isSelectionModeActive && { backgroundColor: COLOR_PRIMARY_RED },
      ]}
    >
      <StatusBar
        barStyle={isSelectionModeActive ? "light-content" : "dark-content"}
      />

      {renderScreenHeader()}
      {renderTabBar()}

      <Animated.View
        style={{
          flex: 1,
          backgroundColor: COLOR_BACKGROUND_LIGHT,
          opacity: fadeAnimationValue,
        }}
      >
        {renderLendingDisclaimer()}

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator color={COLOR_PRIMARY_RED} size="large" />
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransactionCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              padding: scale(20),
              paddingBottom: scale(100),
            }}
            ListEmptyComponent={renderEmptyState()}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
