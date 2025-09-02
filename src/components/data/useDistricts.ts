import { useEffect, useState } from 'react';

export interface District {
  id: number;
  nama: string;
  province_id: number;
  ibu_kota: boolean;
  national_id: string;
  latlong: string;
  is_ihk: number;
  is_produsen: string;
  created_at: string;
  updated_at: string;
  province: {
    id: number;
    nama: string;
    kode_map: string;
    national_id: string;
    latlong: string;
    is_produsen: string;
    created_at: string;
    updated_at: string;
  };
}

interface DistrictsResponse {
  status: string;
  message: string;
  data: {
    current_page: number;
    data: District[];
  };
}

// Cache per province code
const districtCache: Record<string, District[]> = {};

export function useDistricts(provinceCode?: string) {
  const [districts, setDistricts] = useState<District[]>(provinceCode && districtCache[provinceCode] ? districtCache[provinceCode] : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provinceCode) { setDistricts([]); return; }
    if (districtCache[provinceCode]) { setDistricts(districtCache[provinceCode]); return; }
    let abort = false;
    const run = async () => {
      setLoading(true); setError(null);
      try {
        const url = `https://api-panelhargav2.badanpangan.go.id/api/cities?province_id=${provinceCode}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } });
        if (!res.ok) throw new Error('Status ' + res.status);
        const json: DistrictsResponse = await res.json();
        if (!abort) {
          districtCache[provinceCode] = json.data?.data || [];
          setDistricts(districtCache[provinceCode]);
        }
      } catch (e: any) {
        if (!abort) setError(e.message || 'Gagal memuat kab/kota');
      } finally {
        if (!abort) setLoading(false);
      }
    };
    run();
    return () => { abort = true; };
  }, [provinceCode]);

  return { districts, loading, error };
}
