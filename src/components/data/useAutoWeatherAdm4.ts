import { useEffect, useState } from 'react';

/**
 * Hook untuk mendeteksi lokasi visitor via backend /pajar/location
 * lalu melakukan pencarian wilayah untuk mendapatkan kode ADM4 (kelurahan/desa)
 * guna keperluan prakiraan cuaca BMKG.
 * Mengembalikan adm4 random jika banyak hasil. Jika gagal semua, adm4 undefined.
 */
export function useAutoWeatherAdm4() {
  const [adm4, setAdm4] = useState<string | undefined>(undefined);
  const [city, setCity] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true); // loading lokasi
  const [searching, setSearching] = useState(false); // mencari kode
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await fetch('http://127.0.0.1:3000/pajar/location');
        if (!res.ok) throw new Error('Status ' + res.status);
        const json = await res.json();
        if (abort) return;
        const c = json?.properties?.region?.city || json?.properties?.region?.district;
        if (c) setCity(c);
      } catch (e: any) {
        if (!abort) setError(e.message || 'Gagal mendapatkan lokasi');
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, []);

  // Cari kode adm4 sekali berdasarkan city
  useEffect(() => {
    if (!city) return; // belum punya kota
    if (adm4) return; // sudah dapat
    let abort = false;
    setSearching(true);
    (async () => {
      try {
        const q = encodeURIComponent(city);
        const res = await fetch(`http://127.0.0.1:3000/pajar/wilayah/search?q=${q}`);
        if (!res.ok) throw new Error('Status ' + res.status);
        const json = await res.json();
        if (abort) return;
        const items: { kode: string; nama: string }[] = json.items || [];
        const adm4Items = items.filter(i => i.kode.split('.').length === 4);
        if (adm4Items.length) {
          const pick = adm4Items[Math.floor(Math.random() * adm4Items.length)];
          setAdm4(pick.kode);
        }
      } catch (e) {
        // diam, fallback akan pakai default nantinya
      } finally {
        if (!abort) setSearching(false);
      }
    })();
    return () => { abort = true; };
  }, [city, adm4]);

  return { adm4, city, loading, searching, error };
}

export type AutoWeatherResult = ReturnType<typeof useAutoWeatherAdm4>;
