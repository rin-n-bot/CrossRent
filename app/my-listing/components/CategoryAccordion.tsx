// Expandable category accordion for filtering listings
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../../styles/global";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;

interface Category {
  id: string;
  displayName: string;
}

interface Props {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryAccordion({
  categories,
  activeCategory,
  onSelectCategory,
}: Props) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const accordionAnim = useRef(new Animated.Value(0)).current;

  const toggleCategory = () => {
    const toValue = isCategoryOpen ? 0 : 1;
    Animated.spring(accordionAnim, {
      toValue,
      useNativeDriver: false,
      friction: 8,
    }).start();
    setIsCategoryOpen(!isCategoryOpen);
  };

  const arrowRotation = accordionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "0deg"],
  });

  const accordionMaxHeight = accordionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <View
      style={{
        backgroundColor: COLORS.background,
        paddingHorizontal: scale(20),
      }}
    >
      <TouchableOpacity
        onPress={toggleCategory}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: scale(10),
        }}
      >
        <Text
          style={{ fontSize: scale(13), fontWeight: "600", color: "#9CA3AF" }}
        >
          {activeCategory === "All"
            ? "All Categories"
            : activeCategory
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
        </Text>
        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          <Ionicons name="chevron-down" size={scale(18)} color="#AF0B01" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View
        style={{ overflow: "hidden", maxHeight: accordionMaxHeight }}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            paddingVertical: scale(10),
          }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const pillWidth = (width - scale(40) - scale(20)) / 3;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  onSelectCategory(cat.id);
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
                  borderColor: isActive ? "#222D31" : "#ffffff",
                  backgroundColor: isActive ? "#222D31" : "#FFF",
                  alignItems: "center",
                  marginBottom: scale(10),
                }}
              >
                <Text
                  style={{
                    fontSize: scale(11),
                    fontWeight: "600",
                    color: isActive ? "#FFF" : "#666",
                    textAlign: "center",
                  }}
                >
                  {cat.displayName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}
