import { useState } from "react";
import { MapPin, Wheat, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegionData {
  name: string;
  production: number;
  status: "surplus" | "normal" | "deficit";
  mainCommodity: string;
}

const InteractiveMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  const regions: Record<string, RegionData> = {
    sumatra: {
      name: "Sumatra",
      production: 8500000,
      status: "surplus",
      mainCommodity: "Kelapa Sawit, Karet"
    },
    java: {
      name: "Jawa",
      production: 15000000,
      status: "normal",
      mainCommodity: "Padi, Jagung"
    },
    kalimantan: {
      name: "Kalimantan",
      production: 4200000,
      status: "normal",
      mainCommodity: "Kelapa Sawit, Karet"
    },
    sulawesi: {
      name: "Sulawesi",
      production: 3800000,
      status: "deficit",
      mainCommodity: "Kakao, Kopra"
    },
    papua: {
      name: "Papua",
      production: 1200000,
      status: "deficit",
      mainCommodity: "Sagu, Ubi"
    }
  };

  const getStatusColor = (status: RegionData["status"]) => {
    switch (status) {
      case "surplus":
        return "text-success bg-success/10 border-success/30";
      case "normal":
        return "text-warning bg-warning/10 border-warning/30";
      case "deficit":
        return "text-danger bg-danger/10 border-danger/30";
    }
  };

  const getStatusIcon = (status: RegionData["status"]) => {
    switch (status) {
      case "surplus":
        return <TrendingUp size={16} />;
      case "normal":
        return <Wheat size={16} />;
      case "deficit":
        return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Peta Produksi Pangan Indonesia</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Surplus</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">Normal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span className="text-muted-foreground">Defisit</span>
          </div>
        </div>
      </div>

      <div className="relative bg-muted/30 rounded-lg p-8 mb-6">
        {/* Simplified Indonesia Map Representation */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {Object.entries(regions).map(([key, region]) => (
            <button
              key={key}
              onClick={() => setSelectedRegion(key)}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all duration-300",
                "hover:scale-105 hover:shadow-lg",
                selectedRegion === key ? "ring-2 ring-primary" : "",
                getStatusColor(region.status)
              )}
            >
              <div className="flex items-center justify-center mb-2">
                <MapPin size={20} />
              </div>
              <div className="text-sm font-semibold">{region.name}</div>
              <div className="flex items-center justify-center mt-1">
                {getStatusIcon(region.status)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedRegion && (
        <div className="bg-muted/20 rounded-lg p-4 animate-in slide-in-from-bottom duration-300">
          <h4 className="font-semibold text-foreground mb-3">
            Detail Wilayah: {regions[selectedRegion].name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Produksi Total</span>
              <p className="text-lg font-bold text-foreground">
                {(regions[selectedRegion].production / 1000000).toFixed(1)}M Ton
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Status</span>
              <p className={cn(
                "text-lg font-bold capitalize",
                regions[selectedRegion].status === "surplus" ? "text-success" :
                regions[selectedRegion].status === "normal" ? "text-warning" :
                "text-danger"
              )}>
                {regions[selectedRegion].status}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Komoditas Utama</span>
              <p className="text-lg font-bold text-foreground">
                {regions[selectedRegion].mainCommodity}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;