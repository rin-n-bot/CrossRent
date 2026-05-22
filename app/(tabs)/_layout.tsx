// Tab navigator with animated capsule-style custom navigation bar
import Ionicons from "@expo/vector-icons/Ionicons";
import NetInfo from "@react-native-community/netinfo";
import { Redirect, Tabs, router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

// Screen-relative scale
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = (size: number) => (SCREEN_WIDTH / 390) * size;

// Navigation configuration
const NAV_HEIGHT = scale(70);
const ICON_SIZE = scale(24);
const LABEL_SIZE = scale(11);
const PILL_WIDTH = scale(56);
const PILL_HEIGHT = scale(30);
const ADD_BTN_SIZE = scale(48);
const BANNER_APPEAR_DELAY = 1500;
const BANNER_ONLINE_DURATION = 3000;
const TAB_ROUTE_NAMES = ["home/index", "chat/index", "transactions/index"];

const COLORS = {
  active: "#AF0B01",
  activeLabel: "#AF0B01",
  inactive: "rgba(0,0,0,0.35)",
  navBg: "#ffffff",
  addBtn: "#AF0B01",
  online: "#1D9E75",
  white: "#fff",
  bannerClose: "rgba(255,255,255,0.2)",
};

// Main layout component for the tab navigator, handling authentication and rendering the custom capsule navigation
const ROUTES: Record<string, { icon: string; label: string }> = {
  home: { icon: "home", label: "Home" },
  chat: { icon: "chatbubbles", label: "Chats" },
  transactions: { icon: "swap-horizontal", label: "Transact" },
};

// Main Tabs layout component
export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#AF0B01" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: "fade" }}
      tabBar={(props) => <CapsuleNav {...props} />}
    >
      <Tabs.Screen name="home/index" options={{ title: "Home" }} />
      <Tabs.Screen name="chat/index" options={{ title: "Chats" }} />
      <Tabs.Screen
        name="transactions/index"
        options={{ title: "Transactions" }}
      />
    </Tabs>
  );
}

// Component for each individual tab item in the capsule navigation
function TabItem({ route, isFocused, onPress }: any) {
  const pillAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animate the pill background and icon scale when the tab focus changes
  useEffect(() => {
    Animated.parallel([
      Animated.spring(pillAnim, {
        toValue: isFocused ? 1 : 0,
        friction: 7,
        tension: 100,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.05 : 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, pillAnim, scaleAnim]);

  const routeKey = route.name.split("/")[0];
  const { icon, label } = ROUTES[routeKey] ?? {
    icon: "help-outline",
    label: route.name,
  };
  const color = isFocused ? COLORS.active : COLORS.inactive;
  const labelColor = isFocused ? COLORS.activeLabel : COLORS.inactive;

  const pillBg = pillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(175,11,1,0)", "rgba(175,11,1,0.10)"],
  });

  // Main TabItem renderer
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.navItem}
      activeOpacity={0.8}
    >
      <Animated.View
        style={{ transform: [{ scale: scaleAnim }], alignItems: "center" }}
      >
        <Animated.View style={[styles.pill, { backgroundColor: pillBg }]}>
          <Ionicons
            name={(isFocused ? icon : `${icon}-outline`) as any}
            size={ICON_SIZE}
            color={color}
          />
        </Animated.View>
        <Text
          numberOfLines={1}
          style={[styles.navLabel, { color: labelColor }]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Banner component to show network status changes
function NetworkBanner({ navHeight }: { navHeight: number }) {
  const [status, setStatus] = useState<
    "offline" | "reconnecting" | "online" | "hidden"
  >("hidden");
  const translateY = useRef(new Animated.Value(scale(20))).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMount = useRef(true);

  // Function to animate the banner in and out
  const animate = useCallback(
    (visible: boolean) =>
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: visible ? 0 : scale(20),
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: visible ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    [translateY, opacity],
  );

  // Hide banner
  const hideBanner = useCallback(() => {
    animate(false).start(() => setStatus("hidden"));
  }, [animate]);

  // Show banner
  const showBanner = useCallback(
    (newStatus: "offline" | "online") => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setStatus(newStatus);
      animate(true).start();
      if (newStatus === "online") {
        hideTimer.current = setTimeout(hideBanner, BANNER_ONLINE_DURATION);
      }
    },
    [animate, hideBanner],
  );

  // Listen for network status changes and show/hide banner accordingly
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected && state.isInternetReachable;
      if (isFirstMount.current) {
        if (state.isInternetReachable === null) return;
        isFirstMount.current = false;
        if (!isConnected) showBanner("offline");
        return;
      }
      if (!isConnected) {
        showBanner("offline");
      } else {
        setStatus("reconnecting");
        setTimeout(() => showBanner("online"), BANNER_APPEAR_DELAY);
      }
    });

    return () => {
      unsubscribe();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [showBanner]);

  // Avoid render the banner at all when it's hidden
  if (status === "hidden") return null;

  // Status flags for rendering
  const isOffline = status === "offline";
  const isOnline = status === "online";
  const isReconnecting = status === "reconnecting";

  // Main NetworkBanner renderer
  return (
    <Animated.View
      style={[
        styles.bannerWrapper,
        { bottom: navHeight + scale(10), opacity, transform: [{ translateY }] },
      ]}
    >
      <View
        style={[
          styles.banner,
          { backgroundColor: isOnline ? COLORS.online : "rgba(24,30,33,0.97)" },
        ]}
      >
        <Ionicons
          name={isOffline ? "cloud-offline-outline" : "wifi-outline"}
          size={scale(15)}
          color={COLORS.white}
        />

        <Text style={styles.bannerText}>
          {isOffline && "You're offline"}
          {isReconnecting && "Reconnecting..."}
          {isOnline && "You're now online"}
        </Text>

        {isOffline && (
          <TouchableOpacity onPress={hideBanner} style={styles.bannerClose}>
            <Ionicons name="close" size={scale(11)} color={COLORS.white} />
          </TouchableOpacity>
        )}

        {isReconnecting && (
          <ActivityIndicator
            size="small"
            color={COLORS.white}
            style={{ width: scale(18), height: scale(18) }}
          />
        )}
      </View>
    </Animated.View>
  );
}

// Custom capsule navigation component
function CapsuleNav({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const safeBottom = Math.min(Math.max(insets.bottom, 0), 50);
  const totalNavHeight = NAV_HEIGHT + safeBottom;

  const visibleRoutes = state.routes.filter((route: any) =>
    TAB_ROUTE_NAMES.includes(route.name),
  );

  // Animated values for the network banner
  return (
    <>
      <NetworkBanner navHeight={totalNavHeight} />

      <View style={[styles.shadowWrapper, { height: totalNavHeight }]}>
        <View style={styles.navWrapper}>
          <View style={styles.capsule}>
            {visibleRoutes.map((route: any) => {
              const actualIndex = state.routes.findIndex(
                (r: any) => r.key === route.key,
              );

              const isFocused = state.index === actualIndex;

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <TabItem
                  key={route.key}
                  route={route}
                  isFocused={isFocused}
                  onPress={onPress}
                />
              );
            })}

            <TouchableOpacity
              onPress={() => router.push("/add-listing")}
              activeOpacity={0.75}
              style={styles.addBtnWrapper}
              hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
            >
              <View style={styles.addBtnInner}>
                <Ionicons name="add" size={ICON_SIZE} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {safeBottom > 0 && (
          <View style={[styles.safeAreaFill, { height: safeBottom }]} />
        )}
      </View>
    </>
  );
}

// Styles for the capsule navigation and network banner
const styles = StyleSheet.create({
  shadowWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 20,
  },

  // Navigation container
  navWrapper: {
    height: NAV_HEIGHT,
    backgroundColor: COLORS.navBg,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    overflow: "hidden",
  },
  safeAreaFill: {
    backgroundColor: COLORS.navBg,
  },
  capsule: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(20),
    height: NAV_HEIGHT,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: NAV_HEIGHT,
  },
  pill: {
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(1),
  },
  navLabel: {
    fontSize: LABEL_SIZE,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },

  // Add button
  addBtnWrapper: {
    width: ADD_BTN_SIZE + scale(20),
    height: NAV_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: scale(4),
  },
  addBtnInner: {
    width: ADD_BTN_SIZE,
    height: ADD_BTN_SIZE,
    borderRadius: ADD_BTN_SIZE / 2,
    backgroundColor: COLORS.addBtn,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#AF0B01",
    shadowOffset: { width: 0, height: scale(3) },
    shadowOpacity: 0.4,
    shadowRadius: scale(8),
    elevation: 0,
  },

  // Network banner
  bannerWrapper: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 999,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderRadius: scale(20),
  },
  bannerText: {
    color: "#fff",
    fontSize: scale(13),
    fontWeight: "500",
  },
  bannerClose: {
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    backgroundColor: COLORS.bannerClose,
    justifyContent: "center",
    alignItems: "center",
  },
});
