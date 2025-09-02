import { memo, useMemo } from 'react';
import { CommodityPrice } from './useCommodityPrices';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface Props { data: CommodityPrice[]; }

const PriceChangeChart = ({ data }: Props) => {
  const top = useMemo(() => {
    return [...data]
      .filter(d => d.gap !== 0)
      .sort((a,b) => Math.abs(b.gap_percentage) - Math.abs(a.gap_percentage))
      .slice(0, 10);
  }, [data]);

  return (
    <div className="bg-card rounded-xl p-4 shadow-soft">
      <h3 className="text-lg font-semibold mb-2">Perubahan Harga Tertinggi (%)</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top} layout="vertical" margin={{ left: 40, right: 10, top: 10, bottom: 10 }}>
            <XAxis type="number" tickFormatter={(v)=> v + '%'} />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(val:any, _name, p:any)=> [`${val.toFixed(2)}%`, p.payload.name]} />
            <Bar dataKey="gap_percentage">
              {top.map((entry, idx) => (
                <Cell key={idx} fill={entry.gap_percentage > 0 ? '#dc2626' : '#059669'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {top.length === 0 && <p className="text-xs text-muted-foreground mt-2">Tidak ada perubahan harga signifikan.</p>}
    </div>
  );
};

export default memo(PriceChangeChart);
