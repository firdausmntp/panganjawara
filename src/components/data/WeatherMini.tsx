import { useWeatherForecast } from './useWeatherForecast';
import { CloudRain, Loader2 } from 'lucide-react';
import React from 'react';

interface WeatherMiniProps {
  adm4: string;
  cityLabel?: string;
  className?: string;
}

const WeatherMini: React.FC<WeatherMiniProps> = ({ adm4, cityLabel, className }) => {
  const { data, isLoading, error } = useWeatherForecast(adm4);
  const today = data?.days?.[0];
  const pickSlot = (hour: string) => today?.items.find(i => i.local_datetime.slice(11,13) === hour);
  const slots = [pickSlot('06'), pickSlot('12'), pickSlot('18'), today?.items?.[today.items.length-1]].filter(Boolean).slice(0,4) as any[];
  let minT: number | undefined, maxT: number | undefined;
  if (today) { const temps = today.items.map(i=>i.t); minT = Math.min(...temps); maxT = Math.max(...temps); }
  return (
    <div className={`rounded-xl border bg-white/70 backdrop-blur px-4 py-3 shadow-sm ${className||''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CloudRain className="w-4 h-4 text-emerald-600"/> Cuaca Hari Ini</div>
        <span className="text-[10px] text-slate-400">BMKG</span>
      </div>
      {isLoading && <div className="flex items-center gap-2 text-xs text-slate-500"><Loader2 className="w-3 h-3 animate-spin"/> Memuat...</div>}
      {error && <div className="text-xs text-red-600">Gagal memuat cuaca</div>}
      {!isLoading && !error && today && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span>{cityLabel||'Lokasi'}</span>
            {minT!=null && maxT!=null && <span>• {minT}–{maxT}°C</span>}
            <span className="hidden sm:inline">• {today.items.length} slot</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {slots.map(s => (
              <div key={s.datetime} className="bg-white/60 rounded-md p-2 flex flex-col items-center text-center border">
                <span className="text-[10px] text-slate-500 mb-1">{s.local_datetime.slice(11,16)}</span>
                {s.image && <img src={s.image} alt={s.weather_desc} className="w-7 h-7 mb-1" />}
                <span className="text-xs font-semibold text-slate-800">{s.t}°</span>
                <span className="text-[9px] text-slate-500 line-clamp-2 leading-tight">{s.weather_desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {!isLoading && !error && !today && <div className="text-xs text-slate-500">Tidak ada data.</div>}
    </div>
  );
};

export default WeatherMini;
