import { theme } from '@/shared/themes/theme';
import { TagsNames } from '@volontariapp/shared';

export interface Tag {
  icon?: string;
  name: TagsNames;
  textContent: string;
  textColor: string;
  backgroundColor: string;
}

export const TAGS_CONFIG: Record<TagsNames, Tag> = {
  [TagsNames.ECOLOGIE]: {
    name: TagsNames.ECOLOGIE,
    textContent: 'Écologie',
    textColor: theme.colors.white,
    backgroundColor: theme.colors.secondaryEco,
  },
  [TagsNames.SOCIAL]: {
    name: TagsNames.SOCIAL,
    textContent: 'Social',
    textColor: theme.colors.white,
    backgroundColor: theme.colors.secondarySocio,
  },
  [TagsNames.BENEVOLAT]: {
    name: TagsNames.BENEVOLAT,
    textContent: 'Bénévolat',
    textColor: theme.colors.white,
    backgroundColor: '#ab9471',
  },
  [TagsNames.CERTIFIED]: {
    icon: 'check-circle',
    name: TagsNames.CERTIFIED,
    textContent: 'Compte certifié',
    textColor: theme.colors.white,
    backgroundColor: theme.colors.secondaryEco,
  },
};

export interface TypeBadge {
  icon?: string;
  name?: TagsNames;
  textContent: string;
  textColor: string;
  backgroundColor: string;
}

export const EVENT_TYPE_CONFIG: Record<string, TypeBadge> = {
  EVENT_TYPE_ECOLOGY: {
    name: TagsNames.ECOLOGIE,
    textContent: 'Écologie',
    textColor: theme.colors.white,
    backgroundColor: theme.colors.secondaryEco,
  },
  EVENT_TYPE_SOCIAL: {
    name: TagsNames.SOCIAL,
    textContent: 'Social',
    textColor: theme.colors.white,
    backgroundColor: theme.colors.secondarySocio,
  },
  EVENT_TYPE_UNSPECIFIED: {
    textContent: 'Non spécifié',
    textColor: theme.colors.black,
    backgroundColor: theme.colors.grey,
  },
  UNRECOGNIZED: {
    textContent: 'Unrecognised',
    textColor: theme.colors.danger,
    backgroundColor: theme.colors.grey,
  },
};
