import { useMutation } from '@tanstack/react-query';
import type { RecordEventFeedbackWebResponse } from '@volontariapp/contracts';
import { rankingApi } from '../ranking.api';

export interface RecordEventFeedbackVariables {
  eventIds: string[];
}

export const useRecordEventFeedback = () => {
  return useMutation<RecordEventFeedbackWebResponse, Error, RecordEventFeedbackVariables>({
    mutationFn: async ({ eventIds }: RecordEventFeedbackVariables) => {
      return rankingApi.recordFeedback(eventIds);
    },
  });
};
