import { Dimensions, StyleSheet } from 'react-native';


// Design dimensions for scaling
const { width, height } = Dimensions.get('window');

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const scale = (size: number) => (width / BASE_WIDTH) * size;
export const scaleV = (size: number) => (height / BASE_HEIGHT) * size;


// Color palette for the chat interface
export const COLORS = {
  primary: '#AF0B01',
  dark: '#222D31',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  border: '#cfd4da',
  borderLight: '#F0F0F0',
  textMain: '#222D31',
  textSecondary: '#666',
  textMuted: '#9CA3AF',
  avatarBg: '#F9F9F9',
  selectionBg: '#FFF4F4',
  iconInactive: '#cfd4da',
};


// Styles
export const chatStyles = StyleSheet.create({

  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },


  // Top navigation bar
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    height: scaleV(56),
    backgroundColor: COLORS.background,
  },


  // App logo text in nav
  navLogoText: {
    fontSize: scale(20),
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: -0.5,
    flex: 1,
  },


  // Search bar 
  searchWrapper: {
    paddingHorizontal: scale(16),
    paddingBottom: scaleV(10),
    backgroundColor: COLORS.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9dfe665',
    borderRadius: scale(20),
    paddingHorizontal: scale(10),
    height: scaleV(44),
  },
  searchInput: {
    flex: 1,
    fontSize: scale(14),
    color: COLORS.dark,
  },


  // Tab Buttons row
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: scale(10),
    backgroundColor: COLORS.background,
  },
  tabButton: {
    flex: 1,
    paddingVertical: scaleV(12),
    borderBottomWidth: 2,
  },
  tabLabel: {
    textAlign: 'center',
    fontSize: scale(13),
    fontWeight: '700',
  },


  // Animated list
  listAnimatedWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContentPadding: {
    padding: scale(20),
  },


  // Individual chat row
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(15),
    borderRadius: scale(12),
    marginBottom: scaleV(10),
  },


  // Avatar container with unread dot support
  avatarWrapper: {
    marginRight: scale(15),
  },
  avatarFallback: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: scale(16),
  },
  unreadDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },


  // Chat info column
  chatInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  chatRowTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  senderName: {
    fontSize: scale(16),
    fontWeight: '700',
    color: COLORS.textMain,
    flex: 1,
    marginRight: scale(8),
  },
  timeLabel: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  lastMessagePreview: {
    fontSize: scale(15),
    color: COLORS.textSecondary,
    marginTop: 2,
  },


  // Empty state wrapper
  emptyStateWrapper: {
    alignItems: 'center',
    marginTop: scaleV(195),
  },
  emptyStateText: {
    fontSize: scale(14),
    color: COLORS.border,
    fontWeight: '600',
    marginTop: scaleV(10),
  },
  
});