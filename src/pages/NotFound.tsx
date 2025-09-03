import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, ArrowLeft, Search } from "lucide-react";
import { SecurityLogger, useSuspiciousActivityDetector } from "@/lib/security";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkSuspiciousActivity } = useSuspiciousActivityDetector();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Log 404 error
    
    // Check for suspicious activity and log
    const isSuspicious = checkSuspiciousActivity(currentPath);
    
    SecurityLogger.log({
      path: currentPath,
      userAgent: navigator.userAgent,
      authenticated: false,
      action: 'denied',
      reason: isSuspicious ? 'Suspicious 404 access attempt' : 'Normal 404 error'
    });
  }, [location.pathname, checkSuspiciousActivity]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-orange-100 p-6 rounded-full">
              <AlertTriangle className="h-16 w-16 text-orange-600" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Halaman Tidak Ditemukan</h2>
          <p className="text-gray-600">
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau mungkin telah dipindahkan.
          </p>
        </div>

        {/* Error Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Detail Error
            </CardTitle>
            <CardDescription>
              Informasi tentang halaman yang diminta
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
                  404 Not Found
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleGoHome} 
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

        {/* Suggestions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Saran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">• Periksa kembali URL yang Anda masukkan</p>
              <p className="text-gray-600">• Gunakan menu navigasi untuk menemukan halaman yang dicari</p>
              <p className="text-gray-600">• Hubungi admin jika Anda yakin halaman ini seharusnya ada</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">Atau kunjungi halaman populer:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-green-600"
            >
              Dashboard
            </Button>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => navigate('/data')}
              className="text-green-600"
            >
              Data
            </Button>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => navigate('/edukasi')}
              className="text-green-600"
            >
              Edukasi
            </Button>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => navigate('/komunitas')}
              className="text-green-600"
            >
              Komunitas
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
           Pangan Jawara © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
