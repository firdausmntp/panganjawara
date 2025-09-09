import { useQuery } from '@tanstack/react-query';
import { fetchJSON, WilayahItem } from './useWilayah';

interface WilayahSearchItem extends WilayahItem {
  hierarchy?: string;
}

export const useWilayahSearch = (q: string) => useQuery<{ items: WilayahSearchItem[] }, Error>({
  queryKey: ['wilayah-search', q],
  enabled: q.trim().length >= 3,
  queryFn: async () => {
    const data = await fetchJSON<{ items: WilayahItem[] }>(`/wilayah/search?q=${encodeURIComponent(q)}`);
    
    // Untuk setiap item, coba dapatkan hierarki lengkapnya
    const itemsWithHierarchy = await Promise.all(
      (data.items || [])
        .filter(item => item.kode.split('.').length === 4) // Hanya kelurahan/desa
        .slice(0, 20) // Batasi untuk performa
        .map(async (item) => {
          try {
            const parts = item.kode.split('.');
            const [provCode, kabCode, kecCode] = parts;
            
            // Fetch data hierarki secara paralel
            const [provData, kabData, kecData] = await Promise.all([
              fetchJSON<{ items: WilayahItem[] }>('/wilayah/provinsi'),
              fetchJSON<{ items: WilayahItem[] }>(`/wilayah/provinsi/${provCode}/kabkota`),
              fetchJSON<{ items: WilayahItem[] }>(`/wilayah/provinsi/${provCode}/kabkota/${kabCode}/kecamatan`)
            ]);

            const provinsi = provData.items.find(p => p.kode === provCode)?.nama;
            const kabupatenKota = kabData.items.find(k => k.kode === `${provCode}.${kabCode}`)?.nama;
            const kecamatan = kecData.items.find(k => k.kode === `${provCode}.${kabCode}.${kecCode}`)?.nama;

            const hierarchy = [kecamatan ? `Kec. ${kecamatan}` : '', kabupatenKota, provinsi]
              .filter(Boolean)
              .join(', ');

            return {
              ...item,
              hierarchy
            };
          } catch (error) {
            // Jika gagal, kembalikan tanpa hierarki
            return {
              ...item,
              hierarchy: 'Detail lokasi tidak tersedia'
            };
          }
        })
    );
    
    return { items: itemsWithHierarchy };
  },
  placeholderData: (prev) => prev,
});
