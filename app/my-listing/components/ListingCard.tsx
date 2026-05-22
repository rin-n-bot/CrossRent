import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
// My listing card with edit and delete options
import { useRouter } from "expo-router";
import { Alert, Dimensions, Text, TouchableOpacity, View } from "react-native";
import { handleItemDelete } from "../../../services/transactionService";
import { COLORS } from "../../../styles/global";
import { listingStyles as styles } from "../styles";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;

const STATUS_AVAILABLE = "Available";
const COLOR_SUCCESS_TEXT = "#27AE60";
const COLOR_ERROR_TEXT = "#AF0B01";

interface Props {
  item: any;
}

export function ListingCard({ item }: Props) {
  const router = useRouter();

  const isAvailable = item.status === STATUS_AVAILABLE;
  const backgroundColor = isAvailable ? COLOR_SUCCESS_TEXT : COLOR_ERROR_TEXT;

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
            } catch {
              Alert.alert("Error", "Failed to delete item.");
            }
          },
        },
      ],
    );
  };

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
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>
          {item.price} / {(item.rentalPeriod || "day").toLowerCase()}
        </Text>

        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: "#9CA3AF",
            marginTop: 4,
            textTransform: "capitalize",
          }}
        >
          {item.category || "Uncategorized"}
        </Text>

        {/* STATUS BADGE */}
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor,
            paddingHorizontal: scale(8),
            paddingVertical: scale(4),
            marginTop: scale(6),
            borderRadius: scale(5),
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "600",
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {item.status}
          </Text>
        </View>
      </View>

      {/* ACTION BUTTONS SECTION */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            router.push({
              pathname: "/my-listing/components/EditItem",
              params: { itemId: item.id },
            })
          }
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
}
