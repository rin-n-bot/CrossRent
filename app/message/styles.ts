import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const scale = (size: number) => (width / BASE_WIDTH) * size;
export const scaleV = (size: number) => (height / BASE_HEIGHT) * size;

export const CONVO_COLORS = {
  primary: '#AF0B01',
  dark: '#222D31',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  border: '#F0F0F0',
  textMain: '#222D31',
  textMuted: '#9CA3AF',
  inputBg: '#d9dfe665',
};

export const BUBBLE_MIN_WIDTH = scale(60);
export const BUBBLE_MAX_WIDTH = width * 0.75;
export const BUBBLE_AVATAR_SIZE = scale(28);
export const HEADER_AVATAR_SIZE = scale(34);

export const convoStyles = StyleSheet.create({

  // Root screen container
  screenContainer: {
    flex: 1,
    backgroundColor: CONVO_COLORS.background,
  },

  // Red branded header bar
  redHeaderBar: {
    backgroundColor: CONVO_COLORS.primary,
  },

  // SafeAreaView inside the red header
  redHeaderSafeArea: {
    backgroundColor: CONVO_COLORS.primary,
  },

  // Inner row of the header
  headerInnerRow: {
    height: scaleV(50),
    paddingTop: scaleV(10),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
  },

  // Back button touch target
  backButton: {
    padding: scale(5),
  },

  // Recipient email label in header
  headerRecipientLabel: {
    fontSize: scale(16),
    fontWeight: '700',
    color: CONVO_COLORS.surface,
    marginLeft: scale(10),
    textAlign: 'left',
  },

  // Scrollable message list area
  contentArea: {
    flex: 1,
    backgroundColor: CONVO_COLORS.background,
  },

  // Time divider pill wrapper
  timeDividerWrapper: {
    alignItems: 'center',
    marginVertical: scaleV(15),
  },

  // Time divider pill label
  timeDividerLabel: {
    fontSize: scale(11),
    fontWeight: '600',
    color: CONVO_COLORS.textMuted,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: scale(10),
    paddingVertical: scaleV(3),
    borderRadius: scale(10),
    overflow: 'hidden',
  },

  // Message row wrapper
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: scaleV(4),
    paddingHorizontal: scale(12),
  },

  // Avatar placeholder to keep spacing consistent mid-group
  avatarPlaceholder: {
    width: BUBBLE_AVATAR_SIZE,
    height: BUBBLE_AVATAR_SIZE,
    marginRight: scale(6),
  },

  // Message input bar container
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: scale(15),
    paddingVertical: scaleV(12),
    backgroundColor: CONVO_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: CONVO_COLORS.border,
    paddingBottom: scaleV(4),
  },

  // Multiline text input
  textInput: {
    flex: 1,
    backgroundColor: CONVO_COLORS.inputBg,
    borderRadius: scale(25),
    paddingHorizontal: scale(15),
    paddingVertical: Platform.OS === 'ios' ? scaleV(10) : scaleV(11),
    marginRight: scale(10),
    fontSize: scale(15),
    color: CONVO_COLORS.textMain,
    borderWidth: 1,
    borderColor: CONVO_COLORS.inputBg,
    maxHeight: scaleV(120),
    minHeight: scaleV(45),
    textAlignVertical: 'center',
  },

  // Send button
  sendButton: {
    backgroundColor: CONVO_COLORS.primary,
    width: scale(46),
    height: scale(46),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
});