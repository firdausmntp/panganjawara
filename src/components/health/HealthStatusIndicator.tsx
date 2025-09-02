import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Activity, 
  Database, 
  RefreshCw, 
  Clock, 
  Wifi, 
  WifiOff,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useHealthCheckContext } from '@/components/providers/HealthCheckProvider';
import HealthCheckService from '@/lib/healthCheck';

const HealthStatusIndicator = () => {
  const { healthStatus, isLoading, lastChecked, forceRefetch } = useHealthCheckContext();
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = () => {
    if (isLoading) return 'bg-yellow-500';
    if (!healthStatus.isHealthy || healthStatus.isMaintenance) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (healthStatus.error) return <WifiOff className="h-4 w-4" />;
    if (healthStatus.isMaintenance) return <AlertTriangle className="h-4 w-4" />;
    if (healthStatus.isHealthy) return <CheckCircle className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (healthStatus.error) return 'Connection Error';
    if (healthStatus.isMaintenance) return 'Maintenance';
    if (healthStatus.isHealthy) return 'Operational';
    return 'Unknown';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className="text-xs hidden sm:inline">System Status</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <h4 className="font-semibold">System Health</h4>
            </div>
            <Badge variant={healthStatus.isHealthy ? 'default' : 'destructive'}>
              {getStatusText()}
            </Badge>
          </div>

          {/* Health Details */}
          {healthStatus.data && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3" />
                  <span>Status:</span>
                  <Badge variant={healthStatus.data.status === 'ok' ? 'default' : 'destructive'}>
                    {healthStatus.data.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Database className="h-3 w-3" />
                  <span>DB:</span>
                  <Badge 
                    variant={healthStatus.data.database === 'connected' ? 'default' : 'destructive'}
                  >
                    {healthStatus.data.database}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 col-span-2">
                  <Clock className="h-3 w-3" />
                  <span>Uptime:</span>
                  <span className="text-xs">
                    {HealthCheckService.formatUptime(healthStatus.data.uptime)}
                  </span>
                </div>

                <div className="flex items-center gap-2 col-span-2">
                  <span className="text-xs text-gray-600">
                    Environment: {healthStatus.data.environment}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {healthStatus.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <WifiOff className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Connection Error</p>
                  <p className="text-xs text-red-700 mt-1">{healthStatus.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Last Checked */}
          {lastChecked && (
            <div className="text-xs text-gray-500 border-t pt-2">
              Last checked: {lastChecked.toLocaleString('id-ID')}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 border-t pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={forceRefetch}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
              Refresh
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HealthStatusIndicator;
