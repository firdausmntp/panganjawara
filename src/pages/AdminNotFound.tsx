import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Home, ArrowLeft, Lock } from "lucide-react";

const AdminNotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // console.error(
    //   "Admin 404 Error: User attempted to access non-existent admin route:",
    //   location.pathname
    // );
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoAdmin = () => {
    navigate('/admin/dashboard');
  };

  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-red-100 p-6 rounded-full">
              <AlertTriangle className="h-16 w-16 text-red-600" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Halaman Admin Tidak Ditemukan</h2>
          <p className="text-gray-600">
            Halaman admin yang Anda cari tidak dapat ditemukan atau Anda tidak memiliki akses.
          </p>
        </div>

        {/* Error Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Detail Error Admin
            </CardTitle>
            <CardDescription>
              Informasi tentang halaman admin yang diminta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-600">URL yang diminta:</span>
                <code className="text-sm bg-gray-200 px-2 py-1 rounded text-gray-800">
                  {location.pathname}
                </code>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                  404 Admin Not Found
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-600">Akses:</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  isAuthenticated 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isAuthenticated ? 'Terautentikasi' : 'Tidak Terautentikasi'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isAuthenticated ? (
            <Button 
              onClick={handleGoAdmin} 
              className="w-full bg-green-600 hover:bg-green-700" 
              size="lg"
            >
              <Shield className="h-4 w-4 mr-2" />
              Kembali ke Dashboard Admin
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/admon')} 
              className="w-full bg-orange-600 hover:bg-orange-700" 
              size="lg"
            >
              <Lock className="h-4 w-4 mr-2" />
              Login sebagai Admin
            </Button>
          )}
          
          <Button 
            onClick={handleGoHome} 
            variant="outline" 
            className="w-full" 
            size="lg"
          >
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
          
          <Button 
            onClick={handleGoBack} 
            variant="outline" 
            className="w-full" 
            size="lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Halaman Sebelumnya
          </Button>
        </div>

        {/* Admin Suggestions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Kemungkinan Penyebab</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">• Halaman admin tidak tersedia atau telah dipindahkan</p>
              <p className="text-gray-600">• Anda tidak memiliki akses ke halaman tersebut</p>
              <p className="text-gray-600">• Sesi login admin telah berakhir</p>
              <p className="text-gray-600">• URL admin yang dimasukkan salah</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Admin Links */}
        {isAuthenticated && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">Halaman admin yang tersedia:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => navigate('/admin/dashboard')}
                className="text-green-600"
              >
                Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Pangan Jawara - Admin © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminNotFound;
