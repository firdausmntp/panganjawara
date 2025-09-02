import React, { useMemo } from 'react';
import { CommodityPrice } from './useCommodityPrices';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface Props {
  rows: CommodityPrice[];
}

const CommodityTable: React.FC<Props> = ({ rows }) => {
  const sorted = useMemo(() => {
    return [...rows].sort((a,b) => a.name.localeCompare(b.name));
  }, [rows]);

  const formatCurrency = (n: number) => n.toLocaleString('id-ID');

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead className="sticky top-0 z-10">
          <tr className="text-left bg-slate-100/90 backdrop-blur">
            <th className="px-3 py-2 font-semibold first:rounded-tl-lg">Komoditas</th>
            <th className="px-3 py-2 font-semibold">Harga Hari Ini</th>
            <th className="px-3 py-2 font-semibold">Harga Kemarin</th>
            <th className="px-3 py-2 font-semibold">Δ Harga</th>
            <th className="px-3 py-2 font-semibold">Perubahan</th>
            <th className="px-3 py-2 font-semibold first:rounded-tr-lg">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(row => {
            const TrendIcon = row.gap > 0 ? ArrowUp : row.gap < 0 ? ArrowDown : Minus;
            const isUp = row.gap > 0;
            const isDown = row.gap < 0;
            const trendColor = isUp ? 'text-red-600' : isDown ? 'text-emerald-600' : 'text-slate-400';
            const rowBg = isUp ? 'bg-red-50/40 hover:bg-red-50' : isDown ? 'bg-emerald-50/40 hover:bg-emerald-50' : 'hover:bg-slate-50';
            return (
              <tr key={row.id} className={`border-b last:border-none transition-colors ${rowBg}`}>
                <td className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{row.name}</td>
                <td className="px-3 py-2 tabular-nums">Rp {formatCurrency(row.today)}</td>
                <td className="px-3 py-2 tabular-nums">Rp {formatCurrency(row.yesterday)}</td>
                <td className={`px-3 py-2 tabular-nums`}>
                  <div className={`flex items-center gap-1 ${trendColor}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span>Rp {row.gap === 0 ? 0 : formatCurrency(Math.abs(row.gap))}</span>
                  </div>
                </td>
                <td className={`px-3 py-2 tabular-nums ${trendColor}`}>{row.gap_percentage.toFixed(2)}%</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                    row.gap_change === 'down' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : 
                    row.gap_change === 'up' ? 'bg-red-100 text-red-700 ring-1 ring-red-200' : 
                    'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                  }`}>
                    {row.gap_change === 'up' ? 'Naik' : row.gap_change === 'down' ? 'Turun' : 'Tetap'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CommodityTable;
