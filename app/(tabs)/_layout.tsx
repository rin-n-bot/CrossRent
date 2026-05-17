import { Redirect, Tabs, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const NAV_HEIGHT = 62;
const NAV_BOTTOM_OFFSET = 12;
const ADD_BTN_SIZE = 58;
const ICON_SIZE = 22;
const LABEL_SIZE = 11;
const BANNER_APPEAR_DELAY = 1500;
const BANNER_ONLINE_DURATION = 3000;
const TAB_ROUTE_NAMES = ['home/index', 'chat/index', 'transactions/index']; // ← ADD THIS

const COLORS = {
  active: '#AF0B01',
  inactive: '#cfd4da',
  navBg: '#222D31',
  addBtn: '#AF0B01',
  online: '#1D9E75',
  white: '#fff',
  bannerClose: 'rgba(255,255,255,0.2)',
};

const ROUTES: Record<string, { icon: string; label: string }> = {
  home: { icon: 'home', label: 'Home' },
  chat: { icon: 'chatbubbles', label: 'Chats' },
  transactions: { icon: 'swap-horizontal', label: 'Transact' },
};

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.active} />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: 'fade' }}
      tabBar={(props) => <CapsuleNav {...props} />}
    >
      <Tabs.Screen name="home/index" options={{ title: 'Home' }} />
      <Tabs.Screen name="chat/index" options={{ title: 'Chats' }} />
      <Tabs.Screen name="transactions/index" options={{ title: 'Transactions' }} />
    </Tabs>
  );
}

function TabItem({ route, isFocused, onPress }: any) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1.05 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [isFocused, scaleAnim]);

  // ← CHANGED
  const routeKey = route.name.split('/')[0];
  const { icon, label } = ROUTES[routeKey] ?? { icon: 'help-outline', label: route.name };
  const color = isFocused ? COLORS.active : COLORS.inactive;

  return (
    <TouchableOpacity onPress={onPress} style={styles.navItem} activeOpacity={0.7}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <Ionicons
          name={(isFocused ? icon : `${icon}-outline`) as any}
          size={ICON_SIZE}
          color={color}
        />
        <Text numberOfLines={1} style={[styles.navLabel, { color }]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function NetworkBanner() {
  const [status, setStatus] = useState<'offline' | 'reconnecting' | 'online' | 'hidden'>('hidden');
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMount = useRef(true);
  const insets = useSafeAreaInsets();

  const animate = useCallback((visible: boolean) =>
    Animated.parallel([
      Animated.spring(translateY, { toValue: visible ? 0 : 20, friction: 6, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: visible ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]), [translateY, opacity]);

  const hideBanner = useCallback(() => {
    animate(false).start(() => setStatus('hidden'));
  }, [animate]);

  const showBanner = useCallback((newStatus: 'offline' | 'online') => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setStatus(newStatus);
    animate(true).start();
    if (newStatus === 'online') {
      hideTimer.current = setTimeout(hideBanner, BANNER_ONLINE_DURATION);
    }
  }, [animate, hideBanner]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected && state.isInternetReachable;

      if (isFirstMount.current) {
        if (state.isInternetReachable === null) return;
        isFirstMount.current = false;
        if (!isConnected) showBanner('offline');
        return;
      }

      if (!isConnected) {
        showBanner('offline');
      } else {
        setStatus('reconnecting');
        setTimeout(() => showBanner('online'), BANNER_APPEAR_DELAY);
      }
    });

    return () => {
      unsubscribe();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [showBanner]);

  if (status === 'hidden') return null;

  const isOffline = status === 'offline';
  const isOnline = status === 'online';
  const isReconnecting = status === 'reconnecting';
  const safeBottom = Math.min(insets.bottom, 24);
  const bannerBottom = NAV_HEIGHT + safeBottom + NAV_BOTTOM_OFFSET;

  return (
    <Animated.View style={[styles.bannerWrapper, { bottom: bannerBottom, opacity, transform: [{ translateY }] }]}>
      <View style={[styles.banner, { backgroundColor: isOnline ? COLORS.online : COLORS.navBg }]}>
        <Ionicons
          name={isOffline ? 'cloud-offline-outline' : 'wifi-outline'}
          size={15}
          color={COLORS.white}
        />
        <Text style={styles.bannerText}>
          {isOffline && "You're offline"}
          {isReconnecting && 'Reconnecting...'}
          {isOnline && "You're now online"}
        </Text>
        {isOffline && (
          <TouchableOpacity onPress={hideBanner} style={styles.bannerClose}>
            <Ionicons name="close" size={11} color={COLORS.white} />
          </TouchableOpacity>
        )}
        {isReconnecting && (
          <ActivityIndicator size="small" color={COLORS.white} style={{ width: 18, height: 18 }} />
        )}
      </View>
    </Animated.View>
  );
}

function CapsuleNav({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const safeBottom = Math.min(insets.bottom, 24);

  // ← CHANGED
  const visibleRoutes = state.routes.filter((route: any) =>
    TAB_ROUTE_NAMES.includes(route.name)
  );

  return (
    <View style={[styles.container, { bottom: safeBottom + NAV_BOTTOM_OFFSET }]}>
      <NetworkBanner />
      <View style={styles.pill}>
        <View style={styles.capsule}>
          {visibleRoutes.map((route: any) => {
            const actualIndex = state.routes.findIndex((r: any) => r.key === route.key);
            const isFocused = state.index === actualIndex;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            };

            return (
              <TabItem key={route.key} route={route} isFocused={isFocused} onPress={onPress} />
            );
          })}
        </View>
      </View>
      <View style={styles.addWrapper}>
        <TouchableOpacity
          onPress={() => router.push('/add-listing')}
          activeOpacity={0.85}
          style={styles.inlineAddBtn}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pill: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  capsule: {
    flexDirection: 'row',
    height: NAV_HEIGHT,
    alignItems: 'center',
    borderRadius: 32,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: NAV_HEIGHT,
  },
  navLabel: {
    fontSize: LABEL_SIZE,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center',
  },
  addWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineAddBtn: {
    width: ADD_BTN_SIZE,
    height: ADD_BTN_SIZE,
    borderRadius: ADD_BTN_SIZE / 2,
    backgroundColor: COLORS.addBtn,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 8,
    shadowColor: COLORS.addBtn,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  bannerWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 999,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  bannerClose: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.bannerClose,
    justifyContent: 'center',
    alignItems: 'center',
  },
});