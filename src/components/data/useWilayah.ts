import { useQuery } from '@tanstack/react-query';

export interface WilayahItem { kode: string; nama: string; }
const baseUrl = 'http://localhost:3000';
const lastSeg = (code?: string) => code ? code.split('.').pop() || code : '';
export const fetchJSON = async <T,>(url: string): Promise<T> => {
  const res = await fetch(baseUrl + url);
  if (!res.ok) throw new Error('Gagal memuat ' + url);
  return res.json();
};

export const useProvinsi = () => useQuery<{ items: WilayahItem[] }, Error>({
  queryKey: ['provinsi'],
  queryFn: () => fetchJSON('/pajar/wilayah/provinsi'),
  staleTime: 24 * 60 * 60 * 1000,
});

export const useKabKota = (provCode?: string) => useQuery<{ items: WilayahItem[] }, Error>({
  queryKey: ['kabkota', provCode],
  enabled: !!provCode,
  queryFn: () => fetchJSON(`/pajar/wilayah/provinsi/${provCode}/kabkota`),
  staleTime: 60 * 60 * 1000,
});

export const useKecamatan = (provCode?: string, kabCode?: string) => useQuery<{ items: WilayahItem[] }, Error>({
  queryKey: ['kecamatan', provCode, kabCode],
  enabled: !!provCode && !!kabCode,
  queryFn: () => fetchJSON(`/pajar/wilayah/provinsi/${provCode}/kabkota/${lastSeg(kabCode)}/kecamatan`),
  staleTime: 30 * 60 * 1000,
});

export const useKelurahan = (provCode?: string, kabCode?: string, kecCode?: string) => useQuery<{ items: WilayahItem[] }, Error>({
  queryKey: ['kelurahan', provCode, kabCode, kecCode],
  enabled: !!provCode && !!kabCode && !!kecCode,
  queryFn: () => fetchJSON(`/pajar/wilayah/provinsi/${provCode}/kabkota/${lastSeg(kabCode)}/kecamatan/${lastSeg(kecCode)}/kelurahan`),
  staleTime: 10 * 60 * 1000,
});
