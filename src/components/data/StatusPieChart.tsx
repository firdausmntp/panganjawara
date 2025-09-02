import React, { useMemo } from 'react';
import { CommodityPrice } from './useCommodityPrices';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props { data: CommodityPrice[]; }

const COLORS = { Naik: '#dc2626', Turun: '#059669', 'Tidak Berubah': '#64748b' } as const;

const StatusPieChart: React.FC<Props> = ({ data }) => {
  const counts = useMemo(() => {
    const c: Record<string, number> = { Naik:0, Turun:0, 'Tidak Berubah':0 };
    data.forEach(d => { 
      const status = d.gap_change === 'up' ? 'Naik' : d.gap_change === 'down' ? 'Turun' : 'Tidak Berubah';
      c[status] = (c[status]||0)+1; 
    });
    return Object.entries(c).map(([name,value])=>({ name, value }));
  }, [data]);

  return (
    <div className="bg-card rounded-xl p-4 shadow-soft flex flex-col">
      <h3 className="text-lg font-semibold mb-2">Distribusi Status Perubahan</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={counts} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
              {counts.map((entry, idx) => <Cell key={idx} fill={COLORS[entry.name as keyof typeof COLORS]} />)}
            </Pie>
            <Tooltip formatter={(v:any,n:any)=>[v, n]} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {data.length===0 && <p className="text-xs text-muted-foreground mt-2">Tidak ada data.</p>}
    </div>
  );
};

export default StatusPieChart;
