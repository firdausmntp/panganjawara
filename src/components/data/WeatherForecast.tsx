import React, { useEffect, useState } from 'react';
import { useWeatherForecast } from './useWeatherForecast';
import { useWilayahSearch } from './useWilayahSearch';
import { useProvinsi, useKabKota, useKecamatan, useKelurahan } from './useWilayah';
import { RefreshCw, MapPin, ChevronsDownUp } from 'lucide-react';

interface WeatherForecastProps {
  defaultAdm4?: string; // e.g. 36.03.12.2001
  /** Visual variant when placed on dark / colored gradient backgrounds */
  variant?: 'default' | 'onDark';
  /** Additional className for outer container */
  className?: string;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ defaultAdm4 = '36.03.12.2001', variant='default', className='' }) => {
  // Parse default codes
  const parts = defaultAdm4.split('.');
  const defaultProv = parts[0];
  const defaultKab = parts.slice(0,2).join('.');
  const defaultKec = parts.slice(0,3).join('.');

  const [prov, setProv] = useState<string>(defaultProv);
  const [kab, setKab] = useState<string>(defaultKab);
  const [kec, setKec] = useState<string>(defaultKec);
  const [kel, setKel] = useState<string>(defaultAdm4);

  const adm4 = kel; // final code for forecast

  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { data, isLoading, error, refetch, isFetching } = useWeatherForecast(adm4);
  const { data: searchData, isLoading: searching } = useWilayahSearch(query);
  const provQuery = useProvinsi();
  const kabQuery = useKabKota(prov);
  const kecQuery = useKecamatan(prov, kab);
  const kelQuery = useKelurahan(prov, kab, kec);

  // Close search results when clicking outside (basic)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.('#weather-search-box')) setShowResults(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const lokasi = data?.raw?.lokasi;

  const handleProvChange = (code: string) => {
    setProv(code || '');
    setKab(''); setKec(''); setKel('');
  };
  const handleKabChange = (code: string) => {
    setKab(code || '');
    setKec(''); setKel('');
  };
  const handleKecChange = (code: string) => {
    setKec(code || '');
    setKel('');
  };
  const handleKelChange = (code: string) => {
    setKel(code || '');
  };

  const onDark = variant === 'onDark';
  return (
    <div className={`rounded-xl p-4 shadow-sm flex flex-col gap-4 w-full border ${onDark ? 'bg-white/90 backdrop-blur text-slate-700 border-white/40' : 'bg-white text-slate-700'} ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold text-sm"><MapPin className="w-4 h-4 text-green-600"/> Prakiraan Cuaca (3 Hari)</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching || !adm4}
            className={`text-[11px] px-2 py-1 rounded-md border flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${onDark ? 'bg-emerald-50/90 hover:bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'} disabled:opacity-50`}
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`text-[11px] px-2 py-1 rounded-md border flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${onDark ? 'bg-emerald-50/90 hover:bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}`}
          >
            <ChevronsDownUp className="w-3 h-3" /> {collapsed ? 'Tampilkan' : 'Sembunyikan'} Pilihan
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select
              value={prov}
              onChange={e => handleProvChange(e.target.value)}
              className="text-[11px] md:text-sm border rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Provinsi</option>
              {(provQuery.data?.items || []).map(p => <option key={p.kode} value={p.kode}>{p.nama}</option>)}
            </select>
            <select
              value={kab}
              onChange={e => handleKabChange(e.target.value)}
              disabled={!prov}
              className="text-[11px] md:text-sm border rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 bg-white"
            >
              <option value="">Kab/Kota</option>
              {(kabQuery.data?.items || []).map(k => <option key={k.kode} value={k.kode}>{k.nama.replace('Kab. ','').replace('Kota ','')}</option>)}
            </select>
            <select
              value={kec}
              onChange={e => handleKecChange(e.target.value)}
              disabled={!kab}
              className="text-[11px] md:text-sm border rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 bg-white"
            >
              <option value="">Kecamatan</option>
              {(kecQuery.data?.items || []).map(k => <option key={k.kode} value={k.kode}>{k.nama}</option>)}
            </select>
            <select
              value={kel}
              onChange={e => handleKelChange(e.target.value)}
              disabled={!kec}
              className="text-[11px] md:text-sm border rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 bg-white"
            >
              <option value="">Desa/Kel.</option>
              {(kelQuery.data?.items || []).map(k => <option key={k.kode} value={k.kode}>{k.nama}</option>)}
            </select>
          </div>
          <div id="weather-search-box" className="relative">
            <input
              value={query}
              placeholder={lokasi ? `${lokasi.kecamatan}, ${lokasi.kotkab}` : 'Cari kecamatan / desa'}
              onChange={e=>{ setQuery(e.target.value); setShowResults(true); }}
              onFocus={()=> setShowResults(true)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
            {showResults && query.trim().length >= 3 && (
              <div className="absolute z-30 mt-1 w-full max-h-56 overflow-auto bg-white border rounded-md shadow-lg text-sm">
                {searching && <div className="p-2 text-slate-500">Mencari...</div>}
                {!searching && (searchData?.items ?? []).filter(i => i.kode.split('.').length === 4).slice(0,20).map(item => (
                  <button
                    key={item.kode}
                    onClick={() => { 
                      // Derive hierarchy from code
                      const parts = item.kode.split('.');
                      handleProvChange(parts[0]);
                      handleKabChange(parts.slice(0,2).join('.'));
                      handleKecChange(parts.slice(0,3).join('.'));
                      handleKelChange(item.kode);
                      setQuery(''); setShowResults(false); 
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-green-50 flex flex-col"
                  >
                    <span className="font-medium text-slate-700 text-[13px]">{item.nama}</span>
                    <span className="text-[11px] text-slate-500">{item.kode}</span>
                  </button>
                ))}
                {!searching && !(searchData?.items ?? []).filter(i => i.kode.split('.').length === 4).length && (
                  <div className="p-2 text-slate-500">Tidak ada hasil</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
  <div className="text-[12px] text-slate-600 -mt-2">Lokasi: {lokasi ? `${lokasi.desa}, ${lokasi.kecamatan}, ${lokasi.kotkab}, ${lokasi.provinsi}` : (kel ? 'Memuat lokasi...' : 'Pilih wilayah sampai desa/kelurahan')}</div>
  {!kel && <div className="text-[12px] text-slate-500">Silakan pilih hingga Desa/Kelurahan untuk melihat prakiraan.</div>}
  {kel && isLoading && <div className="text-[12px] text-slate-500">Memuat prakiraan...</div>}
  {kel && error && <div className="text-[12px] text-red-600">{error.message}</div>}
  {kel && !isLoading && !error && (
        <div className="space-y-4">
          {data?.days.map(day => (
            <div key={day.date} className="border rounded-lg p-2 bg-slate-50/60">
              <div className="text-[13px] font-semibold text-slate-700 mb-2">
                {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {day.items.slice(0,6).map(item => (
                  <div key={item.datetime} className="bg-white rounded-md p-2 shadow-sm border flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-500">{item.local_datetime.slice(11,16)}</span>
                      {item.image && <img src={item.image} alt={item.weather_desc} className="w-6 h-6" />}
                    </div>
                    <div className="text-[15px] font-semibold text-slate-800">{item.t}°C</div>
                    <div className="text-[11px] text-slate-600 leading-snug line-clamp-2">{item.weather_desc}</div>
                    <div className="flex gap-3 text-[10px] text-slate-500 mt-auto">
                      <span>RH {item.hu}%</span>
                      <span>WS {item.ws}m/s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!data?.days.length && <div className="text-xs text-slate-500">Tidak ada data.</div>}
        </div>
      )}
  <div className="text-[11px] text-slate-400 pt-1">Sumber: BMKG • Pembaruan ~10m • Kode: {adm4 || '—'}</div>
    </div>
  );
};

export default WeatherForecast;
