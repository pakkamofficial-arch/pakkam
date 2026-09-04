import { Platform } from 'react-native';

export const Colors = {
  background: '#EAF6EC',      // app-wide mint/light-green background per master prompt
  surface: '#FFFFFF',         // cards, sheets, inputs
  surfaceSecondary: '#F3F4F6',
  primary: '#2E7D32',         // main green — buttons, active states, icons
  primaryDark: '#1B5E20',
  accentOrange: '#F5A623',    // cart badge, "Pancing"/pending stat
  danger: '#E53935',          // discounts, closed status, reject button
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#6B6B6B',
  textPlaceholder: '#9CA3AF',
  border: '#E3E3E3',
  chipBackground: '#F2F2F2',
  chipSelected: '#DCEFDD',
  white: '#FFFFFF',
  lightSurface: '#DCEFDD',
  amberPill: '#FEF3C7',
  amberText: '#D97706',
};

export const Radii = { sm: 8, md: 12, lg: 16, pill: 999, badge: 4, input: 12, button: 12, card: 16 };
export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const Shadow = {
  card:
    Platform.OS === 'web'
      ? ({ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)' } as any)
      : { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
};

export const typography = {
  fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  sizes: {
    xs: 11,
    sm: 12,
    md: 14,
    base: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    display: 26,
  },
};

export const tokens = {
  colors: Colors,
  radii: Radii,
  spacing: Spacing,
  shadow: Shadow,
  typography,
};

export type Tokens = typeof tokens;
