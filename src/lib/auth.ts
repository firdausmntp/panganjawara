// Authentication Service
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'super_admin' | 'superadmin';
    last_login: string;
  };
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'super_admin' | 'superadmin';
  last_login: string;
}

class AuthService {
  private static readonly API_BASE = 'http://localhost:3000/pajar';
  private static readonly TOKEN_KEY = 'adminToken';
  private static readonly USER_KEY = 'adminUser';
  private static readonly EXPIRES_KEY = 'tokenExpires';

  // Login with real API
  static async login(credentials: LoginRequest): Promise<{
    success: boolean;
    data?: LoginResponse;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Login failed: ${response.status}`);
      }

      const data: LoginResponse = await response.json();

      // Validate role
      if (!['admin', 'super_admin', 'superadmin'].includes(data.user.role)) {
        throw new Error('User tidak memiliki akses admin');
      }

      // Store authentication data
      this.storeAuthData(data);

      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  // Store authentication data
  private static storeAuthData(loginData: LoginResponse): void {
    const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    localStorage.setItem(this.TOKEN_KEY, loginData.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(loginData.user));
    localStorage.setItem(this.EXPIRES_KEY, expirationTime.toString());
    localStorage.setItem('isAdminAuthenticated', 'true');

    // console.log('Auth data stored successfully');
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const expires = localStorage.getItem(this.EXPIRES_KEY);
    const isAuth = localStorage.getItem('isAdminAuthenticated');

    if (!token || !expires || isAuth !== 'true') {
      return false;
    }

    // Check if token is expired
    if (Date.now() > parseInt(expires)) {
      this.logout();
      return false;
    }

    return true;
  }

  // Get current user
  static getCurrentUser(): AuthUser | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Get auth token
  static getToken(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Check if user has specific role
  static hasRole(requiredRole: 'admin' | 'super_admin' | 'superadmin'): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    if (requiredRole === 'admin') {
      return ['admin', 'super_admin', 'superadmin'].includes(user.role);
    }
    
    if (requiredRole === 'super_admin' || requiredRole === 'superadmin') {
      return ['super_admin', 'superadmin'].includes(user.role);
    }

    return false;
  }

  // Check if user can access specific feature
  static canAccess(feature: 'articles' | 'users' | 'security' | 'settings' | 'overview'): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super admin can access everything
    if (['super_admin', 'superadmin'].includes(user.role)) {
      return true;
    }

    // Regular admin permissions
    if (user.role === 'admin') {
      const adminPermissions = ['articles', 'security', 'overview'];
      return adminPermissions.includes(feature);
    }

    return false;
  }

  // Logout
  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EXPIRES_KEY);
    localStorage.removeItem('isAdminAuthenticated');
    
    // console.log('User logged out successfully');
  }

  // Refresh token (if API supports it)
  static async refreshToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      // If you have refresh token endpoint
      // const response = await fetch(`${this.API_BASE}/auth/refresh`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      
      // For now, just validate current token
      return this.isAuthenticated();
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  // Get user role display name
  static getRoleDisplayName(role?: string): string {
    switch (role) {
      case 'super_admin':
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return 'Unknown';
    }
  }

  // Get role badge color
  static getRoleBadgeColor(role?: string): string {
    switch (role) {
      case 'super_admin':
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Validate token format (basic JWT validation)
  private static isValidJWT(token: string): boolean {
    try {
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  }

  // Get token expiry time
  static getTokenExpiry(): Date | null {
    const expires = localStorage.getItem(this.EXPIRES_KEY);
    return expires ? new Date(parseInt(expires)) : null;
  }

  // Check if token expires soon (within 1 hour)
  static isTokenExpiringSoon(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    
    const oneHour = 60 * 60 * 1000;
    return (expiry.getTime() - Date.now()) < oneHour;
  }
}

export default AuthService;
