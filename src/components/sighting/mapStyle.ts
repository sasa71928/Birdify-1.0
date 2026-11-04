export const createMapStyle = (colors: any) => [
  {
    elementType: 'geometry',
    stylers: [{ color: colors.surfaceDim }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: colors.textPrimary }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: colors.surface }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.neighborhood',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: colors.componentBase }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: colors.canvasPure }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: colors.deepTerrain }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: colors.surfaceDim }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: colors.surface }],
  },
];

