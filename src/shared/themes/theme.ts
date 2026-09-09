export type AppThemeColors = {
  text: string;
  reversed: string;
  primaryEco: string;
  darkGreen: string;
  secondaryEco: string;
  primarySocio: string;
  secondarySocio: string;
  background: string;
  danger: string;
  warning: string;
  success: string;
  white: string;
  grey: string;
  lightGrey: string;
  black: string;
  info: string;
  gold: string;
  goldText: string;
  goldBackground: string;
  goldBorder: string;
  skeletonGrey: string;
  whiteOverlay: string;
  adminActive: string;
  adminInactive: string;
  separator: string;
  blackOverlay: string;
};

export const lightTheme = {
  colors: {
    text: '#000',
    reversed: '#ffffff',
    primaryEco: '#2f6e3e',
    darkGreen: '#1b3a20',
    secondaryEco: '#4caf50',
    primarySocio: '#1f6f8b',
    secondarySocio: '#3fa7c4',
    background: '#eef3ef',
    danger: '#CC3E14',
    warning: '#e45600',
    success: '#46d919',
    white: '#ffffff',
    grey: '#6b7280',
    lightGrey: '#e0e0e0',
    black: '#000000',
    info: '#0066cc',
    gold: '#D4AF37',
    goldText: '#B8860B',
    goldBackground: '#F9F5EB',
    goldBorder: '#E6D3A3',
    skeletonGrey: '#D9D9D9',
    whiteOverlay: 'rgba(255, 255, 255, 0.2)',
    adminActive: '#1a73e8',
    adminInactive: '#5f6368',
    separator: '#f0f0f0',
    blackOverlay: 'rgba(0, 0, 0, 0.4)',
  },
  section: {
    gap: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 20,
    full: 9999,
  },
  typography: {
    fonts: {
      primary: 'Roboto',
      secondary: 'Courier_Prime',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
  },
  components: {
    avatar: {
      sm: 24,
      md: 40,
    },
    progressBar: {
      height: 6,
    },
  },
};

export type AppTheme = typeof lightTheme;

export const darkTheme: AppTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    reversed: '#000',
    text: '#ffffff',
    background: '#121212',
    white: '#1e1e1e',
    black: '#ffffff',
    grey: '#a0aab5',
    lightGrey: '#2c2c2c',
    separator: '#333333',
    whiteOverlay: 'rgba(255, 255, 255, 0.1)',
    blackOverlay: 'rgba(0, 0, 0, 0.7)',
    skeletonGrey: '#333333',
  },
};

// Legacy export for files that haven't been migrated to useAppTheme yet
export const theme = lightTheme;
