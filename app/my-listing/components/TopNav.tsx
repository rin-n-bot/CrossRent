import { Ionicons } from "@expo/vector-icons";
// My listings screen header with navigation and action buttons
import {  useRouter } from "expo-router";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;

export function TopNav() {
  const router = useRouter();
  const navigation = useNavigation();


  const handleBack = () => {
  if (navigation.canGoBack()) {
    router.back();
  } else {
    router.replace('/(tabs)/home');
  }
};


  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: scale(20),
        height: scale(60),
      }}
    >
      <TouchableOpacity onPress={handleBack} style={{ padding: scale(5) }}>
        <Ionicons name="arrow-back" size={scale(24)} color="#222D31" />
     </TouchableOpacity>

      <Text
        style={{
          flex: 1,
          marginLeft: scale(15),
          fontSize: scale(20),
          fontWeight: "600",
          color: "#222D31",
          letterSpacing: -1,
        }}
      >
        My Listings
      </Text>

      <View style={{ width: scale(40) }} />
    </View>
  );
}
