import { useState, useEffect, useCallback } from 'react';
import HealthCheckService, { HealthCheckResult } from '@/lib/healthCheck';

export const useHealthCheck = (checkOnMount: boolean = true) => {
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult>({
    isHealthy: true,
    isMaintenance: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async (useCache: boolean = true) => {
    setIsLoading(true);
    try {
      const result = await HealthCheckService.checkHealth(useCache);
      setHealthStatus(result);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check hook error:', error);
      // Set to maintenance mode on error
      setHealthStatus({
        isHealthy: false,
        isMaintenance: true,
        error: 'Failed to check system health'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (checkOnMount) {
      checkHealth();
    }
  }, [checkOnMount, checkHealth]);

  return {
    healthStatus,
    isLoading,
    lastChecked,
    checkHealth,
    refetch: () => checkHealth(false) // Force fresh check
  };
};
