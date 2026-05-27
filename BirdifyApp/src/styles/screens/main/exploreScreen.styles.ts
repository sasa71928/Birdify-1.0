import { StyleSheet } from 'react-native';
import { Colors, Spacing, Shadows } from '../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.card,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  filterButton: {
    padding: Spacing.xs,
  },
  // Marcadores personalizados del mapa
  pinWrapper: {
    alignItems: 'center',
  },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.canvasPure,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  pinArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.canvasPure,
    marginTop: -1,
  },
  // Botón de target
  locationButton: {
    position: 'absolute',
    bottom: 90, // Por encima del BottomNavBar
    right: Spacing.md,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  customMarker: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: colors.primary,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 3,
  borderColor: colors.surface,
},

customMarkerActive: {
  transform: [{ scale: 1.12 }],
},

calloutContainer: {
  position: 'absolute',
  alignSelf: 'center',
  minWidth: 140,
  backgroundColor: colors.surface,
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: 'center',
  top: 250
},

calloutTitle: {
  color: colors.textPrimary,
  fontSize: 14,
  fontWeight: '700',
},

calloutSubtitle: {
  color: colors.textSecondary,
  fontSize: 12,
  marginTop: 2,
},

calloutHint: {
  color: colors.primary,
  fontSize: 11,
  marginTop: 6,
  fontWeight: '600',
},
});

