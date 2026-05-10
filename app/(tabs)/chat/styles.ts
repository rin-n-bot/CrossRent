import { StyleSheet, Platform, StatusBar } from 'react-native';


// Set color palette constants
const COLORS = {
  primary: '#AF0B01',
  dark: '#222D31',
  background: '#f5f5f5',
  surface: '#ffffff',
  border: '#cfd4da',
  borderLight: '#F0F0F0',
  textMain: '#222D31',
  textSecondary: '#666',
  avatarBg: '#F9F9F9',
  shadow: '#000',
};

export const chatStyles = StyleSheet.create({


  // Main screen wrappers
  mainWrapper: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  contentArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },


  // Header and Navigation styles
  redHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeAreaCustom: {
    backgroundColor: COLORS.primary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
  },
  leftContainer: { width: 60 },
  rightContainer: { width: 60 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.surface,
    textAlign: 'center',
    width: '65%',
  },


  // Interactive elements
  iconButton: { padding: 5 },


  // Chat list and row styles
  listContainer: { padding: 15 },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.avatarBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  chatInfo: { flex: 1 },
  userName: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: COLORS.textMain 
  },
  lastMsg: { 
    fontSize: 15, 
    color: COLORS.textSecondary, 
    marginTop: 2 
  },


  // Message thread / Bubble styles
  messageList: { 
    paddingHorizontal: 15, 
    paddingVertical: 20 
  },
  bubble: { 
    maxWidth: '80%', 
    padding: 12, 
    borderRadius: 15, 
    marginBottom: 10 
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.dark,
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 2,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  msgText: { 
    fontSize: 15, 
    lineHeight: 22 
  },


  // Message input bar styles
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingBottom: 4,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 11,
    marginRight: 10,
    fontSize: 15,
    color: COLORS.textMain,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    maxHeight: 120,
    minHeight: 45,
    textAlignVertical: 'center',
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    width: 46,
    height: 46,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
});