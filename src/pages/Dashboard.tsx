import { 
  Wheat, 
  TrendingUp, 
  CloudRain, 
  Users, 
  Package, 
  AlertCircle,
  Sprout,
  Factory
} from "lucide-react";
import HeroSection from "@/components/dashboard/HeroSection";
import LiveDataWidget from "@/components/dashboard/LiveDataWidget";
import QuickAccessCard from "@/components/dashboard/QuickAccessCard";
import AlertBanner from "@/components/dashboard/AlertBanner";
import InteractiveMap from "@/components/dashboard/InteractiveMap";
import ChatAssistant from "@/components/dashboard/ChatAssistant";

const Dashboard = () => {
  // Sample data - in production, this would come from API
  const commodityPrices = [
    { label: "Beras Premium", value: 12500, change: 2.3, unit: "/kg" },
    { label: "Gula Pasir", value: 14000, change: -1.5, unit: "/kg" },
    { label: "Minyak Goreng", value: 17000, change: 0, unit: "/L" },
    { label: "Daging Ayam", value: 35000, change: 3.2, unit: "/kg" },
  ];

  const productionData = [
    { label: "Padi", value: "5.2M", change: 4.5, unit: "ton" },
    { label: "Jagung", value: "2.8M", change: 2.1, unit: "ton" },
    { label: "Kedelai", value: "650K", change: -3.2, unit: "ton" },
    { label: "Cabai", value: "180K", change: 5.8, unit: "ton" },
  ];

  const weatherData = [
    { label: "Suhu Rata-rata", value: 28.5, unit: "°C" },
    { label: "Curah Hujan", value: 85, unit: "mm" },
    { label: "Kelembaban", value: 78, unit: "%" },
    { label: "Kecepatan Angin", value: 12, unit: "km/h" },
  ];

  const alerts = [
    {
      id: "1",
      type: "warning" as const,
      title: "Peringatan Cuaca Ekstrem",
      message: "Potensi hujan lebat di wilayah Jawa Barat dalam 48 jam ke depan",
      timestamp: new Date()
    },
    {
      id: "2", 
      type: "info" as const,
      title: "Update Harga Komoditas",
      message: "Harga beras mengalami kenaikan 2.3% di pasar induk Jakarta",
      timestamp: new Date()
    }
  ];

  const quickAccessItems = [
    {
      title: "Portal Petani",
      description: "Akses informasi pertanian, harga, dan panduan budidaya",
      icon: Sprout,
      color: "primary" as const,
      features: [
        "Kalender Tanam Digital",
        "Prediksi Cuaca 7 Hari",
        "Harga Pasar Real-time",
        "Konsultasi Online"
      ]
    },
    {
      title: "Pusat Penelitian",
      description: "Database riset, publikasi, dan inovasi pertanian",
      icon: TrendingUp,
      color: "secondary" as const,
      features: [
        "Jurnal Ilmiah",
        "Data Eksperimen",
        "Kolaborasi Riset",
        "Patent Database"
      ]
    },
    {
      title: "Dashboard Kebijakan",
      description: "Monitoring implementasi dan evaluasi kebijakan pangan",
      icon: Package,
      color: "accent" as const,
      features: [
        "Policy Tracker",
        "Impact Analysis",
        "Public Feedback",
        "Regulatory Updates"
      ]
    },
    {
      title: "Industri & UMKM",
      description: "Koneksi B2B, peluang investasi, dan market intelligence",
      icon: Factory,
      color: "info" as const,
      features: [
        "Business Matching",
        "Investment Opportunities",
        "Market Analysis",
        "Export Guidelines"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Alert Banner */}
      <div className="container mx-auto px-4 mt-6">
        <AlertBanner alerts={alerts} />
      </div>

      {/* Live Data Widgets */}
      <div className="container mx-auto px-4 mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Live Data Monitoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LiveDataWidget
            title="Harga Komoditas"
            icon={<Package size={20} />}
            data={commodityPrices}
          />
          <LiveDataWidget
            title="Produksi Nasional"
            icon={<Wheat size={20} />}
            data={productionData}
          />
          <LiveDataWidget
            title="Kondisi Cuaca"
            icon={<CloudRain size={20} />}
            data={weatherData}
          />
        </div>
      </div>

      {/* Interactive Map */}
      <div className="container mx-auto px-4 mt-12">
        <InteractiveMap />
      </div>

      {/* Quick Access Cards */}
      <div className="container mx-auto px-4 mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Akses Cepat Berdasarkan Peran</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessItems.map((item, index) => (
            <QuickAccessCard key={index} {...item} />
          ))}
        </div>
      </div>

      {/* News Section */}
      <div className="container mx-auto px-4 mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Berita & Update Terkini</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-card rounded-xl p-6 shadow-soft hover:shadow-elegant transition-all duration-300">
              <div className="w-full h-40 bg-gradient-primary rounded-lg mb-4" />
              <span className="text-xs text-muted-foreground">2 jam yang lalu</span>
              <h3 className="text-lg font-semibold text-foreground mt-2 mb-2">
                Inovasi Teknologi Pertanian Tingkatkan Produktivitas 30%
              </h3>
              <p className="text-sm text-muted-foreground">
                Penerapan IoT dan AI dalam sistem irigasi pintar berhasil meningkatkan produktivitas padi...
              </p>
              <a href="#" className="text-primary font-semibold text-sm mt-4 inline-block hover:underline">
                Baca Selengkapnya →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Assistant */}
      <ChatAssistant />
    </div>
  );
};

export default Dashboard;