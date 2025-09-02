import { useQuery } from '@tanstack/react-query';

export interface WeatherPoint {
  datetime: string; // UTC ISO
  local_datetime: string; // local time string
  t: number; // temperature C
  tcc: number; // cloud cover %
  tp: number; // precipitation mm
  weather: number;
  weather_desc: string;
  weather_desc_en: string;
  wd_deg: number;
  wd: string; // wind direction
  ws: number; // wind speed m/s
  hu: number; // humidity %
  image?: string; // icon url
}

export interface WeatherAPIResponse {
  lokasi: {
    adm1: string; adm2: string; adm3: string; adm4: string;
    provinsi: string; kotkab: string; kecamatan: string; desa: string;
    lon: number; lat: number; timezone: string;
  };
  data: Array<{
    lokasi: any;
    cuaca: WeatherPoint[][]; // nested arrays (time blocks)
  }>;
}

export interface ParsedForecastDay {
  date: string; // YYYY-MM-DD
  items: WeatherPoint[];
}

function parseForecast(resp?: WeatherAPIResponse): ParsedForecastDay[] {
  if (!resp?.data?.length) return [];
  const flat: WeatherPoint[] = resp.data[0].cuaca.flat();
  // Group by local date (take first 10 chars of local_datetime)
  const groups: Record<string, WeatherPoint[]> = {};
  for (const p of flat) {
    const date = (p.local_datetime || p.datetime).slice(0,10);
    if (!groups[date]) groups[date] = [];
    groups[date].push(p);
  }
  return Object.entries(groups)
    .sort(([a],[b]) => a.localeCompare(b))
    .slice(0,3)
    .map(([date, items]) => ({ date, items: items.sort((a,b)=> a.local_datetime.localeCompare(b.local_datetime)) }));
}

export const useWeatherForecast = (adm4: string | undefined) => {
  return useQuery<{ raw: WeatherAPIResponse | null; days: ParsedForecastDay[]; }, Error>({
    queryKey: ['weather-forecast', adm4],
    enabled: !!adm4,
    queryFn: async () => {
      const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal memuat prakiraan cuaca');
      const json: WeatherAPIResponse = await res.json();
      return { raw: json, days: parseForecast(json) };
    },
    staleTime: 10 * 60 * 1000,
  });
};
