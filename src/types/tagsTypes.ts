import { theme } from "@/themes/theme";

export interface Tag {
  icon?: string;
  name: TagsNames;
  textContent: string;
  textColor: string;
  backgroundColor: string;
}

export enum TagsNames {
  ECOLOGIE,
  SOCIAL,
  BENEVOLAT,
  CERTIFIED,
}

export const TAGS_CONFIG: Record<TagsNames, Tag> = {
  [TagsNames.ECOLOGIE]: {
    name: TagsNames.ECOLOGIE,
    textContent: "Écologie",
    textColor: theme.colors.white,
    backgroundColor: theme.colors.secondaryEco,
  },
  [TagsNames.SOCIAL]: {
    name: TagsNames.SOCIAL,
    textContent: "Social",
    textColor: theme.colors.white,
    backgroundColor: theme.colors.secondarySocio,
  },
  [TagsNames.BENEVOLAT]: {
    name: TagsNames.BENEVOLAT,
    textContent: "Bénévolat",
    textColor: theme.colors.white,
    backgroundColor: "#ab9471",
  },
  [TagsNames.CERTIFIED]: {
    icon: "check-circle",
    name: TagsNames.CERTIFIED,
    textContent: "Compte certifié",
    textColor: theme.colors.white,
    backgroundColor: theme.colors.secondaryEco,
  },
};
