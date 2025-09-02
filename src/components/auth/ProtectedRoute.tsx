import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { SecurityLogger, useSuspiciousActivityDetector } from '@/lib/security';
import AuthService from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkSuspiciousActivity } = useSuspiciousActivityDetector();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check for suspicious activity
    checkSuspiciousActivity(currentPath);
    
    // Check authentication
    const isAuthenticated = AuthService.isAuthenticated();
    
    // Log admin access attempt
    SecurityLogger.logAdminAccess(currentPath, isAuthenticated);
    
    if (!isAuthenticated) {
      // Jika tidak terautentikasi, redirect ke halaman login admin
      navigate('/admon', { replace: true });
    }
  }, [navigate, location.pathname, checkSuspiciousActivity]);

  // Check authentication status
  const isAuthenticated = AuthService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Mengalihkan ke halaman login...</p>
          <p className="text-sm text-gray-500 mt-2">Akses tidak terotorisasi terdeteksi</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
