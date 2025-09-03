// Health Check Service
import { API_CONFIG, buildApiUrl } from './api';

export interface HealthStatus {
  status: 'ok' | 'maintenance' | 'error';
  uptime: number;
  timestamp: number;
  database: 'connected' | 'disconnected';
  environment: string;
  message?: string;
}

export interface HealthCheckResult {
  isHealthy: boolean;
  isMaintenance: boolean;
  data?: HealthStatus;
  error?: string;
}

class HealthCheckService {
  private static readonly API_URL = buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH);
  private static readonly CACHE_KEY = 'health_check_cache';
  private static readonly CACHE_DURATION = 30 * 1000; // 30 seconds
  private static cache: { data: HealthStatus; timestamp: number } | null = null;

  static async checkHealth(useCache: boolean = true): Promise<HealthCheckResult> {
    try {
      // Check cache first if enabled
      if (useCache && this.isCacheValid()) {
        const cachedData = this.getFromCache();
        if (cachedData) {
          return {
            isHealthy: cachedData.status === 'ok',
            isMaintenance: cachedData.status === 'maintenance',
            data: cachedData
          };
        }
      }

      // Make API call
      const response = await fetch(this.API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Set timeout
        signal: AbortSignal.timeout(10000) // 10 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      const data: HealthStatus = await response.json();
      
      // Cache the result
      this.saveToCache(data);

      const result: HealthCheckResult = {
        isHealthy: data.status === 'ok',
        isMaintenance: data.status === 'maintenance',
        data
      };

      // Log health status
    //   console.log('Health check result:', result);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown health check error';
      
      // console.error('Health check error:', errorMessage);

      // In case of network error, assume maintenance mode for safety
      return {
        isHealthy: false,
        isMaintenance: true,
        error: errorMessage
      };
    }
  }

  private static isCacheValid(): boolean {
    if (!this.cache) return false;
    const now = Date.now();
    return (now - this.cache.timestamp) < this.CACHE_DURATION;
  }

  private static getFromCache(): HealthStatus | null {
    if (this.isCacheValid()) {
      return this.cache?.data || null;
    }
    return null;
  }

  private static saveToCache(data: HealthStatus): void {
    this.cache = {
      data,
      timestamp: Date.now()
    };

    // Also save to localStorage for persistence
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      // console.warn('Failed to save health check to localStorage:', error);
    }
  }

  static loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if stored cache is still valid
        if (parsed.timestamp && (Date.now() - parsed.timestamp) < this.CACHE_DURATION) {
          this.cache = parsed;
        } else {
          // Remove expired cache
          localStorage.removeItem(this.CACHE_KEY);
        }
      }
    } catch (error) {
      // console.warn('Failed to load health check from localStorage:', error);
      localStorage.removeItem(this.CACHE_KEY);
    }
  }

  static clearCache(): void {
    this.cache = null;
    localStorage.removeItem(this.CACHE_KEY);
  }

  // Get formatted uptime
  static formatUptime(uptime: number): string {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Get environment badge color
  static getEnvironmentColor(env: string): string {
    switch (env.toLowerCase()) {
      case 'production':
        return 'bg-green-100 text-green-800';
      case 'development':
        return 'bg-blue-100 text-blue-800';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

// Initialize cache on module load
HealthCheckService.loadCacheFromStorage();

export default HealthCheckService;
