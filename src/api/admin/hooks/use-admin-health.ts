import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert } from 'react-native';
import { adminHealthApi } from '../admin.health.api';

const ADMIN_HEALTH_STATUS_QUERY_KEY = ['admin', 'healthStatus'] as const;

export const useAdminHealth = () => {
  const queryClient = useQueryClient();
  const [latency, setLatency] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const {
    data: isHealthy,
    isLoading,
    error,
  } = useQuery<boolean>({
    queryKey: ADMIN_HEALTH_STATUS_QUERY_KEY,
    queryFn: async () => {
      const start = Date.now();
      await adminHealthApi.checkHealth();
      setLatency(Date.now() - start);
      return true;
    },
    retry: false,
  });

  const handleManualCheck = async (): Promise<void> => {
    setIsChecking(true);
    try {
      const start = Date.now();
      await adminHealthApi.checkHealth();
      setLatency(Date.now() - start);
      void queryClient.invalidateQueries({ queryKey: ADMIN_HEALTH_STATUS_QUERY_KEY });
      Alert.alert('Succès', 'Le serveur répond normalement.');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      Alert.alert('Erreur', `Le serveur est injoignable : ${errorMsg}`);
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isHealthy,
    isLoading,
    error,
    latency,
    isChecking,
    handleManualCheck,
  };
};
