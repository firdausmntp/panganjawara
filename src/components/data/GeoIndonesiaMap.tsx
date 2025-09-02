import { memo, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

// Lightweight topojson for Indonesia (public CDN). For production host locally.
const TOPO_URL = 'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/indonesia/indonesia-provinces.json';

interface GeoIndonesiaMapProps {
  onSelect?: (provName: string) => void;
  highlightName?: string;
}

const GeoIndonesiaMap = ({ onSelect, highlightName }: GeoIndonesiaMapProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // react-simple-maps will internally fetch. We can listen via Image onError not available; use a small timeout fallback
  // Fallback: if not painted after 3s assume network latency
  useState(() => {
    const t = setTimeout(() => { if (loading) setError('Gagal memuat peta'); }, 6000);
    return () => clearTimeout(t);
  });

  return (
    <div className="w-full h-full relative" aria-label="Peta Indonesia">
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-slate-500 animate-pulse">
          <span>Memuat peta...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-red-600">
          {error}
        </div>
      )}
      <ComposableMap
        projectionConfig={{ scale: 850, center: [118, -2] }}
        width={800}
        height={420}
        style={{ width: '100%', height: '100%', opacity: error ? 0.3 : 1 }}
        data-tip=""
        onMouseEnter={() => loading && setLoading(false)}
      >
        <Geographies geography={TOPO_URL}>
          {({ geographies }) => geographies.map(geo => {
            const name = (geo.properties as any).name as string;
            const isHighlight = highlightName && name.toLowerCase().includes(highlightName.toLowerCase());
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => onSelect?.(name)}
                style={{
                  default: { fill: isHighlight ? '#16a34a' : '#CBD5E1', outline: 'none', stroke: '#fff', strokeWidth: 0.5, cursor: 'pointer' },
                  hover: { fill: '#059669', outline: 'none' },
                  pressed: { fill: '#047857', outline: 'none' }
                }}
              />
            );
          })}
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default memo(GeoIndonesiaMap);
