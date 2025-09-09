import { CloudRain, MapPin, Loader2 } from "lucide-react";
import LoadingDots from "@/components/ui/loading-dots";

interface WeatherLoadingProps {
  variant?: "default" | "onDark";
}

const WeatherLoading = ({ variant = "default" }: WeatherLoadingProps) => {
  const isDark = variant === "onDark";
  
  return (
    <div className={`space-y-4 ${isDark ? 'text-white' : 'text-slate-600'}`}>
      {/* Header loading */}
      <div className="flex items-center gap-2 mb-3">
        <CloudRain className="w-4 h-4" />
        <span className="text-sm font-semibold flex items-center gap-2">
          Menentukan lokasi cuaca
          <LoadingDots />
        </span>
      </div>
      
      {/* Location loading */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-3 h-3" />
        <span className="text-xs flex items-center gap-2">
          Mencari kelurahan/desa terdekat
          <div className={`h-2 w-16 rounded animate-pulse ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
        </span>
      </div>
      
      {/* Weather cards loading */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`rounded-lg p-3 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className={`h-3 rounded animate-pulse ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} style={{ width: `${70 + i * 10}px` }} />
                <div className={`h-2 rounded animate-pulse ${isDark ? 'bg-white/15' : 'bg-slate-200'}`} style={{ width: `${50 + i * 15}px` }} />
              </div>
              <div className="text-right space-y-2">
                <div className={`h-4 w-8 rounded animate-pulse ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
                <div className={`h-2 w-12 rounded animate-pulse ${isDark ? 'bg-white/15' : 'bg-slate-200'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer loading */}
      <div className="mt-4 flex items-center gap-2">
        <div className={`h-2 rounded animate-pulse ${isDark ? 'bg-white/15' : 'bg-slate-200'}`} style={{ width: '100px' }} />
        <span className={`text-xs ${isDark ? 'text-emerald-200' : 'text-slate-500'}`}>•</span>
        <div className={`h-2 rounded animate-pulse ${isDark ? 'bg-white/15' : 'bg-slate-200'}`} style={{ width: '80px' }} />
      </div>
    </div>
  );
};

export default WeatherLoading;
