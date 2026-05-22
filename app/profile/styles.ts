import { Dimensions, StyleSheet } from 'react-native';


// UTILITY: SCREEN DIMENSIONS AND SCALING CALCULATION
const { width } = Dimensions.get('window');
export const scale = (size: number) => (width / 375) * size;


// STYLESHEET: PROFILE SCREEN STYLING
export const profileStyles = StyleSheet.create({


  // CORE CONTAINER STYLES
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },


  // TOP NAVIGATION HEADER STYLES
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    height: scale(60),
  },
  navTitle: {
    flex: 1,
    fontSize: scale(20),
    fontWeight: '600',
    color: '#222D31',
    letterSpacing: -1,
    marginLeft: scale(15),
  },
  navAction: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#AF0B01',
  },


  // PROFILE AVATAR SECTION STYLES
  avatarSection: {
    alignItems: 'center',
    marginTop: scale(30),
    paddingTop: scale(28),
    paddingBottom: scale(24),
    paddingHorizontal: scale(20),
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: scale(14),
  },
  avatar: {
    width: scale(88),
    height: scale(88),
    borderRadius: scale(44),
    backgroundColor: '#222D31',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: scale(88),
    height: scale(88),
    borderRadius: scale(44),
  },
  avatarInitials: {
    fontSize: scale(30),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#AF0B01',
    borderRadius: scale(11),
    width: scale(22),
    height: scale(22),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },


  // USER IDENTITY TEXT STYLES
  userName: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#222D31',
    letterSpacing: -0.5,
    textTransform: 'lowercase',
  },
  userEmail: {
    fontSize: scale(12),
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: scale(3),
    textTransform: 'lowercase',
  },
  memberSince: {
    fontSize: scale(12),
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: scale(4),
  },


  // STATISTICS COMPONENT STYLES
  statsRow: {
    flexDirection: 'row',
    marginTop: scale(50),
    gap: scale(10),
    width: '100%',
  },
  statCard: {
    flex: 1,
    borderRadius: scale(12),
    paddingVertical: scale(14),
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  statNumber: {
    fontSize: scale(20),
    fontWeight: '600',
    color: '#222D31',
  },
  statLabel: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: scale(2),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },


  statusBadgeVerified: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(6),
    backgroundColor: '#27AE60',
    alignSelf: 'flex-start',
  },
  statusTextVerified: {
    fontSize: scale(10),
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },


  // SECTION WRAPPER AND LABEL STYLES
  section: {
    paddingHorizontal: scale(20),
    paddingTop: scale(12),
    paddingBottom: scale(5),
  },
  sectionLabel: {
    fontSize: scale(15),
    fontWeight: '600',
    color: '#222D31',
    marginBottom: scale(10),
  },


  // DATA LIST CARD AND ROW STYLES
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: scale(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIcon: {
    marginRight: scale(12),
  },
  infoTextBlock: {
    flex: 1,
  },
  infoRowLabel: {
    fontSize: scale(13),
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0,
  },
  infoRowValue: {
    fontSize: scale(16),
    fontWeight: '500',
    color: '#222D31',
    marginTop: scale(2),
  },


  // FORM INPUT AND BIO STYLES
  bioInput: {
    fontSize: scale(16),
    color: '#222D31',
    marginTop: scale(2),
    padding: 0,
    minHeight: scale(44),
  },
  charCount: {
    fontSize: scale(12),
    fontWeight: '500',
    color: '#999',
    marginTop: scale(6),
    textAlign: 'right',
  },


  // PRIMARY ACTION BUTTON STYLES
  saveBtn: {
    marginHorizontal: scale(20),
    marginTop: scale(28),
    marginBottom: scale(40),
    backgroundColor: '#222D31',
    borderRadius: scale(12),
    height: scale(50),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: scale(15),
    fontWeight: '600',
  },
  saveBtnDisabled: {
    backgroundColor: '#cfd4da',
  },
});