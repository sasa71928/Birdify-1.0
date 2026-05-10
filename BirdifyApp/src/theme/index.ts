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
  primary: '#A3D494',         // Spring Moss as primary
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

  // Aliases semánticos
  background: '#121212',
  inputBackground: '#1E1E1E',
  inputBorder: '#444444',
  placeholder: '#888888',
  textPrimary: '#FEFEFE',
  textSecondary: '#A0A0A0',
  textOnPrimary: '#121212',
  accent: '#A3D494',
  border: '#333333',
  headerBorder: '#154212',

  // Utilidad
  white: '#FEFEFE',
  black: '#000000',
  transparent: 'transparent',

  // Social
  googleBg: '#1E1E1E',
  appleBg: '#1E1E1E',
};

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
// Level 0: Base — no shadow
// Level 1: Cards — 4px blur
// Level 2: Modals — 12px blur
// Level 3: Active — Primary Glow
export const Shadows = {
  // Level 0
  none: {},

  // Level 1 — Cards
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  // Level 2 — Modals
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },

  // Level 3 — Active / Primary Glow
  active: {
    shadowColor: '#154212',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },

  // Alias retrocompatible
  button: {
    shadowColor: '#154212',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
};
