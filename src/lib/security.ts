
export interface AccessLog {
  timestamp: string;
  path: string;
  userAgent: string;
  authenticated: boolean;
  action: 'access' | 'denied' | 'redirect';
  reason?: string;
}


export class SecurityLogger {
  private static logs: AccessLog[] = [];
  
  static log(entry: Omit<AccessLog, 'timestamp'>) {
    const logEntry: AccessLog = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(logEntry);
    
    
    
    
    
    
    
    
    
    this.persistLogs();
  }
  
  static logUnauthorizedAccess(path: string, reason: string) {
    this.log({
      path,
      userAgent: navigator.userAgent,
      authenticated: false,
      action: 'denied',
      reason
    });
  }
  
  static logAdminAccess(path: string, authenticated: boolean) {
    this.log({
      path,
      userAgent: navigator.userAgent,
      authenticated,
      action: authenticated ? 'access' : 'redirect',
      reason: authenticated ? 'Valid admin session' : 'No valid session'
    });
  }
  
  private static persistLogs() {
    try {
      
      const recentLogs = this.logs.slice(-100);
      localStorage.setItem('securityLogs', JSON.stringify(recentLogs));
    } catch (error) {
      
    }
  }
  
  static getLogs(): AccessLog[] {
    try {
      const stored = localStorage.getItem('securityLogs');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      
      return [];
    }
  }
  
  static clearLogs() {
    this.logs = [];
    localStorage.removeItem('securityLogs');
  }
}


export const useSuspiciousActivityDetector = () => {
  const checkSuspiciousActivity = (path: string) => {
    const suspiciousPatterns = [
      /\/admin(?!\/dashboard$)/i, 
      /\/api\//i,                 
      /\/config/i,                
      /\/system/i,                
      /\.\./,                     
      /\/\./,                     
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(path));
    
    if (isSuspicious) {
      SecurityLogger.logUnauthorizedAccess(path, 'Suspicious path pattern detected');
    }
    
    return isSuspicious;
  };
  
  return { checkSuspiciousActivity };
};
