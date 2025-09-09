import { useState, useEffect } from 'react';
import { API_CONFIG } from '../lib/api';

interface AdmCode {
  adm1_code: string;
  adm1_name: string;
  adm2_code: string;
  adm2_name: string;
  adm3_code: string;
  adm3_name: string;
  adm4_code: string;
  adm4_name: string;
}

interface WilayahItem {
  kode: string;
  nama: string;
}

export const useLocationToAdm4 = (city: string, district: string, state: string, countryCode: string, enabled = true) => {
  const [data, setData] = useState<AdmCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIndonesia, setIsIndonesia] = useState(true);

  useEffect(() => {
    if (!enabled || !city) {
      return;
    }

    const fetchAdmCode = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cek apakah lokasi di Indonesia
        if (countryCode !== 'ID' && countryCode !== 'IDN') {
          setIsIndonesia(false);
          // Gunakan default Jakarta untuk lokasi luar Indonesia
          setData({
            adm1_code: '36',
            adm1_name: 'DKI Jakarta',
            adm2_code: '36.71',
            adm2_name: 'Jakarta Pusat',
            adm3_code: '36.71.01',
            adm3_name: 'Gambir',
            adm4_code: '36.71.01.1001',
            adm4_name: 'Gambir'
          });
          return;
        }

        setIsIndonesia(true);

        const baseUrl = API_CONFIG.BASE_URL;

        // 1. Ambil semua provinsi untuk mencari yang cocok
        const provResponse = await fetch(`${baseUrl}/wilayah/provinsi`);
        if (!provResponse.ok) throw new Error('Failed to fetch provinces');
        
        const provData = await provResponse.json();
        const provinces: WilayahItem[] = provData.items || [];
        
        // Cari provinsi yang cocok dengan state dari IP
        const matchedProvince = provinces.find(p => 
          p.nama.toLowerCase().includes(state.toLowerCase()) ||
          state.toLowerCase().includes(p.nama.toLowerCase())
        ) || provinces[0]; // fallback ke provinsi pertama

        // 2. Ambil kabupaten/kota dalam provinsi tersebut
        const kabResponse = await fetch(`${baseUrl}/wilayah/provinsi/${matchedProvince.kode}/kabkota`);
        if (!kabResponse.ok) throw new Error('Failed to fetch regencies');
        
        const kabData = await kabResponse.json();
        const regencies: WilayahItem[] = kabData.items || [];
        
        // Cari kabupaten/kota yang cocok dengan city/district dari IP
        const searchQuery = district.includes('City') || district.includes('Kota') ? 
          district.replace(' City', '').replace('Kota ', '') : city;
        
        const matchedRegency = regencies.find(r => 
          r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          searchQuery.toLowerCase().includes(r.nama.toLowerCase())
        ) || regencies[Math.floor(Math.random() * regencies.length)]; // random jika tidak cocok

        // 3. Ambil kecamatan dalam kabupaten/kota tersebut
        const lastSeg = (code: string) => code.split('.').pop() || code;
        const kecResponse = await fetch(`${baseUrl}/wilayah/provinsi/${matchedProvince.kode}/kabkota/${lastSeg(matchedRegency.kode)}/kecamatan`);
        if (!kecResponse.ok) throw new Error('Failed to fetch districts');
        
        const kecData = await kecResponse.json();
        const districts: WilayahItem[] = kecData.items || [];
        
        if (districts.length === 0) throw new Error('No districts found');
        
        // Random pick kecamatan
        const randomKecamatan = districts[Math.floor(Math.random() * districts.length)];

        // 4. Ambil kelurahan dalam kecamatan tersebut
        const kelResponse = await fetch(`${baseUrl}/wilayah/provinsi/${matchedProvince.kode}/kabkota/${lastSeg(matchedRegency.kode)}/kecamatan/${lastSeg(randomKecamatan.kode)}/kelurahan`);
        if (!kelResponse.ok) throw new Error('Failed to fetch villages');
        
        const kelData = await kelResponse.json();
        const villages: WilayahItem[] = kelData.items || [];
        
        if (villages.length === 0) throw new Error('No villages found');
        
        // Random pick kelurahan
        const randomKelurahan = villages[Math.floor(Math.random() * villages.length)];

        // Build final ADM4 code
        const finalAdm4Code = `${matchedProvince.kode}.${matchedRegency.kode.split('.').pop()}.${randomKecamatan.kode.split('.').pop()}.${randomKelurahan.kode.split('.').pop()}`;

        setData({
          adm1_code: matchedProvince.kode,
          adm1_name: matchedProvince.nama,
          adm2_code: `${matchedProvince.kode}.${matchedRegency.kode.split('.').pop()}`,
          adm2_name: matchedRegency.nama,
          adm3_code: `${matchedProvince.kode}.${matchedRegency.kode.split('.').pop()}.${randomKecamatan.kode.split('.').pop()}`,
          adm3_name: randomKecamatan.nama,
          adm4_code: finalAdm4Code,
          adm4_name: randomKelurahan.nama
        });
        
      } catch (err) {
        console.error('Error fetching ADM code:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch ADM code');
        
        // Fallback ke default berdasarkan IP location atau default Jakarta
        const fallbackData = {
          adm1_code: '36',
          adm1_name: state || 'DKI Jakarta',
          adm2_code: '36.71',
          adm2_name: district || city || 'Jakarta Pusat',
          adm3_code: '36.71.01',
          adm3_name: 'Gambir',
          adm4_code: '36.71.01.1001',
          adm4_name: 'Gambir'
        };
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmCode();
  }, [city, district, state, enabled]);

  return {
    data,
    loading,
    error,
    isIndonesia,
    adm4Code: data?.adm4_code || '36.71.01.1001',
    locationName: data ? `${data.adm2_name}, ${data.adm3_name}, ${data.adm4_name}` : '',
    displayLocation: isIndonesia ? 
      (data ? `${data.adm2_name}, ${data.adm3_name}, ${data.adm4_name}` : '') :
      `${city}, ${state} (Default: Jakarta)`,
    // Detail lokasi yang lebih lengkap dan jelas
    locationDetail: data ? {
      provinsi: data.adm1_name,
      kabupatenKota: data.adm2_name,
      kecamatan: data.adm3_name,
      kelurahan: data.adm4_name,
      fullHierarchy: `${data.adm4_name}, Kec. ${data.adm3_name}, ${data.adm2_name}, Prov. ${data.adm1_name}`,
      shortHierarchy: `${data.adm2_name}, ${data.adm3_name}, ${data.adm4_name}`,
      weatherLocation: `${data.adm4_name}, ${data.adm3_name}` // Untuk display cuaca
    } : null
  };
};
