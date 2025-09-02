import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useProvinces } from './useProvinces';
import { useCommodityPrices } from './useCommodityPrices';
import { simplemaps_countrymap } from '../mapData.ts';

// Type definitions for the SimpleMaps data structure
interface ProvinceData {
  name: string;
  description: string;
  color: string;
  hover_color: string;
  url: string;
}

interface LocationData {
  name: string;
  lat: string;
  lng: string;
}

interface SimpleMapData {
  state_specific: Record<string, ProvinceData>;
  locations: Record<string, LocationData>;
  paths: Record<string, string>;
}

// Indonesia Map component using the complete SimpleMaps data with zoom functionality
export interface IndonesiaMapProps {
  selected?: string | null;
  onSelect?: (code: string) => void;
  className?: string;
}

const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ selected, onSelect, className }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<{ code: string; x: number; y: number } | null>(null);

  // Type assertion for the imported data
  const mapData = simplemaps_countrymap as SimpleMapData;

  // Provinces list (to map map-code -> province id for API)
  const { provinces } = useProvinces();
  const hoveredProvinceId = hovered ? provinces.find(p => p.kode_map === hovered.code)?.id?.toString() : undefined;
  const hoveredProvinceName = hovered ? mapData.state_specific?.[hovered.code]?.name : undefined;

  // Fetch commodity prices for hovered province (falls back to national when undefined)
  const { data: hoverPrices, loading: hoverLoading, error: hoverError } = useCommodityPrices(1, hoveredProvinceId);

  const formatCurrency = (value?: number) => {
    if (value == null || Number.isNaN(value)) return '-';
    try { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value); } catch {
      return `${value}`;
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    // Clear hover while dragging to avoid unnecessary updates
    setHovered(null);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleProvinceClick = (provinceCode: string) => {
    if (onSelect) {
      onSelect(provinceCode);
    }
  };

  const updateHoverPos = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (hovered) setHovered({ code: hovered.code, x, y });
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || zoom <= 1) return;
      
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart.x, dragStart.y, zoom]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 rounded-xl border shadow-lg overflow-hidden select-none ${className || ''}`}
      style={{ aspectRatio: '5/3', minHeight: '400px' }}
      aria-label="Peta Indonesia"
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <button
          onClick={handleZoomIn}
          disabled={zoom >= 3}
          className="p-2 rounded-md bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          className="p-2 rounded-md bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white transition-colors"
          title="Reset View"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-sm font-medium text-gray-700">
        {Math.round(zoom * 100)}%
      </div>

      {/* SVG Map Container */}
    <div 
        className={`w-full h-full ${zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={(e) => {
          handleMouseMove(e);
      if (!isDragging) updateHoverPos(e);
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1000 368"
          role="img"
          aria-labelledby="indonesiaMapTitle"
          className="w-full h-full"
          fill="#6f9c76"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0.5"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          <title id="indonesiaMapTitle">Peta Indonesia Interaktif</title>
          
          {/* Defs for gradients and filters */}
          <defs>
            <linearGradient id="defaultFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            
            <linearGradient id="selectedFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="50%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            
            <linearGradient id="hoverFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            
            <filter id="provinceShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#000000" floodOpacity="0.2"/>
            </filter>
          </defs>

          <g id="features">
            {/* Render all 34 Indonesian provinces from SimpleMaps data */}
            {mapData.state_specific && Object.entries(mapData.state_specific).map(([provinceCode, provinceInfo]) => {
              const isSelected = selected === provinceCode;
              const pathData = mapData.paths?.[provinceCode];
              const isHovered = hovered?.code === provinceCode;
              
              if (!pathData) return null;
              
              return (
                <path
                  key={provinceCode}
                  id={provinceCode}
                  d={pathData}
                  className="cursor-pointer transition-all duration-300 hover:brightness-110"
                  fill={isSelected ? 'url(#selectedFill)' : (isHovered ? 'url(#hoverFill)' : '#6f9c76')}
                  stroke="#ffffff"
                  strokeWidth="0.5"
                  onClick={() => handleProvinceClick(provinceCode)}
                  onMouseEnter={(e) => {
                    // Start hover and position tooltip
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      setHovered({ code: provinceCode, x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }
                  }}
                  onMouseLeave={(e) => {
                    setHovered(null);
                  }}
                  onMouseMove={(e) => updateHoverPos(e)}
                >
                  <title>{provinceInfo.name}</title>
                </path>
              );
            })}

            {/* Render location markers for major cities */}
            {mapData.locations && Object.entries(mapData.locations).map(([locationId, location]) => (
              <circle
                key={locationId}
                cx={parseFloat(location.lng) * 8.5 + 500} // Adjusted conversion for proper positioning
                cy={parseFloat(location.lat) * -8.5 + 200} // Adjusted conversion for proper positioning
                r="3"
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth="1"
                className="opacity-80 hover:opacity-100"
              >
                <title>{location.name}</title>
              </circle>
            ))}
          </g>
        </svg>
      </div>

      {/* Hover tooltip with prices */}
      {hovered && !isDragging && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{ left: Math.min(Math.max(hovered.x + 12, 8), (containerRef.current?.clientWidth || 0) - 220), top: Math.min(Math.max(hovered.y + 12, 8), (containerRef.current?.clientHeight || 0) - 140) }}
        >
          <div className="w-[220px] rounded-lg shadow-xl border bg-white/95 backdrop-blur-md p-3 text-xs">
            <div className="font-semibold text-gray-800 mb-1">{hoveredProvinceName || hovered.code}</div>
            {hoverLoading && <div className="text-gray-500">Memuat harga…</div>}
            {hoverError && <div className="text-red-600">Gagal memuat harga</div>}
            {!hoverLoading && !hoverError && (
              <div className="space-y-1">
                {(hoverPrices?.slice(0, 3) || []).map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2">
                    <span className="text-gray-600 truncate" title={c.name}>{c.name}</span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(c.today)}<span className="text-[10px] text-gray-500 ml-1">/{c.satuan}</span></span>
                  </div>
                ))}
                {!hoverPrices?.length && <div className="text-gray-500">Tidak ada data harga</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Province Indicator */}
      {selected && mapData.state_specific?.[selected] && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl px-4 py-3 shadow-xl border border-red-400 animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
            <div className="font-bold text-sm">
              {mapData.state_specific[selected].name}
            </div>
          </div>
          <div className="text-xs opacity-90 mt-1">Provinsi Terpilih</div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border text-xs">
        <div className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
          🗺️ Peta Indonesia Interaktif
        </div>
        <div className="space-y-1 text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-green-600 rounded"></div>
            <span>Provinsi ({mapData.state_specific ? Object.keys(mapData.state_specific).length : 0})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-red-600 rounded"></div>
            <span>Terpilih</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Ibukota</span>
          </div>
        </div>
        <div className="text-[10px] text-gray-500 mt-2">
          Klik untuk memilih • Zoom & drag untuk navigasi
        </div>
      </div>
    </div>
  );
};

export default IndonesiaMap;
