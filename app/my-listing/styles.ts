import { StyleSheet } from 'react-native';
import { COLORS, LAYOUT, scale, SPACING } from '../../styles/global'; 


export const listingStyles = StyleSheet.create({
  

  // SCREEN LAYOUT CONTAINERS
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  


  // HEADER STYLING
  header: {
    backgroundColor: COLORS.accent,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },

  headerContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: LAYOUT.horizontalPadding,

  paddingVertical: 12, // 👈 THIS replaces fixed height
},

  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: scale(18),
    fontWeight: '600',
    textAlign: 'center',
    marginRight: scale(28), 
  },


  // LIST AND CARD DESIGN
  listContainer: {
    padding: LAYOUT.horizontalPadding,
    paddingBottom: scale(100),
    marginTop: scale(-10),
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: LAYOUT.borderRadius,
    marginBottom: SPACING.md, 
    flexDirection: 'row',
    padding: scale(15), 
    borderWidth: 1.5,
    borderColor: '#ffffff', 
    elevation: 0, 
    shadowColor: 'transparent', 
  },

  
  // BADGE AND STATUS INDICATORS
  statusBadge: {
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: scale(4),
    alignSelf: 'flex-start', 
    marginTop: scale(6),
  },

  statusText: {
    fontSize: scale(10),
    fontWeight: '500',
    textTransform: 'uppercase',
  },


  // ITEM DETAIL STYLING
  itemImage: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(10),
    backgroundColor: COLORS.lightBackground,
  },

  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },

  itemTitle: {
    fontSize: scale(15),
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  itemPrice: {
    fontSize: scale(14),
    fontWeight: '500',
    color: COLORS.accent,
    marginTop: SPACING.xs,
  },

  
  // ACTION BUTTONS STYLING
  actions: {
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: SPACING.sm,
  },

  actionBtn: {
    padding: SPACING.sm,
  },

  
  // EMPTY STATE UI
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scale(250),
  },

  emptyText: {
    fontSize: scale(16),
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: SPACING.md,
  }
});