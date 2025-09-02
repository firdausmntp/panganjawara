import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import MaintenanceModal from '@/components/maintenance/MaintenanceModal';
import { HealthCheckResult } from '@/lib/healthCheck';

interface HealthCheckContextType {
  healthStatus: HealthCheckResult;
  isLoading: boolean;
  lastChecked: Date | null;
  checkHealth: () => void;
  forceRefetch: () => void;
}

const HealthCheckContext = createContext<HealthCheckContextType | undefined>(undefined);

export const useHealthCheckContext = () => {
  const context = useContext(HealthCheckContext);
  if (context === undefined) {
    throw new Error('useHealthCheckContext must be used within a HealthCheckProvider');
  }
  return context;
};

interface HealthCheckProviderProps {
  children: React.ReactNode;
}

export const HealthCheckProvider: React.FC<HealthCheckProviderProps> = ({ children }) => {
  const { healthStatus, isLoading, lastChecked, checkHealth, refetch } = useHealthCheck(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Check health on route change
  useEffect(() => {
    const doHealthCheck = async () => {
      await checkHealth();
    };

    doHealthCheck();
  }, [location.pathname, checkHealth]);

  // Show/hide maintenance modal based on health status
  useEffect(() => {
    if (!healthStatus.isHealthy || healthStatus.isMaintenance) {
      setShowMaintenanceModal(true);
    } else {
      setShowMaintenanceModal(false);
    }
  }, [healthStatus]);

  // Prevent navigation when in maintenance
  useEffect(() => {
    if (healthStatus.isMaintenance && location.pathname !== '/maintenance') {
      // Store the intended destination
      sessionStorage.setItem('intendedPath', location.pathname);
    }
  }, [healthStatus.isMaintenance, location.pathname, navigate]);

  const handleRetry = () => {
    refetch();
  };

  const contextValue: HealthCheckContextType = {
    healthStatus,
    isLoading,
    lastChecked,
    checkHealth,
    forceRefetch: refetch
  };

  return (
    <HealthCheckContext.Provider value={contextValue}>
      {children}
      
      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={showMaintenanceModal}
        healthData={healthStatus.data}
        error={healthStatus.error}
        onRetry={handleRetry}
        isRetrying={isLoading}
      />
    </HealthCheckContext.Provider>
  );
};
