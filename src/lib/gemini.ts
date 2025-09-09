export interface DashboardSummaryData {
  locationInfo: {
    isSelected: boolean;
    kelurahan?: string;
    kabupatenKota?: string;
    provinsi?: string;
    isIndonesia: boolean;
  };
  weatherData: {
    currentWeather?: string;
    currentTemp?: number;
    minTemp?: number;
    maxTemp?: number;
    tomorrowWeather?: string;
    tomorrowMinTemp?: number;
    tomorrowMaxTemp?: number;
  };
  commodityData: {
    totalCount: number;
    upCount: number;
    downCount: number;
    stableCount: number;
    topMover?: {
      name: string;
      percentage: number;
      price: number;
    };
    significantMovers?: string[];
  };
  timestamp: {
    time: string;
    date: string;
  };
}

export async function generateDashboardSummary(data: DashboardSummaryData): Promise<string> {

  // Bangun prompt yang komprehensif
  const prompt = `Buatkan ringkasan dashboard ketahanan pangan Indonesia yang natural dan informatif berdasarkan data berikut:

LOKASI CUACA:
- Metode deteksi: ${data.locationInfo.isSelected ? 'Dipilih manual' : 'Otomatis dari IP'}
- Lokasi: ${data.locationInfo.kelurahan || 'Tidak tersedia'}, ${data.locationInfo.kabupatenKota || ''}, ${data.locationInfo.provinsi || ''}
- Status: ${data.locationInfo.isIndonesia ? 'Indonesia' : 'Luar Indonesia'}

DATA CUACA:
- Cuaca saat ini: ${data.weatherData.currentWeather || 'Tidak tersedia'} ${data.weatherData.currentTemp || '?'}°C
- Rentang suhu hari ini: ${data.weatherData.minTemp || '?'}°C - ${data.weatherData.maxTemp || '?'}°C
- Prakiraan besok: ${data.weatherData.tomorrowWeather || 'Tidak tersedia'} ${data.weatherData.tomorrowMinTemp || '?'}°C - ${data.weatherData.tomorrowMaxTemp || '?'}°C

DATA KOMODITAS:
- Total komoditas: ${data.commodityData.totalCount}
- Naik: ${data.commodityData.upCount}, Turun: ${data.commodityData.downCount}, Stabil: ${data.commodityData.stableCount}
${data.commodityData.topMover ? `- Pergerakan tertinggi: ${data.commodityData.topMover.name} ${data.commodityData.topMover.percentage > 0 ? '+' : ''}${data.commodityData.topMover.percentage.toFixed(1)}% (Rp ${data.commodityData.topMover.price.toLocaleString('id-ID')})` : ''}
${data.commodityData.significantMovers ? `- Pergerakan signifikan lainnya: ${data.commodityData.significantMovers.join(', ')}` : ''}

WAKTU: ${data.timestamp.time}, ${data.timestamp.date}

INSTRUKSI:
1. Buat ringkasan dalam bahasa Indonesia yang natural dan mudah dipahami
2. Gunakan emoji yang sesuai (📍🎯🌍 untuk lokasi, ☀️🌧️☁️ untuk cuaca, 📈📉💰 untuk harga)
3. Berikan insight yang berguna untuk petani dan konsumen
4. Maksimal 3-4 kalimat, padat tapi informatif
5. Sertakan waktu pembaruan di akhir
6. Jangan gunakan bullet point, buat dalam bentuk paragraf yang mengalir

Contoh gaya: "📍 Prakiraan cuaca Cirarab menunjukkan hujan ringan dengan suhu 26°C, cocok untuk tanaman yang membutuhkan kelembaban tinggi. 💰 Pasar komoditas hari ini cukup aktif dengan 15 komoditas mengalami kenaikan dari total 45 komoditas, di mana cabai rawit memimpin dengan kenaikan 5.2%. 🌧️ Cuaca besok diprediksi tetap hujan dengan suhu 24-32°C, petani disarankan memperhatikan drainase lahan. ⏰ Diperbarui 15.19, Selasa 9 September 2025."`;

  // Multiple fallback attempts
  const fallbackAttempts = [
    // Attempt 1: FerDev API (primary)
    () => callFerDevAPI(prompt, 'gemini'),
    // Attempt 2: FerDev API (retry)
    () => callFerDevAPI(prompt, 'gemini'),
    // Attempt 3: Local fallback
    () => Promise.resolve(generateFallbackSummary(data))
  ];

  for (let i = 0; i < fallbackAttempts.length; i++) {
    try {
      const result = await fallbackAttempts[i]();
      if (result && result.trim()) {
        return result.trim();
      }
    } catch (error) {
      console.error(`AI Summary attempt ${i + 1} failed:`, error);
      
      // Jika bukan attempt terakhir, coba lagi
      if (i < fallbackAttempts.length - 1) {
        continue;
      }
      
      // Jika semua attempt gagal, return fallback summary
      return generateFallbackSummary(data);
    }
  }

  // Final fallback jika semua gagal
  return generateFallbackSummary(data);
}

async function callFerDevAPI(prompt: string, model: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const apiKey = 'key-veng'; // Default key atau bisa dari env
    const response = await fetch('https://api.ferdev.my.id/ai/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ 
        prompt: `Sebagai asisten AI ahli pertanian dan cuaca Indonesia: ${prompt}` 
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`FerDev API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    const generatedText = result?.message;
    
    if (!generatedText) {
      throw new Error('No content generated from FerDev API');
    }

    return generatedText.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function generateFallbackSummary(data: DashboardSummaryData): string {
  let parts: string[] = [];
  
  // Lokasi
  const locationIcon = data.locationInfo.isSelected ? '🎯' : data.locationInfo.isIndonesia ? '📍' : '🌍';
  const locationText = data.locationInfo.isIndonesia ? 
    `${locationIcon} ${data.locationInfo.kelurahan || 'Lokasi'}, ${data.locationInfo.kabupatenKota || ''}, ${data.locationInfo.provinsi || ''}` :
    `🌍 Lokasi luar Indonesia (menggunakan data Jakarta)`;
  parts.push(locationText.replace(/,\s*,/g, ',').replace(/,\s*$/, ''));
  
  // Cuaca
  if (data.weatherData.currentWeather && data.weatherData.currentTemp) {
    const weatherIcon = data.weatherData.currentWeather.includes('cerah') ? '☀️' : 
                       data.weatherData.currentWeather.includes('berawan') ? '☁️' : 
                       data.weatherData.currentWeather.includes('hujan') ? '🌧️' : '🌤️';
    parts.push(`${weatherIcon} ${data.weatherData.currentWeather} ${data.weatherData.currentTemp}°C (${data.weatherData.minTemp}-${data.weatherData.maxTemp}°C)`);
  }
  
  // Harga
  if (data.commodityData.totalCount > 0 && data.commodityData.topMover) {
    const trendIcon = data.commodityData.topMover.percentage > 0 ? '📈' : '📉';
    parts.push(`${trendIcon} ${data.commodityData.upCount} naik, ${data.commodityData.downCount} turun dari ${data.commodityData.totalCount} komoditas`);
  }
  
  // Waktu
  parts.push(`⏰ ${data.timestamp.time}, ${data.timestamp.date}`);
  
  return parts.join(' ');
}
