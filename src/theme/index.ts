// ─────────────────────────────────────────────────────────────────────────────
// BIRDIFY DESIGN SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

// ─── PALETA PRIMARIA ─────────────────────────────────────────────────────────
export const Colors = {
  // Primary Palette — Action & Brand Anchors
  primary: '#154212',         // Forest Green  — botones principales, logo
  container: '#305A27',       // Misty Pine     — contenedores activos
  subContainer: '#90D880',    // Sapling Tint   — sub-contenedores, chips
  springMoss: '#A3D494',      // Spring Moss    — estados hover, tintes suaves

  // Surface & Canvas — Backgrounds & Materiality
  surface: '#F8F8F8',         // Surface        — fondo de pantallas
  surfaceDim: '#E8DAD8',      // Surface Dim    — fondo tenue, modales
  canvasPure: '#FEFEFE',      // Canvas Pure    — blanco puro, tarjetas
  componentBase: '#F7F8F7',   // Component Base — bases de inputs/botones
  deepTerrain: '#1F3131',     // Deep Terrain   — headers oscuros, nav bars

  // Secondary & Accents — Notifications & Semantics
  secondaryBlue: '#30628A',   // Secondary Blue — información, links
  tertiaryBrown: '#553132',   // Tertiary Brown — alertas secundarias
  errorRed: '#8A1A1A',        // Error Red      — errores, destructivo
  outlineGrey: '#77796E',     // Outline Grey   — bordes inactivos, iconos

  // Chat Semantics (Light Mode - Contrast AA compliant >= 4.5:1)
  chatBackground: '#F1F4EF',
  bubbleMine: '#154212',
  bubbleMineText: '#FEFEFE',
  bubbleMineMeta: 'rgba(254, 254, 254, 0.75)',
  bubbleTheirs: '#FEFEFE',
  bubbleTheirsText: '#1F3131',
  bubbleTheirsMeta: '#5F6B5F',
  bubbleBorder: '#E2E8E0',
  quoteMineBg: 'rgba(254, 254, 254, 0.16)',
  quoteTheirsBg: '#EEF3EC',
  danger: '#C62828',
  warning: '#B26A00',
  readTick: '#7FD1FF',

  // Aliases semánticos (retrocompatibilidad)
  background: '#F8F8F8',
  inputBackground: '#F7F8F7',
  inputBorder: '#77796E',
  placeholder: '#77796E',
  textPrimary: '#1F3131',
  textSecondary: '#77796E',
  textOnPrimary: '#FEFEFE',
  accent: '#305A27',
  border: '#77796E',
  headerBorder: '#90D880',

  // Utilidad
  white: '#FEFEFE',
  black: '#1F3131',
  transparent: 'transparent',

  primaryLight: '#305A27',
  primaryDark: '#154212',
};

export const DarkColors = {
  // Primary Palette (inverted for dark mode)
  primary: '#1f7a00',         // Spring Moss as primary
  container: '#154212',
  subContainer: '#305A27',
  springMoss: '#154212',

  // Surface & Canvas — Backgrounds
  surface: '#121212',         // Deep Black
  surfaceDim: '#1F1F1F',      // Dark Grey
  canvasPure: '#1E1E1E',      // Card Background
  componentBase: '#2C2C2C',   // Input Base
  deepTerrain: '#000000',

  // Secondary & Accents
  secondaryBlue: '#4A90E2',
  tertiaryBrown: '#A67B7C',
  errorRed: '#FF5252',
  outlineGrey: '#555555',

  // Chat Semantics (Dark Mode - Contrast AA compliant >= 4.5:1)
  chatBackground: '#0F1410',
  bubbleMine: '#1B6310',
  bubbleMineText: '#FEFEFE',
  bubbleMineMeta: 'rgba(254, 254, 254, 0.78)',
  bubbleTheirs: '#222822',
  bubbleTheirsText: '#FEFEFE',
  bubbleTheirsMeta: '#8C9A8C',
  bubbleBorder: '#2E382E',
  quoteMineBg: 'rgba(254, 254, 254, 0.16)',
  quoteTheirsBg: '#182018',
  danger: '#FF5252',
  warning: '#FFB74D',
  readTick: '#5CC3FF',

  // Aliases semánticos
  background: '#121212',
  inputBackground: '#1E1E1E',
  inputBorder: '#444444',
  placeholder: '#888888',
  textPrimary: '#FEFEFE',
  textSecondary: '#A0A0A0',
  textOnPrimary: '#121212',
  accent: '#1f7a00',
  border: '#333333',
  headerBorder: '#154212',

  // Utilidad
  white: '#FEFEFE',
  black: '#000000',
  transparent: 'transparent',

  // Social
  googleBg: '#1E1E1E',
  appleBg: '#1E1E1E',

  primaryLight: '#C2E8B8',
  primaryDark: '#154212',
};

// Paleta de colores para remitentes en grupos (determinista por id)
const SENDER_COLORS_LIGHT = [
  '#00796B', // Teal
  '#1976D2', // Blue
  '#C2185B', // Pink
  '#7B1FA2', // Purple
  '#E65100', // Orange
  '#388E3C', // Green
  '#5D4037', // Brown
  '#0097A7', // Cyan
];

const SENDER_COLORS_DARK = [
  '#4DB6AC', // Light Teal
  '#64B5F6', // Light Blue
  '#F06292', // Light Pink
  '#BA68C8', // Light Purple
  '#FFB74D', // Light Orange
  '#81C784', // Light Green
  '#BCAAA4', // Light Brown
  '#4DD0E1', // Light Cyan
];

export function getSenderColor(userId: string | undefined, isDark = false): string {
  if (!userId) return isDark ? SENDER_COLORS_DARK[0] : SENDER_COLORS_LIGHT[0];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const colors = isDark ? SENDER_COLORS_DARK : SENDER_COLORS_LIGHT;
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// ─── TIPOGRAFÍA ──────────────────────────────────────────────────────────────
export const Typography = {
  // Fuente de títulos/navegación — Plus Jakarta Sans
  fontFamilyDisplay: 'PlusJakartaSans',

  // Fuente de cuerpo/lectura — Be Vietnam Pro
  fontFamilyBody: 'BeVietnamPro',

  // Tamaños
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 26,
    xxl: 32,
    xxxl: 40,
  },

  // Pesos
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },

  // Altura de línea
  lineHeight: {
    tight: 18,
    normal: 24,
    relaxed: 32,
    loose: 40,
  },
};

// ─── ESPACIADO ────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── BORDES ───────────────────────────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// ─── ELEVACIÓN / SOMBRAS ──────────────────────────────────────────────────────
export const Shadows = {
  none: {},
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  active: {
    shadowColor: '#154212',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  button: {
    shadowColor: '#154212',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
};
