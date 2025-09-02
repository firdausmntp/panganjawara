import { FileSpreadsheet, FileText, RefreshCw, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
// Replaced topojson map (404) with grid map based on API provinces
import IndonesiaMap from "@/components/data/IndonesiaMap";
import CommodityTable from "@/components/data/CommodityTable";
import PriceChangeChart from "@/components/data/PriceChangeChart";
import StatusPieChart from "@/components/data/StatusPieChart";
import TopPricesChart from "@/components/data/TopPricesChart";
import { useState } from "react";
import { useCommodityPrices } from "@/components/data/useCommodityPrices";
import { useProvinces } from "@/components/data/useProvinces";
import { useDistricts } from "@/components/data/useDistricts";

const Data = () => {
  const [levelHarga, setLevelHarga] = useState(1); // 1 = produsen, 3 = konsumen
  const [province, setProvince] = useState<string | undefined>(undefined);
  const [district, setDistrict] = useState<string | undefined>(undefined);
  const { provinces, loading: loadingProv } = useProvinces();
  const { districts, loading: loadingDist } = useDistricts(province);
  const { data, loading, error } = useCommodityPrices(levelHarga, province, district);
  const [exporting, setExporting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const handleExportExcel = () => {
    setExporting(true);
    import('xlsx').then(xlsx => {
      const sheet = xlsx.utils.json_to_sheet(data.map(d => ({
        ID: d.id,
        Komoditas: d.name,
        Satuan: d.satuan,
        Harga_Hari_Ini: d.today,
        Harga_Kemarin: d.yesterday,
        Tanggal_Kemarin: d.yesterday_date,
        Selisih: d.gap,
        Persentase: d.gap_percentage,
        Perubahan: d.gap_change,
        Warna: d.gap_color
      })));
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, sheet, 'Harga');
      const today = new Date().toISOString().slice(0,10);
      xlsx.writeFile(wb, `harga_komoditas_${province||'all'}_${district||'all'}_${today}.xlsx`);
  }).finally(()=> setExporting(false));
  };

  const handleExportPDF = () => {
    setExporting(true);
    Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]).then(([jsPDF]) => {
      const doc = new jsPDF.jsPDF('l', 'pt');
      doc.text('Laporan Harga Komoditas', 40, 40);
      const rows = data.map(d => [d.id, d.name, d.satuan, d.today, d.yesterday, d.yesterday_date, d.gap, d.gap_percentage.toFixed(2), d.gap_change]);
      (doc as any).autoTable({
        head: [["ID","Komoditas","Satuan","Hari Ini","Kemarin","Tgl Kemarin","Selisih","%","Status"]],
        body: rows,
        startY: 60,
        styles: { fontSize: 8 }
      });
      const today = new Date().toISOString().slice(0,10);
      doc.save(`harga_komoditas_${province||'all'}_${district||'all'}_${today}.pdf`);
    }).finally(()=> setExporting(false));
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Data & Analytics Center</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pusat data ketahanan pangan dengan monitoring real-time, predictive analytics, dan visualization tools
          </p>
        </div>

        <div className="bg-card rounded-xl p-4 sm:p-6 lg:p-8 shadow-soft mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Dashboard Analytics</h2>
            <div className="flex flex-wrap gap-2">
              <select value={levelHarga} onChange={e=>setLevelHarga(Number(e.target.value))} className="text-xs sm:text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value={1}>Produsen</option>
                <option value={3}>Konsumen</option>
              </select>
              <select value={province||''} onChange={e=>{ setProvince(e.target.value||undefined); setDistrict(undefined); }} className="text-xs sm:text-sm border rounded-md px-2 py-1 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Provinsi</option>
                {provinces.map(p=> <option key={p.id} value={p.id.toString()}>{p.nama}</option>)}
              </select>
              <select value={district||''} onChange={e=> setDistrict(e.target.value||undefined)} disabled={!province || loadingDist} className="text-xs sm:text-sm border rounded-md px-2 py-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-40">
                <option value="">Kab/Kota</option>
                {districts.map(d=> <option key={d.id} value={d.id.toString()}>{d.nama.replace('Kab. ','').replace('Kota ','')}</option>)}
              </select>
              <Button variant="outline" size="sm" onClick={()=>window.location.reload()} disabled={loading} className="whitespace-nowrap">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={loading || !data.length || exporting} className="whitespace-nowrap relative" title="Export Excel">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                {exporting ? '...' : 'Excel'}
                {exporting && <span className="absolute inset-0 flex items-center justify-center"><RefreshCw className="w-3 h-3 animate-spin" /></span>}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={loading || !data.length || exporting} className="whitespace-nowrap relative" title="Export PDF">
                <FileText className="w-4 h-4 mr-2" />
                {exporting ? '...' : 'PDF'}
                {exporting && <span className="absolute inset-0 flex items-center justify-center"><RefreshCw className="w-3 h-3 animate-spin" /></span>}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 mb-10">
            <div className="xl:col-span-2 flex flex-col">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <MapIcon className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Peta Indonesia</h3>
                {selectedRegion && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{selectedRegion}</span>}
              </div>
              <div className="bg-muted/20 rounded-xl p-2 sm:p-4 h-full min-h-[260px] sm:min-h-[320px]">
                <IndonesiaMap
                  selected={province || selectedRegion}
                  onSelect={(code)=> { 
                    // Convert national_id from provinces to match the selection
                    const selectedProvince = provinces.find(p => p.national_id?.trim() === code);
                    if (selectedProvince) {
                      setProvince(selectedProvince.id.toString()); 
                      setDistrict(undefined); 
                      setSelectedRegion(selectedProvince.id.toString());
                    }
                  }}
                  className="border border-emerald-200 rounded-lg bg-white"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Ringkasan Harga</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                {data.slice(0,6).map(c => (
                  <div key={c.id} className="p-3 rounded-lg bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-medium text-slate-500 line-clamp-1">{c.name}</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">Rp {c.today.toLocaleString('id-ID')}</p>
                    <p className={`text-[10px] mt-0.5 ${c.gap>0?'text-red-600':c.gap<0?'text-emerald-600':'text-slate-400'}`}>
                      {c.gap>0?'+':''}{c.gap.toLocaleString('id-ID')} ({c.gap_percentage.toFixed(2)}%)
                    </p>
                  </div>
                ))}
                {loading && <div className="col-span-full text-center text-xs text-slate-400">Memuat...</div>}
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Tabel Harga Komoditas {levelHarga === 1 ? 'Produsen' : 'Konsumen'} 
              {province && provinces.find(p=>p.id.toString()===province)?.nama} 
              {district && ' - ' + districts.find(d=>d.id.toString()===district)?.nama}
            </h3>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
          <div className="bg-white rounded-lg border p-2 sm:p-4 overflow-hidden">
            {loading ? (
              <div className="py-10 text-center text-sm text-slate-500">Memuat data harga...</div>
            ) : (
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <CommodityTable rows={data} />
              </div>
            )}
          </div>
          
          {/* Removed static stats & placeholder chart per request */}
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <PriceChangeChart data={data} />
          <StatusPieChart data={data} />
            <TopPricesChart data={data} />
        </div>
      </div>
    </div>
  );
};

export default Data;