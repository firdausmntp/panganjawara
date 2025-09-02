import { ReactNode } from 'react';
import AuthService from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'super_admin' | 'superadmin';
  feature?: 'articles' | 'users' | 'security' | 'settings' | 'overview';
  fallback?: ReactNode;
}

const RoleGuard = ({ children, requiredRole, feature, fallback }: RoleGuardProps) => {
  const currentUser = AuthService.getCurrentUser();

  // Check authentication first
  if (!AuthService.isAuthenticated() || !currentUser) {
    return fallback || <div>Access Denied: Not authenticated</div>;
  }

  // Check role-based access
  let hasAccess = false;

  if (requiredRole) {
    hasAccess = AuthService.hasRole(requiredRole);
  } else if (feature) {
    hasAccess = AuthService.canAccess(feature);
  } else {
    // No specific requirements, just need to be authenticated admin
    hasAccess = ['admin', 'super_admin', 'superadmin'].includes(currentUser.role);
  }

  if (!hasAccess) {
    return fallback || (
      <Card className="border-orange-200">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-4 rounded-full">
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Akses Terbatas
          </h3>
          
          <p className="text-gray-600 mb-4">
            Anda tidak memiliki izin untuk mengakses fitur ini.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-500">Role Anda:</span>
              <Badge className={AuthService.getRoleBadgeColor(currentUser.role)}>
                <Shield className="h-3 w-3 mr-1" />
                {AuthService.getRoleDisplayName(currentUser.role)}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-500">
              {requiredRole && (
                <p>Diperlukan: <strong>{AuthService.getRoleDisplayName(requiredRole)}</strong></p>
              )}
              {feature && (
                <p>Fitur: <strong>{feature}</strong> tidak tersedia untuk role Anda</p>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-amber-900">Informasi Akses</p>
                  <div className="text-xs text-amber-700 mt-1 space-y-1">
                    <p><strong>Admin:</strong> Dapat mengakses Artikel, Security, Overview</p>
                    <p><strong>Super Admin:</strong> Dapat mengakses semua fitur termasuk Users & Settings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
