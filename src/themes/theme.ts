export const theme = {
  colors: {
    primaryEco: "#2f6e3e",
    secondaryEco: "#4caf50",
    primarySocio: "#1f6f8b",
    secondarySocio: "#3fa7c4",
    background: "#eef3ef",
    danger: "#CC3E14",
    warning: "#e45600",
    success: "#46d919",
    white: "#ffffff",
    grey: "#6b7280",
    black: "#000000",
  },
  section: {
    gap: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
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
      primary: "Roboto",
      secondary: "Courier_Prime",
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  shadows: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
  },
} as const;
