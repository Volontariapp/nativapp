export interface ParticipantSection<T> {
  key: 'followed' | 'others';
  title: string;
  data: T[];
}

interface BuildParticipantSectionsInput<T> {
  participants: readonly T[];
  /** Identifiants des comptes que je suis. */
  followedIds: ReadonlySet<string>;
  currentUserId: string | null | undefined;
}

/**
 * Ordonne les participants d'un evenement : les comptes que je suis d'abord, puis les autres,
 * chaque groupe gardant l'ordre du serveur. Je ne figure jamais parmi les comptes suivis (on ne
 * se suit pas) : ma ligne ouvre les autres participants.
 */
export const buildParticipantSections = <T extends { id: string }>({
  participants,
  followedIds,
  currentUserId,
}: BuildParticipantSectionsInput<T>): ParticipantSection<T>[] => {
  const isMe = (participant: T): boolean => participant.id === currentUserId;
  const followed = participants.filter((p) => !isMe(p) && followedIds.has(p.id));
  const others = participants.filter((p) => isMe(p) || !followedIds.has(p.id));
  const me = others.filter(isMe);
  const rest = others.filter((p) => !isMe(p));

  const sections: ParticipantSection<T>[] = [];
  if (followed.length > 0) {
    sections.push({ key: 'followed', title: `Vous suivez (${String(followed.length)})`, data: followed });
  }
  const orderedOthers = [...me, ...rest];
  if (orderedOthers.length > 0) {
    const title = followed.length > 0 ? 'Autres participants' : 'Participants';
    sections.push({ key: 'others', title: `${title} (${String(orderedOthers.length)})`, data: orderedOthers });
  }
  return sections;
};
