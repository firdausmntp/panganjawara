import { Map as MapIcon } from 'lucide-react';
import IndonesiaMap from '@/components/data/IndonesiaMap';
import { useProvinces } from '@/components/data/useProvinces';
import { useNavigate } from 'react-router-dom';

const InteractiveMap = () => {
  const { provinces } = useProvinces();
  const navigate = useNavigate();
  return (
  <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2"><MapIcon className="w-5 h-5 text-emerald-600"/> Peta Harga Komoditas</h3>
        <button onClick={()=>navigate('/data')} className="text-xs px-2 py-1 rounded-md border bg-slate-50 hover:bg-slate-100">Detail</button>
      </div>
      <div className="rounded-lg border bg-white overflow-hidden">
        <IndonesiaMap
          className="!min-h-[280px] sm:!min-h-[320px] lg:!min-h-[380px] w-full"
          onSelect={(code)=> {
            // Map national_id to province id then navigate to data page (selection applied there manually by user)
            const prov = provinces.find(p => p.national_id?.trim() === code);
            navigate('/data' + (prov ? `?province_id=${prov.id}` : ''));
          }}
        />
      </div>
      <p className="mt-2 text-[10px] text-slate-500">Sumber peta: Data provinsi Badan Pangan • Klik provinsi untuk membuka halaman data.</p>
    </div>
  );
};

export default InteractiveMap;