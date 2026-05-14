import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width: WINDOW_WIDTH } = Dimensions.get('window');


// Set a base width for scaling calculations (standard mobile width)
const BASE_WIDTH = 375;


// Create a scaling factor to keep the UI consistent across different screen sizes
export const scale = (size: number) => (WINDOW_WIDTH / BASE_WIDTH) * size;


// Standard spacing constants for a uniform layout
const CONTENT_PADDING = scale(20);
const CARD_RADIUS = scale(12);
const TEXT_DARK = '#222D31';
const TEXT_MUTED = '#9CA3AF';
const BACKGROUND_LIGHT = '#F5F5F5';

export const transStyles = StyleSheet.create({
  

  // Main background and top safe area handling
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },


  // Header bar containing the title and action icons
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CONTENT_PADDING,
    height: scale(60),
  },


  // Small brand text or screen title in the header
  logoMini: {
    fontSize: scale(20),
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -1,
  },


  // Base container for each transaction item
  card: {
    width: '100%',
    marginBottom: scale(10),
    borderRadius: CARD_RADIUS,
    backgroundColor: '#FFF',
    padding: scale(15),
    overflow: 'hidden',
  },


  // Layout for the top section of a transaction card
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },


  // Primary text for the item name within the card
  cardTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: TEXT_DARK,
  },


  // Secondary text for dates, times, or email identifiers
  cardTimestamp: {
    fontSize: scale(13),
    fontWeight: '700',
    color: TEXT_MUTED,
    marginBottom: scale(4),
  },


  // Small pill-shaped container for status tags
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },


  // Styling for the text inside the status pill
  statusTextPlain: {
    fontSize: scale(10),
    fontWeight: '700',
    textTransform: 'uppercase',
  },


  // Base style for interactive action buttons (Approve, Decline, etc.)
  messageBtn: {
    borderRadius: CARD_RADIUS,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },


  // Label styling for the text inside action buttons
  messageBtnText: {
    color: '#FFFFFF',
    fontSize: scale(14),
    fontWeight: '800',
  },

  
  // Text shown when the list has no items to display
  noResultsText: {
    fontSize: scale(14),
    color: '#cfd4da',
    fontWeight: '700',
  },

});