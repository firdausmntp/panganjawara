import { useEffect, useState } from 'react';

export interface Province {
  id: number;
  nama: string;
  kode_map: string;
  national_id: string;
  latlong: string;
  is_produsen: string;
  created_at: string;
  updated_at: string;
}

interface ProvincesResponse {
  status: string;
  message: string;
  data: Province[];
}

// Simple in-memory cache to avoid refetching while app lives
let cachedProvinces: Province[] | null = null;

export function useProvinces() {
  const [provinces, setProvinces] = useState<Province[]>(cachedProvinces || []);
  const [loading, setLoading] = useState(!cachedProvinces);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedProvinces) return; // already cached
    let abort = false;
    const run = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch('https://api-panelhargav2.badanpangan.go.id/api/provinces?search=', {
          headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
        });
        if (!res.ok) throw new Error('Status ' + res.status);
        const json: ProvincesResponse = await res.json();
        if (!abort) {
          cachedProvinces = json.data || [];
          setProvinces(cachedProvinces);
        }
      } catch (e: any) {
        if (!abort) setError(e.message || 'Gagal memuat provinsi');
      } finally {
        if (!abort) setLoading(false);
      }
    };
    run();
    return () => { abort = true; };
  }, []);

  return { provinces, loading, error };
}
