import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Database, 
  RefreshCw, 
  Clock, 
  Server, 
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useHealthCheckContext } from '@/components/providers/HealthCheckProvider';
import HealthCheckService from '@/lib/healthCheck';
import { useToast } from '@/hooks/use-toast';

const HealthDashboard = () => {
  const { healthStatus, isLoading, lastChecked, forceRefetch } = useHealthCheckContext();
  const { toast } = useToast();
  const [healthHistory, setHealthHistory] = useState<Array<{
    timestamp: Date;
    status: string;
    uptime: number;
  }>>([]);

  // Store health check results in history
  useEffect(() => {
    if (healthStatus.data) {
      setHealthHistory(prev => [
        ...prev.slice(-19), // Keep last 20 entries
        {
          timestamp: new Date(),
          status: healthStatus.data.status,
          uptime: healthStatus.data.uptime
        }
      ]);
    }
  }, [healthStatus]);

  const handleManualCheck = async () => {
    await forceRefetch();
    toast({
      title: "Health check completed",
      description: "System health has been refreshed.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'maintenance':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <WifiOff className="h-5 w-5 text-red-600" />;
    }
  };

  const calculateUptime = () => {
    if (!healthStatus.data?.uptime) return 0;
    const uptimeHours = healthStatus.data.uptime / 3600;
    const uptimePercentage = Math.min((uptimeHours / 24) * 100, 100); // Assume 24h = 100%
    return Math.round(uptimePercentage * 100) / 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <p className="text-gray-600">Monitor Pangan Jawara system status and performance</p>
        </div>
        <Button onClick={handleManualCheck} disabled={isLoading}>
          {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
          {isLoading ? 'Checking...' : 'Manual Check'}
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {healthStatus.data ? getStatusIcon(healthStatus.data.status) : <Activity className="h-4 w-4 text-gray-400" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthStatus.data?.status.toUpperCase() || 'UNKNOWN'}
            </div>
            <p className="text-xs text-muted-foreground">
              {healthStatus.isHealthy ? 'All systems operational' : 'Issues detected'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthStatus.data?.database.toUpperCase() || 'UNKNOWN'}
            </div>
            <p className="text-xs text-muted-foreground">
              Connection status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateUptime()}%
            </div>
            <p className="text-xs text-muted-foreground">
              {healthStatus.data ? HealthCheckService.formatUptime(healthStatus.data.uptime) : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Environment</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthStatus.data?.environment.toUpperCase() || 'UNKNOWN'}
            </div>
            <p className="text-xs text-muted-foreground">
              Current environment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Health Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Health Status</CardTitle>
            <CardDescription>
              Real-time system health information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthStatus.data ? (
              <>
                <div className={`p-4 rounded-lg border ${getStatusColor(healthStatus.data.status)}`}>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(healthStatus.data.status)}
                    <div>
                      <h4 className="font-semibold">
                        System {healthStatus.data.status.charAt(0).toUpperCase() + healthStatus.data.status.slice(1)}
                      </h4>
                      <p className="text-sm opacity-75">
                        {healthStatus.data.status === 'ok' 
                          ? 'All systems are functioning normally'
                          : healthStatus.data.status === 'maintenance'
                          ? 'System is currently under maintenance'
                          : 'System is experiencing issues'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Database:</span>
                      <Badge variant={healthStatus.data.database === 'connected' ? 'default' : 'destructive'}>
                        {healthStatus.data.database}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Environment:</span>
                      <Badge className={HealthCheckService.getEnvironmentColor(healthStatus.data.environment)}>
                        {healthStatus.data.environment}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span>{HealthCheckService.formatUptime(healthStatus.data.uptime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Checked:</span>
                      <span>{new Date(healthStatus.data.timestamp).toLocaleTimeString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No health data available</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleManualCheck}
                >
                  Check System Health
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health History */}
        <Card>
          <CardHeader>
            <CardTitle>Health History</CardTitle>
            <CardDescription>
              Recent health check results ({healthHistory.length} entries)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {healthHistory.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {healthHistory.slice().reverse().map((entry, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(entry.status)}
                      <span className="text-sm font-medium">
                        {entry.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">
                        {entry.timestamp.toLocaleTimeString('id-ID')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Uptime: {HealthCheckService.formatUptime(entry.uptime)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No history available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {healthStatus.error && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <strong>Health Check Error:</strong> {healthStatus.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Last Checked Info */}
      {lastChecked && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Last health check: {lastChecked.toLocaleString('id-ID')}</span>
              </div>
              <Badge variant="outline">
                Auto-refresh every 30s
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HealthDashboard;
