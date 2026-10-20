import { useMutation } from '@tanstack/react-query';
import type { UpdateUserLocationWebResponse } from '@volontariapp/contracts';
import { rankingApi } from '../ranking.api';

export interface UpdateLocationVariables {
  lat: number;
  lng: number;
}

export const useUpdateLocation = () => {
  return useMutation<UpdateUserLocationWebResponse, Error, UpdateLocationVariables>({
    mutationFn: async ({ lat, lng }: UpdateLocationVariables) => {
      return rankingApi.updateLocation(lat, lng);
    },
  });
};
