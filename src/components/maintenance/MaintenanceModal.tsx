import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Clock, 
  Database, 
  RefreshCw, 
  Server,
  Wifi,
  WifiOff
} from 'lucide-react';
import HealthCheckService, { HealthStatus } from '@/lib/healthCheck';

interface MaintenanceModalProps {
  isOpen: boolean;
  healthData?: HealthStatus;
  error?: string;
  onRetry: () => void;
  isRetrying: boolean;
}

const MaintenanceModal = ({ 
  isOpen, 
  healthData, 
  error, 
  onRetry, 
  isRetrying 
}: MaintenanceModalProps) => {
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetrySeconds, setAutoRetrySeconds] = useState(0);

  // Auto retry countdown
  useEffect(() => {
    if (isOpen && autoRetrySeconds > 0) {
      const timer = setTimeout(() => {
        setAutoRetrySeconds(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoRetrySeconds === 0 && isOpen && retryCount < 3) {
      // Auto retry after countdown
      handleRetry();
    }
  }, [autoRetrySeconds, isOpen, retryCount]);

  // Start auto retry countdown when modal opens
  useEffect(() => {
    if (isOpen && retryCount === 0) {
      setAutoRetrySeconds(30); // 30 second countdown
    }
  }, [isOpen]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setAutoRetrySeconds(60); // Next retry in 60 seconds
    onRetry();
  };

  const getStatusIcon = () => {
    if (error) {
      return <WifiOff className="h-12 w-12 text-red-500" />;
    }
    if (healthData?.status === 'maintenance') {
      return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    }
    return <Server className="h-12 w-12 text-gray-500" />;
  };

  const getStatusMessage = () => {
    if (error) {
      return {
        title: 'Tidak Dapat Terhubung',
        description: 'Sistem sedang mengalami gangguan koneksi. Kami sedang berusaha memulihkan layanan.'
      };
    }
    if (healthData?.status === 'maintenance') {
      return {
        title: 'Sistem Dalam Pemeliharaan',
        description: 'Pangan Jawara sedang dalam tahap pemeliharaan untuk meningkatkan kualitas layanan.'
      };
    }
    return {
      title: 'Sistem Tidak Tersedia',
      description: 'Layanan sedang tidak tersedia saat ini.'
    };
  };

  const statusMessage = getStatusMessage();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <DialogTitle className="text-xl font-bold">
            {statusMessage.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {statusMessage.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Health Status Details */}
          {healthData && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={healthData.status === 'ok' ? 'default' : 'destructive'}>
                    {healthData.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database:</span>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <Badge variant={healthData.database === 'connected' ? 'default' : 'destructive'}>
                      {healthData.database}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Environment:</span>
                  <Badge className={HealthCheckService.getEnvironmentColor(healthData.environment)}>
                    {healthData.environment}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime:</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {HealthCheckService.formatUptime(healthData.uptime)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Check:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(healthData.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Details */}
          {error && (
            <Card className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <WifiOff className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900 mb-1">Error Details</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Auto Retry Countdown */}
          {autoRetrySeconds > 0 && (
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Auto retry dalam:</span>
                  </div>
                  <Badge variant="secondary">
                    {autoRetrySeconds}s
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manual Retry Button */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full"
            >
              {isRetrying && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {isRetrying ? 'Memeriksa...' : 'Coba Lagi Sekarang'}
            </Button>

            {retryCount > 0 && (
              <p className="text-xs text-center text-gray-600">
                Percobaan ke-{retryCount} dari 5
              </p>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-600 space-y-1">
            <p>Jika masalah berlanjut, silakan:</p>
            <div className="space-y-1">
              <p>• Periksa koneksi internet Anda</p>
              <p>• Coba refresh halaman browser</p>
              <p>• Hubungi tim support jika diperlukan</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceModal;
