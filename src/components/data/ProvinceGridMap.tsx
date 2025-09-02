import React from 'react';
import { Province } from './useProvinces';

interface Props {
  provinces: Province[];
  selected?: string | null;
  onSelect?: (provCode: string) => void;
}

// Simple cartogram-style grid grouped by wilayah to replace missing topojson map.
const ProvinceGridMap: React.FC<Props> = ({ provinces, selected, onSelect }) => {
  const groups = ['Barat','Tengah','Timur'];
  return (
    <div className="flex flex-col gap-4" aria-label="Grid Provinsi Indonesia">
      {groups.map(g => {
        const items = provinces.filter(p=>p.wilayah===g);
        if (!items.length) return null;
        return (
          <div key={g}>
            <h4 className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-2">Wilayah {g}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
              {items.map(p => {
                const active = selected === p.kode_provinsi;
                return (
                  <button
                    key={p.kode_provinsi}
                    onClick={()=> onSelect?.(p.kode_provinsi)}
                    className={`relative group rounded-lg border px-2 py-2 text-[11px] sm:text-xs font-medium transition shadow-sm hover:shadow ${active? 'bg-green-600 text-white border-green-600 ring-2 ring-green-400':'bg-white/70 backdrop-blur border-slate-200 hover:border-green-400'}`}
                    title={p.nama_provinsi}
                  >
                    <span className="block truncate">{p.nama_singkat_provinsi}</span>
                    {active && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 ring-2 ring-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {!provinces.length && <p className="text-xs text-slate-500">Memuat provinsi...</p>}
    </div>
  );
};

export default ProvinceGridMap;
