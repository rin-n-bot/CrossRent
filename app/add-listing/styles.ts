import { StyleSheet, Platform, StatusBar } from 'react-native';


// Standardized constants for consistency
const COLOR_PRIMARY_BRAND = '#AF0B01';
const COLOR_DARK_CHARCOAL = '#222D31';
const COLOR_MUTED_GRAY = '#999';
const COLOR_BORDER_GRAY = '#cfd4da';
const COLOR_PURE_WHITE = '#ffffff';
const COLOR_BACKGROUND_OFF_WHITE = '#f5f5f5';

const BORDER_RADIUS_STANDARD = 10;
const BORDER_RADIUS_PILL = 25;

const styles = StyleSheet.create({


  // Overall screen layout and background
  mainWrapper: { 
    flex: 1, 
    backgroundColor: COLOR_BACKGROUND_OFF_WHITE 
  },


  // Padding and spacing for the inner form area
  formContainer: { 
    padding: 20 
  },


  // Red header area with status bar padding for Android
  redHeader: { 
    backgroundColor: COLOR_PRIMARY_BRAND, 
  },


  // Header content alignment for the back icon, title, and post button
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 15,  
  },


  // Main title text inside the header
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLOR_PURE_WHITE 
  },


  // Touch targets for the close and post buttons
  iconButton: { 
    padding: 5 
  },


  // Styling for the "Post" button text
  postBtnText: { 
    color: COLOR_PURE_WHITE, 
    fontWeight: '800', 
    fontSize: 15 
  },


  // Labels used above input fields and chip groups
  label: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: COLOR_DARK_CHARCOAL, 
    marginBottom: 10 
  },


  // Standard text input styling with subtle shadow for depth
  input: { 
    backgroundColor: COLOR_PURE_WHITE, 
    borderWidth: 1, 
    borderColor: COLOR_PURE_WHITE, 
    borderRadius: BORDER_RADIUS_STANDARD, 
    padding: 12, 
    marginBottom: 20,
    fontSize: 15,
    color: COLOR_DARK_CHARCOAL,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 0,
  },


  // Extended input styling for multi-line description text
  textArea: { 
    height: 100, 
    textAlignVertical: 'top' 
  },


  // Grid layout for displaying selection chips side-by-side
  chipGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'flex-start', 
    gap: 10, 
    marginBottom: 25 
  },


  // Base style for selection chips
  chip: { 
    paddingVertical: 10, 
    borderRadius: BORDER_RADIUS_PILL, 
    borderWidth: 1.5, 
    alignItems: 'center' 
  },


  // Style for chips that are not currently selected
  chipInactive: { 
    backgroundColor: COLOR_PURE_WHITE, 
    borderColor: '#ffffff',
    borderWidth: 1,
  },


  // Standard active state for categories and duration
  chipActive: { 
    backgroundColor: COLOR_DARK_CHARCOAL, 
    borderColor: COLOR_DARK_CHARCOAL 
  },


  // Darker active state used for the status chips
  chipActiveBlack: { 
    backgroundColor: COLOR_DARK_CHARCOAL, 
    borderColor: COLOR_DARK_CHARCOAL 
  },


  // Default text color for chip labels
  chipText: { 
    color: '#666', 
    fontWeight: '700', 
    fontSize: 12 
  },


  // Highlighted text color for selected chips
  chipTextActive: { 
    color: COLOR_PURE_WHITE 
  },


  // Dashed border container for the image picker button
  imageButton: {
    backgroundColor: COLOR_PURE_WHITE,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER_GRAY,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS_STANDARD,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden'
  },


  // Visual vertical alignment for the camera icon and text
  imagePlaceholder: {
    alignItems: 'center',
    gap: 5
  },


  // Prompt text for the image selection area
  imageButtonText: {
    color: COLOR_PRIMARY_BRAND,
    fontWeight: '700',
    fontSize: 14
  },


  // Sizing and scaling for the image after it has been picked
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },


  // Footer container to center the posting information
  centeredFooter: { 
    width: '100%', 
    alignItems: 'center', 
    marginVertical: 20 
  },


  // Layout for the email icon and text together
  infoBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },

  
  // Small muted text for the "Posting as" disclaimer
  infoText: { 
    color: COLOR_MUTED_GRAY, 
    fontSize: 12 
  }

});

export default styles;