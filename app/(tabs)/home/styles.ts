import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';


// Get screen dimensions for responsive calculations
const { width, height } = Dimensions.get('window');


// Set base design constants
const BASE_WIDTH = 375;
const DRAWER_WIDTH_PERCENT = 0.75;
const HORIZONTAL_PADDING_VAL = 20;
const CATEGORIES_PER_ROW = 3;
const LISTINGS_PER_ROW = 2;


// Set color palette
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


// Calculate responsive sizes based on screen width
export const scale = (size: number) => (width / BASE_WIDTH) * size;


// Set derived layout measurements
export const HORIZONTAL_PADDING = scale(HORIZONTAL_PADDING_VAL);
export const DRAWER_WIDTH = width * DRAWER_WIDTH_PERCENT;
const GRID_GAP = scale(12);
const CATEGORY_GAP = scale(20);


// Calculate dynamic widths for grid items
export const CARD_WIDTH = (width - (HORIZONTAL_PADDING * 2) - GRID_GAP) / LISTINGS_PER_ROW;
const CATEGORY_CARD_WIDTH = (width - (HORIZONTAL_PADDING * 2) - CATEGORY_GAP) / CATEGORIES_PER_ROW;


// Shared visual properties for consistency
const SHADOW_LIGHT = {
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 2,
  elevation: 1,
};

const ROW_CENTER = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
};

export const styles = StyleSheet.create({


  // Main layout container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },


  // Vertical visual separator
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: scale(20),
  },


  // Main scrollable area padding
  scrollContent: { 
    paddingBottom: scale(100) 
  },


  // Dark overlay when drawer is open
  backdrop: {
    position: 'absolute',
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0,
    backgroundColor: COLORS.backdrop,
    zIndex: 998,
  },


  // Side navigation menu
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


  // Top part of the drawer with logo/close
  drawerHeader: {
    ...ROW_CENTER,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.drawerBorder,
  },


  // List container for drawer links
  drawerItems: { 
    padding: 20 
  },


  // Individual navigation link row
  drawerItem: {
    ...ROW_CENTER,
    marginBottom: 25,
  },


  // Label for drawer navigation links
  drawerItemText: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },


  // Top navigation bar on Home
  topNav: {
    ...ROW_CENTER,
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    height: scale(60),
    backgroundColor: COLORS.background,
  },


  // Brand identity text
  logoMini: {
    fontSize: scale(24),
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: -1,
  },


  // User profile image wrapper
  profileCircle: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },


  // Header section for greetings
  greetingContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: scale(10),
    paddingBottom: scale(15),
  },


  // Interactive toggle for school name
  hcdcToggle: {
    ...ROW_CENTER,
    marginBottom: scale(8),
    alignSelf: 'flex-start',
  },


  // Short/Full school name text
  hcdcText: {
    fontSize: scale(14),
    fontWeight: '700',
    color: COLORS.secondary,
    marginRight: scale(4),
    letterSpacing: 0.5,
  },


  // Large bold greeting headline
  greetingText: {
    fontSize: scale(24),
    fontWeight: '700',
    color: COLORS.dark,
    lineHeight: scale(24.5),
    letterSpacing: -0.5,
  },


  // Container for search input
  searchSection: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: scale(20),
  },


  // Stylized search input box
  searchBar: {
    ...ROW_CENTER,
    height: scale(55),
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.borderLight,
  },


  // Text entry for search
  searchInput: {
    flex: 1,
    fontSize: scale(15),
    color: COLORS.textInput,
  },


  // Subheader for sections like Categories
  sectionLabel: {
    paddingHorizontal: HORIZONTAL_PADDING,
    fontSize: scale(15),
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: scale(5),
    marginBottom: scale(12),
  },


  // Flex container for category items
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
    justifyContent: 'space-between',
    marginBottom: scale(5),
  },


  // Small box for individual categories
  categoryCard: {
    width: CATEGORY_CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    borderColor: COLORS.borderMedium,
    borderWidth: 1,
    paddingVertical: scale(15),
    alignItems: 'center',
    marginBottom: scale(10),
  },


  // Highlighted state for category card
  activeCategoryCard: {
    backgroundColor: COLORS.dark,
    borderColor: COLORS.dark,
  },


  // Category name text
  categoryCardText: {
    marginTop: scale(8),
    fontSize: scale(11),
    fontWeight: '600',
    color: COLORS.dark,
  },


  // Highlighted state for category text
  activeCategoryCardText: {
    color: COLORS.surface,
  },


  // Layout for the main product grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
    justifyContent: 'space-between',
  },


  // Main product card wrapper
  card: {
    width: CARD_WIDTH,
    marginBottom: scale(15),
    borderRadius: scale(12),
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },


  // Fixed ratio container for listing photos
  imageContainer: {
    width: '100%',
    aspectRatio: 1.1,
  },


  // Actual listing photo
  cardImage: {
    width: '100%',
    height: '100%',
  },


  // Padding area for text inside cards
  cardContent: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(8),
  },


  // Alignment for price and category in card
  cardHeader: {
    ...ROW_CENTER,
    justifyContent: 'space-between',
    marginBottom: scale(2),
  },


  // Small brand-colored category tag
  cardCategory: {
    fontSize: scale(10),
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },


  // Item name in listing grid
  cardTitle: {
    fontSize: scale(13),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: scale(4),
  },


  // Bold price text on card
  cardPricePlain: {
    fontSize: scale(16),
    fontWeight: '600',
    color: COLORS.dark,
  },



  // Visual background for item status
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },


  // Text inside the status badge
  statusTextPlain: {
    fontSize: scale(10),
    fontWeight: '700',
    textTransform: 'uppercase',
  },


  // Loading indicator center wrapper
  loaderContainer: {
    height: scale(200),
    justifyContent: 'center',
    alignItems: 'center',
  },


  // Wrapper for "empty list" messages
  noResultsContainer: {
    width: '100%',
    paddingVertical: scale(40),
    alignItems: 'center',
  },


  // Text for empty search results
  noResultsText: {
    fontSize: scale(14),
    color: COLORS.borderMedium,
    fontWeight: '600',
  },


  // End of scroll indicator text
  endOfListText: {
    textAlign: 'center',
    color: COLORS.borderMedium,
    fontSize: scale(14),
    fontWeight: '600',
    marginTop: scale(20),
    marginBottom: scale(10),
  },


  // Background for item detail modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },


  // Top bar for the detail view
  modalHeader: {
    ...ROW_CENTER,
    paddingHorizontal: HORIZONTAL_PADDING,
    height: scale(60),
    backgroundColor: COLORS.background,
  },


  // Item title in the detail header
  modalHeaderTitle: {
    fontSize: scale(19),
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: -1,
  },


  // Touch area for closing the modal
  modalCloseBtn: { 
    padding: scale(5) 
  },


  // Hero image in details view
  modalImage: {
    width: width,
    height: height * 0.4,
    resizeMode: 'cover',
  },


  // Main text container in details view
  modalInfoSection: { 
    padding: HORIZONTAL_PADDING 
  },


  // Horizontal layout for info bits in modal
  modalRow: {
    ...ROW_CENTER,
    justifyContent: 'space-between',
    marginBottom: scale(10),
  },


  // Detail view category tag
  modalCategory: {
    fontSize: scale(12),
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },

  
  // Large title in details view
  modalTitle: {
    fontSize: scale(22),
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: scale(5),
  },


  // Large price in details view
  modalPrice: {
    fontSize: scale(20),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: scale(20),
  },


  // Labels for description or specs
  detailLabel: {
    fontSize: scale(16),
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: scale(8),
  },


  // Detailed body text for item
  detailValue: {
    fontSize: scale(14),
    color: COLORS.textSecondary,
    lineHeight: scale(20),
    marginBottom: scale(20),
  },


  // Horizontal row for owner info
  contactRow: {
    ...ROW_CENTER,
    marginBottom: scale(12),
  },


  // Owner name or contact text
  detailValueContact: {
    fontSize: scale(15),
    fontWeight: '700',
    color: COLORS.dark,
    marginLeft: 8,
  },


  // Persistent action bar at bottom of modal
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


  // Primary action button in modal
  messageBtn: {
    flex: 1,
    height: scale(50),
    backgroundColor: COLORS.dark,
    borderRadius: 12,
    ...ROW_CENTER,
    justifyContent: 'center',
  },


  // Label for action button
  messageBtnText: {
    color: COLORS.surface,
    fontSize: scale(15),
    fontWeight: '700',
  },


  // Standardized info block with shadow
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: COLORS.surface,
    overflow: 'hidden',
    ...SHADOW_LIGHT,
  },


  // Row inside an info card
  infoRow: {
    ...ROW_CENTER,
    paddingHorizontal: scale(15),
    paddingVertical: scale(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },


  // Last row cleanup to remove bottom border
  infoRowLast: {
    borderBottomWidth: 0,
  },


  // Flexible container for label/value pair
  infoTextBlock: {
    flex: 1,
  },


  // Subtle label within info cards
  infoRowLabel: {
    fontSize: scale(13),
    fontWeight: '700',
    color: COLORS.textMuted,
  },


  // Bold value within info cards
  infoRowValue: {
    fontSize: scale(16),
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: scale(2),
  },
  
});