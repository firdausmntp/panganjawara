import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '@/lib/auth';

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Use AuthService to check authentication
    if (AuthService.isAuthenticated()) {
      // Jika sudah login, redirect ke dashboard admin
      navigate('/admin/dashboard', { replace: true });
    } else {
      // Jika belum login, redirect ke halaman login admin
      navigate('/admon', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
};

export default AuthRedirect;
