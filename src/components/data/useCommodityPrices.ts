import { useEffect, useState } from 'react';

export interface CommodityPrice {
  id: number;
  name: string;
  satuan: string;
  today: number;
  yesterday: number;
  yesterday_date: string;
  gap: number;
  gap_percentage: number;
  gap_change: string;
  gap_color: string;
  background: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: CommodityPrice[];
}

export function useCommodityPrices(levelHarga: number = 1, provinceId?: string, cityId?: string) {
  const [data, setData] = useState<CommodityPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let abort = false;
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const params = new URLSearchParams();
        params.append('level_harga_id', levelHarga.toString());
        if (provinceId) params.append('province_id', provinceId);
        if (cityId) params.append('city_id', cityId);
        
        const url = `https://api-panelhargav2.badanpangan.go.id/api/front/harga-pangan-informasi?${params.toString()}`;
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0',
          }
        });
        if (!res.ok) throw new Error('Status ' + res.status);
        const json: ApiResponse = await res.json();
        if (!abort) setData(json.data || []);
      } catch (e: any) {
        if (!abort) setError(e.message || 'Gagal memuat data');
      } finally {
        if (!abort) setLoading(false);
      }
    };
    fetchData();
    return () => { abort = true; };
  }, [levelHarga, provinceId, cityId]);

  return { data, loading, error };
}
