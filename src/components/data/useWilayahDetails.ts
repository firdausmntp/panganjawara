import { useQuery } from '@tanstack/react-query';
import { fetchJSON, WilayahItem } from './useWilayah';

interface WilayahDetails {
  kelurahan?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  fullHierarchy?: string;
}

export const useWilayahDetails = (adm4Code?: string) => {
  return useQuery<WilayahDetails, Error>({
    queryKey: ['wilayah-details', adm4Code],
    enabled: !!adm4Code && adm4Code.split('.').length === 4,
    queryFn: async (): Promise<WilayahDetails> => {
      if (!adm4Code) return {};
      
      const parts = adm4Code.split('.');
      const [provCode, kabCode, kecCode, kelCode] = parts;
      const fullKabCode = `${provCode}.${kabCode}`;
      const fullKecCode = `${provCode}.${kabCode}.${kecCode}`;
      
      try {
        // Fetch semua data yang diperlukan secara paralel
        const [provData, kabData, kecData, kelData] = await Promise.all([
          fetchJSON<{ items: WilayahItem[] }>('/wilayah/provinsi'),
          fetchJSON<{ items: WilayahItem[] }>(`/wilayah/provinsi/${provCode}/kabkota`),
          fetchJSON<{ items: WilayahItem[] }>(`/wilayah/provinsi/${provCode}/kabkota/${kabCode}/kecamatan`),
          fetchJSON<{ items: WilayahItem[] }>(`/wilayah/provinsi/${provCode}/kabkota/${kabCode}/kecamatan/${kecCode}/kelurahan`)
        ]);

        // Cari nama dari setiap level
        const provinsi = provData.items.find(p => p.kode === provCode)?.nama;
        const kabupatenKota = kabData.items.find(k => k.kode === fullKabCode)?.nama;
        const kecamatan = kecData.items.find(k => k.kode === fullKecCode)?.nama;
        const kelurahan = kelData.items.find(k => k.kode === adm4Code)?.nama;

        const fullHierarchy = [kelurahan, kecamatan ? `Kec. ${kecamatan}` : '', kabupatenKota, provinsi ? `Prov. ${provinsi}` : '']
          .filter(Boolean)
          .join(', ');

        return {
          kelurahan,
          kecamatan,
          kabupatenKota,
          provinsi,
          fullHierarchy
        };
      } catch (error) {
        console.error('Error fetching wilayah details:', error);
        return {};
      }
    },
    staleTime: 60 * 60 * 1000, // Cache untuk 1 jam
  });
};
