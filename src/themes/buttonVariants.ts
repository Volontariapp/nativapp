import {theme} from "@/themes/theme";

export const BUTTON_VARIANTS = {
  eco: {
    backgroundColor: theme.colors.primaryEco,
    textColor: theme.colors.white,
    borderColor: theme.colors.black,
  },
  socio: {
    backgroundColor: theme.colors.primarySocio,
    textColor: theme.colors.white,
    borderColor: theme.colors.black,
  },
  secondary: {
    backgroundColor: theme.colors.white,
    textColor: theme.colors.black,
    borderColor: theme.colors.grey,
  },
  danger: {
    backgroundColor: theme.colors.danger,
    textColor: theme.colors.white,
    borderColor: theme.colors.black,
  }
};

export const ICONS_BUTTON_VARIANTS = {
  eco: {
    backgroundColor: theme.colors.primaryEco,
    textColor: theme.colors.white,
  },
  socio: {
    backgroundColor: theme.colors.primarySocio,
    textColor: theme.colors.white,
  },
  danger: {
    backgroundColor: theme.colors.danger,
    textColor: theme.colors.white,
  },
  noBackground: {
    backgroundColor: theme.colors.danger,
    textColor: theme.colors.white,
  }
};
