import type { ParticipationProgress } from '@/shared/lib/impact-progress.utils';

export interface ImpactCardNextEvent {
  title: string;
  startAt: string;
}

export interface ImpactCardProps {
  isLoading: boolean;
  totalImpactScore: number;
  progress: ParticipationProgress;
  nextEvent: ImpactCardNextEvent | null;
}
