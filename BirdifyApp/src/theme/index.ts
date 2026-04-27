// ─── COLORES ────────────────────────────────────────────────────────────────
export const Colors = {
  // Marca principal
  primary: '#1B6E4B',        // Verde oscuro (botones, logo, íconos principales)
  primaryLight: '#2E8B62',   // Verde medio (hover / press states)
  primaryDark: '#144F36',    // Verde muy oscuro

  // Fondo
  background: '#F0F4F3',     // Gris-verde muy claro (fondo general)
  surface: '#FFFFFF',        // Blanco (tarjetas / formularios)

  // Inputs
  inputBackground: '#F2F4F3', // Gris clarísimo para los campos
  inputBorder: '#DDE3E0',     // Borde sutil de inputs
  placeholder: '#A0AEAA',     // Texto placeholder

  // Texto
  textPrimary: '#1A2B25',    // Casi negro con tinte verde
  textSecondary: '#6B7E78',  // Gris-verde para subtítulos / labels
  textOnPrimary: '#FFFFFF',  // Blanco sobre fondo verde

  // Acento / link
  accent: '#1B6E4B',         // Mismo verde para links activos

  // Bordes y divisores
  border: '#DDE3E0',

  // Social buttons
  googleBg: '#FFFFFF',
  appleBg: '#FFFFFF',

  // Utilidad
  white: '#FFFFFF',
  transparent: 'transparent',

  // Barra superior
  headerBorder: '#B2D8C8',   // Línea punteada azul-verdosa del header

};

// ─── TIPOGRAFÍA ─────────────────────────────────────────────────────────────
export const Typography = {
  // Tamaños
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 26,
    xxl: 32,
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
    tight: 20,
    normal: 24,
    relaxed: 32,
    loose: 40,
  },
};

// ─── ESPACIADO ───────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── BORDES ──────────────────────────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// ─── SOMBRAS ─────────────────────────────────────────────────────────────────
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    shadowColor: '#1B6E4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
};
