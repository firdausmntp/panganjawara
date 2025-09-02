import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Eye, EyeOff, User, Home, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHealthCheckContext } from '@/components/providers/HealthCheckProvider';
import AuthService from '@/lib/auth';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { healthStatus, checkHealth } = useHealthCheckContext();

  // Check if already logged in
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      // Already logged in, redirect to admin dashboard
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check system health first
      await checkHealth();
      
      if (!healthStatus.isHealthy || healthStatus.isMaintenance) {
        setError('Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti.');
        setIsLoading(false);
        return;
      }

      // Use real API login
      const result = await AuthService.login({
        username: credentials.username,
        password: credentials.password
      });

      if (result.success && result.data) {
        toast({
          title: "Login berhasil",
          description: `Selamat datang, ${result.data.user.username}!`,
        });
        
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Login gagal');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: 'username' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-white/80 backdrop-blur hover:bg-white/90 border-green-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Kembali ke Beranda</span>
          <span className="sm:hidden">Beranda</span>
        </Button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">
            Masuk ke panel administrasi Pangan Jawara
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Masuk sebagai Admin</CardTitle>
            <CardDescription className="text-center">
              Masukkan kredensial admin Anda untuk mengakses panel kontrol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username admin"
                  value={credentials.username}
                  onChange={handleInputChange('username')}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={credentials.password}
                    onChange={handleInputChange('password')}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Masuk...' : 'Masuk'}
              </Button>
            </form>
            
            {/* Additional navigation */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                Bukan admin?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-green-600 hover:text-green-700 font-medium hover:underline"
                >
                  Kembali ke halaman utama
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        

      </div>
    </div>
  );
};

export default AdminLogin;
