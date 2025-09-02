import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Trash2, 
  Download,
  RefreshCw,
  Clock,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import { SecurityLogger, AccessLog } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

const SecurityLogs = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AccessLog[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'denied' | 'suspicious'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, activeFilter]);

  const loadLogs = () => {
    const securityLogs = SecurityLogger.getLogs();
    setLogs(securityLogs.reverse()); // Show newest first
  };

  const filterLogs = () => {
    switch (activeFilter) {
      case 'denied':
        setFilteredLogs(logs.filter(log => log.action === 'denied'));
        break;
      case 'suspicious':
        setFilteredLogs(logs.filter(log => 
          log.reason?.includes('suspicious') || 
          log.reason?.includes('Suspicious') ||
          log.path.includes('/admin') && !log.authenticated
        ));
        break;
      default:
        setFilteredLogs(logs);
    }
  };

  const clearLogs = () => {
    SecurityLogger.clearLogs();
    setLogs([]);
    toast({
      title: "Log dibersihkan",
      description: "Semua log keamanan telah dihapus.",
    });
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Log diekspor",
      description: "Log keamanan berhasil diekspor ke file JSON.",
    });
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'denied':
        return 'destructive';
      case 'redirect':
        return 'secondary';
      case 'access':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'denied':
        return <Lock className="h-3 w-3" />;
      case 'access':
        return <Unlock className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const suspiciousCount = logs.filter(log => 
    log.reason?.includes('suspicious') || 
    log.reason?.includes('Suspicious') ||
    (log.path.includes('/admin') && !log.authenticated)
  ).length;

  const deniedCount = logs.filter(log => log.action === 'denied').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Log Keamanan</h2>
          <p className="text-gray-600">Monitor aktivitas dan akses tidak sah</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="destructive" onClick={clearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">
              Semua aktivitas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akses Ditolak</CardTitle>
            <Lock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{deniedCount}</div>
            <p className="text-xs text-muted-foreground">
              Akses tidak sah
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktivitas Mencurigakan</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{suspiciousCount}</div>
            <p className="text-xs text-muted-foreground">
              Pola tidak normal
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akses Valid</CardTitle>
            <Unlock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {logs.filter(log => log.authenticated).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Login berhasil
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(value: any) => setActiveFilter(value)}>
        <TabsList>
          <TabsTrigger value="all">Semua ({logs.length})</TabsTrigger>
          <TabsTrigger value="denied">Ditolak ({deniedCount})</TabsTrigger>
          <TabsTrigger value="suspicious">Mencurigakan ({suspiciousCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="space-y-4">
          {filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Tidak ada log untuk kategori ini</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={getActionBadgeColor(log.action)} className="flex items-center gap-1">
                          {getActionIcon(log.action)}
                          {log.action.toUpperCase()}
                        </Badge>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {log.path}
                        </code>
                        {!log.authenticated && (
                          <Badge variant="outline" className="text-red-600">
                            Tidak Terautentikasi
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {log.userAgent.split(' ')[0]}...
                        </div>
                      </div>
                      
                      {log.reason && (
                        <p className="text-sm text-gray-700 mt-1">
                          <strong>Alasan:</strong> {log.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityLogs;
