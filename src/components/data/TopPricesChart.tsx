import React, { useMemo } from 'react';
import { CommodityPrice } from './useCommodityPrices';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props { data: CommodityPrice[]; }

const TopPricesChart: React.FC<Props> = ({ data }) => {
  const top = useMemo(()=> [...data].sort((a,b)=> b.today - a.today).slice(0,8), [data]);
  return (
    <div className="bg-card rounded-xl p-4 shadow-soft flex flex-col">
      <h3 className="text-lg font-semibold mb-2">Top 8 Harga Tertinggi</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top} margin={{ top: 10, left: 0, right: 10, bottom: 10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v)=> v.toLocaleString('id-ID')} width={70} />
            <Tooltip formatter={(v:any)=> v.toLocaleString('id-ID')} />
            <Bar dataKey="today" radius={[4,4,0,0]}>
              {top.map((t,i)=><Cell key={i} fill={t.gap>0? '#dc2626': t.gap<0? '#059669':'#0ea5e9'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {top.length===0 && <p className="text-xs text-muted-foreground mt-2">Tidak ada data.</p>}
    </div>
  );
};

export default TopPricesChart;
