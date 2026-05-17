// app/(tabs)/transactions/styles.ts

import { StyleSheet, Dimensions } from 'react-native';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

const BASE_WIDTH = 375;

export const scale = (size: number) => (WINDOW_WIDTH / BASE_WIDTH) * size;

const CONTENT_PADDING = scale(20);
const CARD_RADIUS = scale(12);
const TEXT_DARK = '#222D31';
const TEXT_MUTED = '#9CA3AF';
const BACKGROUND_LIGHT = '#F5F5F5';
const COLOR_PRIMARY_RED = '#AF0B01';

export const transStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT,
  },

  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CONTENT_PADDING,
    height: scale(60),
  },

  logoMini: {
    fontSize: scale(20),
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -1,
  },

  card: {
    width: '100%',
    marginBottom: scale(10),
    borderRadius: CARD_RADIUS,
    backgroundColor: '#FFF',
    padding: scale(15),
    overflow: 'hidden',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },

  cardTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: TEXT_DARK,
  },

  cardTimestamp: {
    fontSize: scale(13),
    fontWeight: '700',
    color: TEXT_MUTED,
    marginBottom: scale(4),
  },

  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(5),
  },

  statusTextPlain: {
    fontSize: scale(10),
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  detailsToggle: {
    marginTop: scale(10),
    paddingTop: scale(10),
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(34),
  },

  detailsToggleText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: '#9CA3AF',
    marginRight: scale(4),
  },

  detailsPanel: {
    marginTop: scale(8),
    padding: scale(12),
    borderRadius: scale(10),
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: scale(5),
    gap: scale(12),
  },

  detailLabel: {
    flexShrink: 0,
    fontSize: scale(12),
    fontWeight: '600',
    color: TEXT_MUTED,
  },

  detailValue: {
    flex: 1,
    fontSize: scale(14),
    fontWeight: '600',
    color: TEXT_DARK,
    textAlign: 'right',
  },

  messageBtn: {
    borderRadius: CARD_RADIUS,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  messageBtnText: {
    color: '#FFFFFF',
    fontSize: scale(14),
    fontWeight: '800',
  },

  noResultsText: {
    fontSize: scale(14),
    color: '#cfd4da',
    fontWeight: '700',
  },
});