import { Dimensions, Platform, StatusBar, StyleSheet } from 'react-native';


// Centralized styling and layout constants for the Home screen and its components
const { width } = Dimensions.get('window');

const BASE_WIDTH = 375;
const DRAWER_WIDTH_PERCENT = 0.75;
const HORIZONTAL_PADDING_VAL = 20;
const CATEGORIES_PER_ROW = 3;
const LISTINGS_PER_ROW = 2;

const COLORS = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  primary: '#AF0B01',
  secondary: '#0038A8',
  dark: '#222D31',
  border: '#F0F0F0',
  borderLight: '#d9dfe665',
  borderMedium: '#cfd4da',
  textMain: '#222D31',
  textMuted: '#9CA3AF',
  textInput: '#1D3557',
  textSecondary: '#555',
  shadow: '#000',
  backdrop: 'rgba(0,0,0,0.4)',
  drawerBorder: 'rgba(241, 250, 238, 0.1)',
};


// Utility function to scale sizes based on device width, using a base width for reference
export const scale = (size: number) => (width / BASE_WIDTH) * size;

export const HORIZONTAL_PADDING = scale(HORIZONTAL_PADDING_VAL);
export const DRAWER_WIDTH = width * DRAWER_WIDTH_PERCENT;
const GRID_GAP = scale(12);
const CATEGORY_GAP = scale(20);

export const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - GRID_GAP) / LISTINGS_PER_ROW;
const CATEGORY_CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CATEGORY_GAP) / CATEGORIES_PER_ROW;


const ROW_CENTER = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
};


// Exported styles
export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: scale(20),
  },

  scrollContent: {
    paddingBottom: scale(100),
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.backdrop,
    zIndex: 998,
  },

  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.dark,
    zIndex: 100,
    elevation: 100,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
  },

  drawerHeader: {
    ...ROW_CENTER,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.drawerBorder,
  },

  drawerItems: {
    padding: 20,
  },

  drawerItem: {
    ...ROW_CENTER,
    marginBottom: 25,
  },

  drawerItemText: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },

  topNav: {
    ...ROW_CENTER,
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    height: scale(60),
    backgroundColor: COLORS.background,
  },

  logoMini: {
    fontSize: scale(20),
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: -1,
  },

  profileCircle: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Fallback avatar background when no profile photo
  profileFallback: {
    width: '100%',
    height: '100%',
    borderRadius: scale(16),
    backgroundColor: '#222D31',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Initial letter shown when no profile photo
  profileFallbackText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: scale(12),
  },

  greetingContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: scale(10),
    paddingBottom: scale(15),
  },

  hcdcToggle: {
    ...ROW_CENTER,
    marginBottom: scale(8),
    alignSelf: 'flex-start',
  },

  hcdcText: {
    fontSize: scale(14),
    fontWeight: '700',
    color: COLORS.secondary,
    marginRight: scale(4),
    letterSpacing: 0.5,
  },

  greetingText: {
    fontSize: scale(24),
    fontWeight: '700',
    color: COLORS.dark,
    lineHeight: scale(24.5),
    letterSpacing: -0.5,
  },

  searchSection: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: scale(20),
  },

  searchBar: {
    ...ROW_CENTER,
    height: scale(55),
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.borderLight,
  },

  searchInput: {
    flex: 1,
    fontSize: scale(15),
    color: COLORS.textInput,
  },

  sectionLabel: {
    paddingHorizontal: HORIZONTAL_PADDING,
    fontSize: scale(15),
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: scale(5),
    marginBottom: scale(12),
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
    justifyContent: 'space-between',
    marginBottom: scale(5),
  },

  categoryCard: {
    width: CATEGORY_CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    borderColor: '#ffffff',
    borderWidth: 1,
    paddingVertical: scale(15),
    alignItems: 'center',
    marginBottom: scale(10),
  },

  activeCategoryCard: {
    backgroundColor: COLORS.dark,
    borderColor: COLORS.dark,
  },

  categoryCardText: {
    marginTop: scale(8),
    fontSize: scale(11),
    fontWeight: '600',
    color: COLORS.dark,
  },

  activeCategoryCardText: {
    color: COLORS.surface,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
    justifyContent: 'space-between',
  },

  card: {
    width: CARD_WIDTH,
    marginBottom: scale(15),
    borderRadius: scale(12),
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },

  imageContainer: {
    width: '100%',
    aspectRatio: 1.1,
  },

  cardImage: {
    width: '100%',
    height: '100%',
  },

  cardContent: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(8),
  },

  cardHeader: {
    ...ROW_CENTER,
    justifyContent: 'space-between',
    marginBottom: scale(2),
  },

  cardCategory: {
    fontSize: scale(10),
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  cardTitle: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: scale(4),
  },

  cardPricePlain: {
    fontSize: scale(16),
    fontWeight: '700',
    color: COLORS.dark,
  },

  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: 4,
    borderRadius: 5,
  },

  statusTextPlain: {
    fontSize: scale(9),
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  loaderContainer: {
    height: scale(200),
    justifyContent: 'center',
    alignItems: 'center',
  },

  noResultsContainer: {
    width: '100%',
    paddingVertical: scale(40),
    alignItems: 'center',
  },

  noResultsText: {
    fontSize: scale(14),
    color: COLORS.borderMedium,
    fontWeight: '600',
  },

  endOfListText: {
    textAlign: 'center',
    color: COLORS.borderMedium,
    fontSize: scale(14),
    fontWeight: '600',
    marginTop: scale(20),
    marginBottom: scale(10),
  },

  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  modalHeader: {
    ...ROW_CENTER,
    paddingHorizontal: HORIZONTAL_PADDING,
    height: scale(60),
    backgroundColor: COLORS.background,
  },

  modalHeaderTitle: {
    fontSize: scale(19),
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: -1,
  },

  modalCloseBtn: {
    padding: scale(5),
  },

  modalImage: {
    width,
    aspectRatio: 4 / 3,
    resizeMode: 'contain',
    backgroundColor: '#F0F0F0',
  },

  modalInfoSection: {
    padding: HORIZONTAL_PADDING,
  },

  modalRow: {
    ...ROW_CENTER,
    justifyContent: 'space-between',
    marginBottom: scale(10),
  },

  modalCategory: {
    fontSize: scale(12),
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },

  modalTitle: {
    fontSize: scale(22),
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: scale(5),
  },

  modalPrice: {
    fontSize: scale(20),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: scale(20),
  },

  detailLabel: {
    fontSize: scale(16),
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: scale(8),
  },

  detailValue: {
    fontSize: scale(14),
    color: COLORS.textSecondary,
    lineHeight: scale(20),
    marginBottom: scale(20),
  },

  contactRow: {
    ...ROW_CENTER,
    marginBottom: scale(12),
  },

  detailValueContact: {
    fontSize: scale(15),
    fontWeight: '700',
    color: COLORS.dark,
    marginLeft: 8,
  },

  modalFooter: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: HORIZONTAL_PADDING,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...ROW_CENTER,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },

  messageBtn: {
    flex: 1,
    height: scale(50),
    backgroundColor: COLORS.dark,
    borderRadius: 12,
    ...ROW_CENTER,
    justifyContent: 'center',
  },

  messageBtnText: {
    color: COLORS.surface,
    fontSize: scale(15),
    fontWeight: '700',
  },

  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: COLORS.surface,
    overflow: 'hidden',
  },

  infoRow: {
    ...ROW_CENTER,
    paddingHorizontal: scale(15),
    paddingVertical: scale(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoTextBlock: {
    flex: 1,
  },

  infoRowLabel: {
    fontSize: scale(13),
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  infoRowValue: {
    fontSize: scale(16),
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: scale(2),
  },

  chatActionBtn: {
    width: scale(50),
    height: scale(46),
    borderRadius: scale(50),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: scale(10),
    marginLeft: scale(5),
  },

  chatActionIcon: {},
});