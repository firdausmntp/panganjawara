import { 
  Wheat,
  CloudRain,
  Users,
  Package,
  TrendingUp,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Play,
  Video,
  Eye,
  Heart,
  Clock,
  Calendar,
  Award
} from "lucide-react";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, Link } from 'react-router-dom';
import { useCommodityPrices } from '@/components/data/useCommodityPrices';
import WeatherForecast from '@/components/data/WeatherForecast';
import { useWeatherForecast } from '@/components/data/useWeatherForecast';
import { getUserIdentifier } from '@/lib/user';
import { stripMarkdown } from '../lib/text';
import ChatAssistant from "@/components/dashboard/ChatAssistant";
import InteractiveMap from "@/components/dashboard/InteractiveMap";
import WeatherLoading from "@/components/dashboard/WeatherLoading";
import LoadingDots from "@/components/ui/loading-dots";
import { useIPLocation } from '@/hooks/useIPLocation';
import { useLocationToAdm4 } from '@/hooks/useLocationToAdm4';
import { useWilayahDetails } from '@/components/data/useWilayahDetails';
import { API_CONFIG, buildApiUrl, buildImageUrl } from '../lib/api';
import { generateDashboardSummary, type DashboardSummaryData } from '../lib/gemini';

interface ArticleLite { id:number; title:string; created_at?:string; excerpt?:string; like_count?:number; view_count?:number; images?: { path:string }[]; content?: string; }
interface PostLite { id:number; title?:string; content:string; author:string; like_count?:number; created_at?:string; }
interface VideoLite { id:number; title:string; description:string; author:string; youtube_url:string; thumbnail_url?:string; view_count:number; like_count?:number; created_at:string; }

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: harga, loading: loadingHarga, error: hargaError } = useCommodityPrices(1);
  const [articles, setArticles] = useState<ArticleLite[]>([]);
  const [trending, setTrending] = useState<ArticleLite[]>([]);
  const [posts, setPosts] = useState<PostLite[]>([]);
  const [videos, setVideos] = useState<VideoLite[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // IP Location untuk cuaca
  const ipLocation = useIPLocation();
  const locationToAdm4 = useLocationToAdm4(
    ipLocation.city,
    ipLocation.district, 
    ipLocation.state,
    ipLocation.data?.properties?.country?.code || 'ID',
    !ipLocation.loading && !ipLocation.error && !!ipLocation.city
  );
  
  // State untuk ADM4 yang dipilih user (dari pencarian cuaca)
  const [selectedAdm4, setSelectedAdm4] = useState<string>('');
  
  // Gunakan ADM4 yang dipilih user, atau dari IP location, atau fallback
  const adm4 = selectedAdm4 || locationToAdm4.adm4Code || '36.03.12.2001';
  const weatherQuery = useWeatherForecast(adm4);
  const wilayahDetails = useWilayahDetails(adm4);
  
  // Status loading gabungan
  const locationLoading = ipLocation.loading || locationToAdm4.loading;

  // AI summary state (derived)
  const [summary, setSummary] = useState<string>('');

  // Handler untuk perubahan lokasi cuaca
  const handleLocationChange = (newAdm4: string) => {
    setSelectedAdm4(newAdm4);
    // Log untuk debugging (bisa dihapus di production)
    console.log('Dashboard: Lokasi cuaca diperbarui ke', newAdm4);
  };

  useEffect(() => {
    // Bangun ringkasan setelah data tersedia
    if (loadingHarga || weatherQuery.isLoading || locationLoading) return;
    
    // Tambah sedikit delay untuk efek "AI thinking"
    const timer = setTimeout(async () => {
      try {
        // Prepare data untuk Gemini AI
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'Asia/Jakarta'
        });
        const dateStr = now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric', 
          month: 'long',
          year: 'numeric'
        });

        // Prepare location data
        const locationInfo = {
          isSelected: !!selectedAdm4,
          kelurahan: wilayahDetails.data?.kelurahan || locationToAdm4.locationDetail?.weatherLocation || ipLocation.city,
          kabupatenKota: wilayahDetails.data?.kabupatenKota || locationToAdm4.locationDetail?.kabupatenKota || ipLocation.district,
          provinsi: wilayahDetails.data?.provinsi || locationToAdm4.locationDetail?.provinsi || ipLocation.state,
          isIndonesia: locationToAdm4.isIndonesia
        };

        // Prepare weather data
        const days = weatherQuery.data?.days || [];
        let weatherData: DashboardSummaryData['weatherData'] = {};
        
        if (days.length > 0) {
          const today = days[0];
          const tomorrow = days[1];
          const temps = today.items.map(i => i.t);
          const maxT = Math.max(...temps);
          const minT = Math.min(...temps);
          
          // Current weather
          const currentHour = now.getHours();
          const currentSlot = today.items.find(i => {
            const itemHour = parseInt(i.local_datetime.slice(11,13));
            return Math.abs(itemHour - currentHour) <= 1;
          }) || today.items.find(i => i.local_datetime.slice(11,13) === '12') || today.items[Math.floor(today.items.length/2)];
          
          if (currentSlot) {
            weatherData = {
              currentWeather: currentSlot.weather_desc?.toLowerCase(),
              currentTemp: currentSlot.t,
              minTemp: minT,
              maxTemp: maxT
            };
          }
          
          // Tomorrow weather
          if (tomorrow && tomorrow.items.length > 0) {
            const tomorrowTemps = tomorrow.items.map(i => i.t);
            const tomorrowMax = Math.max(...tomorrowTemps);
            const tomorrowMin = Math.min(...tomorrowTemps);
            const tomorrowMidday = tomorrow.items.find(i => i.local_datetime.slice(11,13) === '12') || tomorrow.items[Math.floor(tomorrow.items.length/2)];
            
            if (tomorrowMidday) {
              weatherData.tomorrowWeather = tomorrowMidday.weather_desc?.toLowerCase();
              weatherData.tomorrowMinTemp = tomorrowMin;
              weatherData.tomorrowMaxTemp = tomorrowMax;
            }
          }
        }

        // Prepare commodity data
        let commodityData: DashboardSummaryData['commodityData'] = {
          totalCount: harga.length,
          upCount: 0,
          downCount: 0,
          stableCount: 0
        };

        if (harga.length > 0) {
          const naik = harga.filter(c => c.gap > 0).length;
          const turun = harga.filter(c => c.gap < 0).length;
          const stabil = harga.length - naik - turun;
          
          commodityData.upCount = naik;
          commodityData.downCount = turun;
          commodityData.stableCount = stabil;
          
          const sorted = [...harga].sort((a,b) => Math.abs(b.gap_percentage) - Math.abs(a.gap_percentage));
          const top = sorted.slice(0, 5);
          
          if (top.length > 0) {
            const topMover = top[0];
            commodityData.topMover = {
              name: topMover.name,
              percentage: topMover.gap_percentage,
              price: topMover.today
            };
            
            if (top.length >= 3) {
              commodityData.significantMovers = top.slice(1, 3).map(c => 
                `${c.name} ${c.gap > 0 ? '+' : ''}${c.gap_percentage.toFixed(1)}%`
              );
            }
          }
        }

        const summaryData: DashboardSummaryData = {
          locationInfo,
          weatherData,
          commodityData,
          timestamp: {
            time: timeStr,
            date: dateStr
          }
        };

        // Generate AI summary
        const aiSummary = await generateDashboardSummary(summaryData);
        setSummary(aiSummary);
        
      } catch (error) {
        console.error('Error generating AI summary:', error);
        // Fallback ke ringkasan sederhana jika error
        setSummary(`⚠️ Terjadi masalah saat menganalisis data. Memuat ${harga.length} komoditas dan prakiraan cuaca untuk ${wilayahDetails.data?.kelurahan || 'lokasi terpilih'}. ⏰ ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`);
      }
    }, 1200); // delay lebih lama untuk AI processing

    return () => clearTimeout(timer);
  }, [harga, loadingHarga, weatherQuery.data, weatherQuery.isLoading, weatherQuery.error, locationLoading, ipLocation.city, ipLocation.state, locationToAdm4.isIndonesia, wilayahDetails.data, selectedAdm4]);

  // Fetch helpers
  useEffect(()=> {
    let abort=false;
    (async()=>{
      try { setLoadingArticles(true); const r = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES)); if(!r.ok) throw new Error(); const j= await r.json(); let list:any[] = Array.isArray(j)? j : (j.data||j.articles||[]); list = list.filter(a=>a.status==='published').slice(0,4); if(!abort) setArticles(list); } catch { if(!abort) setArticles([]);} finally { if(!abort) setLoadingArticles(false);} })();
    return ()=>{abort=true};
  },[]);
  useEffect(()=> {
    let abort=false;
    (async()=>{ try { setLoadingTrending(true); const r= await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES_TRENDING)); if(!r.ok) throw new Error(); const j= await r.json(); let list:any[] = j.articles || j.data || (Array.isArray(j)?j:[]); if(!abort) setTrending(list.slice(0,5)); } catch { if(!abort) setTrending([]);} finally { if(!abort) setLoadingTrending(false);} })();
    return ()=>{abort=true};
  },[]);
  useEffect(()=> {
    let abort=false;
    (async()=>{ 
      try { 
        setLoadingPosts(true); 
        const uid = getUserIdentifier();
        const r= await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS}?user_id=${uid}&page=1&limit=6`)); 
        if(!r.ok) throw new Error(); 
        const j= await r.json(); 
        let list:any[] = Array.isArray(j)? j : (j.posts || j.data?.posts || []); 
        if(!abort) setPosts(list.slice(0,6)); 
      } catch { 
        if(!abort) setPosts([]);
      } finally { if(!abort) setLoadingPosts(false);} 
    })();
    return ()=>{abort=true};
  },[]);

  // Fetch videos
  useEffect(()=> {
    let abort=false;
    (async()=>{ 
      try { 
        setLoadingVideos(true); 
        const r= await fetch(buildApiUrl('/public/videos?page=1&limit=4')); 
        if(!r.ok) throw new Error(); 
        const j= await r.json(); 
        let list:any[] = j.data || (Array.isArray(j)?j:[]); 
        if(!abort) setVideos(list.slice(0,4)); 
      } catch { 
        if(!abort) setVideos([]);
      } finally { if(!abort) setLoadingVideos(false);} 
    })();
    return ()=>{abort=true};
  },[]);

  // Video utility functions
  const getVideoThumbnail = (video: VideoLite) => {
    if (video.thumbnail_url) return video.thumbnail_url;
    // Extract YouTube thumbnail
    const videoId = extractYouTubeVideoId(video.youtube_url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/placeholder.svg';
  };

  const extractYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const doRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        (async()=>{ const r = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES)); if(r.ok){ const j= await r.json(); let list:any[] = Array.isArray(j)?j:(j.data||j.articles||[]); setArticles(list.filter(a=>a.status==='published').slice(0,4)); } })(),
        (async()=>{ const r = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES_TRENDING)); if(r.ok){ const j= await r.json(); let list:any[] = j.articles || j.data || (Array.isArray(j)?j:[]); setTrending(list.slice(0,5)); } })(),
        (async()=>{ const uid = getUserIdentifier(); const r = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS}?user_id=${uid}&page=1&limit=6`)); if(r.ok){ const j= await r.json(); let list:any[] = Array.isArray(j)? j : (j.posts || j.data?.posts || []); setPosts(list.slice(0,6)); } })(),
        (async()=>{ const r = await fetch(buildApiUrl('/public/videos?page=1&limit=4')); if(r.ok){ const j= await r.json(); let list:any[] = j.data || (Array.isArray(j)?j:[]); setVideos(list.slice(0,4)); } })()
      ]);
    } finally { setRefreshing(false); }
  };

  const fmtDate = (s?:string) => s ? new Date(s).toLocaleDateString('id-ID',{ day:'numeric', month:'short' }) : '';
  const firstImage = (a:any) => a?.images?.[0]?.path ? buildImageUrl(a.images[0].path) : '/placeholder.svg';

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      {/* Simple Hero */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white p-6 sm:p-10 flex flex-col gap-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">Dashboard Ketahanan Pangan</h1>
              <p className="text-sm sm:text-base text-emerald-50 max-w-xl">Ikhtisar ringkas data harga komoditas, artikel edukasi, dan aktivitas komunitas terbaru.</p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" variant="secondary" onClick={()=>navigate('/data')} className="gap-1">Data Harga <ArrowRight className="w-4 h-4"/></Button>
                <Button size="sm" variant="outline" onClick={()=>navigate('/edukasi')} className="bg-white/10 backdrop-blur hover:bg-white/20">Edukasi</Button>
                <Button size="sm" variant="outline" onClick={()=>navigate('/komunitas')} className="bg-white/10 backdrop-blur hover:bg-white/20">Komunitas</Button>
                <Button size="sm" variant="outline" onClick={doRefresh} disabled={refreshing} className="gap-1 bg-white/10 hover:bg-white/20">{refreshing && <RefreshCw className="w-3 h-3 animate-spin"/>}{!refreshing && <RefreshCw className="w-3 h-3"/>} Refresh</Button>
              </div>

            </div>
            <div className="flex-1 min-w-[300px] bg-white/10 rounded-xl p-4 backdrop-blur">
              {locationLoading ? (
                <WeatherLoading variant="onDark" />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3 text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <CloudRain className="w-4 h-4"/> 
                      Cuaca (3 Hari)
                    </div>
                    {selectedAdm4 && (
                      <button
                        onClick={() => setSelectedAdm4('')}
                        className="text-[10px] text-emerald-200 hover:text-white transition-colors underline"
                      >
                        Reset ke IP
                      </button>
                    )}
                  </div>
                  <div className="h-64 overflow-auto pr-1 custom-scrollbar">
                    <WeatherForecast 
                      defaultAdm4={adm4} 
                      variant="onDark" 
                      onLocationChange={handleLocationChange}
                    />
                  </div>
                  <div className="mt-2 text-[10px] text-emerald-100 space-y-1">
                    {ipLocation.error ? (
                      <div>Default lokasi cuaca: Jakarta Pusat</div>
                    ) : selectedAdm4 ? (
                      // Lokasi dipilih manual dari pencarian
                      <>
                        <div className="font-medium">
                          🎯 {wilayahDetails.data?.kelurahan || 'Lokasi dipilih'}
                        </div>
                        <div className="text-emerald-200">
                          {wilayahDetails.data?.fullHierarchy || 'Memuat detail lokasi...'}
                        </div>
                      </>
                    ) : locationToAdm4.isIndonesia ? (
                      // Lokasi otomatis dari IP
                      <>
                        <div className="font-medium">
                          📍 {wilayahDetails.data?.kelurahan || locationToAdm4.locationDetail?.weatherLocation || 'Lokasi terdeteksi'}
                        </div>
                        <div className="text-emerald-200">
                          {wilayahDetails.data?.fullHierarchy || locationToAdm4.locationDetail?.fullHierarchy || `IP: ${ipLocation.city}, ${ipLocation.district}`}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-medium">🌍 Lokasi luar Indonesia</div>
                        <div className="text-emerald-200">
                          IP: {ipLocation.city}, {ipLocation.state} → Default: Jakarta Pusat
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          {/* AI Summary */}
          <div className="rounded-xl bg-white/10 backdrop-blur p-4 flex items-start gap-3 border border-white/20">
            <Sparkles className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed">
              <p className="font-semibold text-white mb-1">Ringkasan Hari Ini</p>
              <div className="text-emerald-50 text-xs whitespace-pre-line min-h-[48px]">
                {summary || (
                  <span className="flex items-start gap-2">
                    <div className="flex-1">
                      {locationLoading 
                        ? '🌍 Mencari kelurahan/desa terdekat berdasarkan lokasi IP untuk data cuaca yang akurat...' 
                        : loadingHarga 
                        ? '💰 Menganalisis pergerakan harga komoditas dari berbagai daerah...'
                        : weatherQuery.isLoading
                        ? '🌤️ Memuat prakiraan cuaca dari wilayah yang terdeteksi...'
                        : '🤖 AI sedang menganalisis kondisi terkini dan menyusun ringkasan yang informatif...'}
                    </div>
                    <LoadingDots />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-0 shadow-md hover:shadow-lg transition-all">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl w-fit mx-auto mb-2">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-emerald-700">{articles.length + trending.length}</p>
            <p className="text-xs text-emerald-600 font-medium">📚 Total Artikel</p>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100/50 border-0 shadow-md hover:shadow-lg transition-all">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl w-fit mx-auto mb-2">
              <Video className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-blue-700">{videos.length}</p>
            <p className="text-xs text-blue-600 font-medium">🎬 Video Edukasi</p>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100/50 border-0 shadow-md hover:shadow-lg transition-all">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl w-fit mx-auto mb-2">
              <Users className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-purple-700">{posts.length}</p>
            <p className="text-xs text-purple-600 font-medium">💬 Diskusi Aktif</p>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100/50 border-0 shadow-md hover:shadow-lg transition-all">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl w-fit mx-auto mb-2">
              <Package className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-orange-700">{harga.length}</p>
            <p className="text-xs text-orange-600 font-medium">📊 Komoditas</p>
          </Card>
        </div>
      </section>

      {/* Harga Komoditas Snapshot */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Package className="w-5 h-5 text-emerald-600"/> Harga Komoditas Hari Ini</h2>
          <Button variant="link" className="text-emerald-700" asChild><Link to="/data" className="flex items-center gap-1">Detail <ArrowRight className="w-4 h-4"/></Link></Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {loadingHarga && <div className="col-span-full text-sm text-slate-500 flex items-center gap-2"><LoadingDots />Memuat harga terbaru...</div>}
          {!loadingHarga && harga.slice(0,12).map(h => (
            <Card key={h.id} className="p-3 hover:shadow-md transition-all duration-300 border-0 shadow-sm bg-white group cursor-pointer" onClick={() => navigate('/data')}>
              <p className="text-[11px] font-medium text-slate-600 line-clamp-1 group-hover:text-emerald-600 transition-colors">{h.name}</p>
              <p className="text-sm font-bold mt-1 text-slate-800">Rp {h.today.toLocaleString('id-ID')}</p>
              <div className="flex items-center justify-between mt-1">
                <p className={`text-[10px] font-medium ${h.gap>0?'text-red-600':h.gap<0?'text-emerald-600':'text-slate-400'}`}>
                  {h.gap>0?'📈':'📉'} {h.gap>0?'+':''}{h.gap.toLocaleString('id-ID')}
                </p>
                <p className={`text-[9px] font-bold ${h.gap>0?'text-red-600':h.gap<0?'text-emerald-600':'text-slate-400'}`}>
                  ({h.gap_percentage.toFixed(1)}%)
                </p>
              </div>
            </Card>
          ))}
          {hargaError && <div className="col-span-full text-xs text-red-600 flex items-center gap-2">❌ Gagal memuat data harga</div>}
        </div>
      </section>

      {/* Video Edukasi */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-600"/>
            Video Edukasi Terbaru
          </h2>
          <Button variant="link" className="text-emerald-700" asChild>
            <Link to="/edukasi/video" className="flex items-center gap-1">
              Semua Video <ArrowRight className="w-4 h-4"/>
            </Link>
          </Button>
        </div>
        
        {loadingVideos && (
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <LoadingDots />
            Memuat video terbaru...
          </div>
        )}
        
        {!loadingVideos && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map(video => (
            <Card 
              key={video.id} 
              className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md"
              onClick={() => window.open(video.youtube_url, '_blank')}
            >
              <div className="relative">
                <img 
                  src={getVideoThumbnail(video)} 
                  alt={video.title}
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Play className="w-5 h-5 text-emerald-500 group-hover:text-white ml-0.5 transition-colors" />
                  </div>
                </div>
                <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs border-0 shadow-md">
                  <Video className="w-3 h-3 mr-1" />
                  Video
                </Badge>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black/70 text-white border-0 backdrop-blur-sm text-xs">
                    👁 {video.view_count.toLocaleString()}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight">
                  {video.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                  {video.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
                  <span className="font-medium">👨‍🌾 {video.author}</span>
                  <span>{fmtDate(video.created_at)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs">
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <Eye className="w-3 h-3" />
                      <span className="font-medium">{video.view_count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-red-500">
                      <Heart className="w-3 h-3" />
                      <span className="font-medium">{video.like_count || 0}</span>
                    </div>
                  </div>
                  
                  <Button size="sm" className="h-7 px-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-sm text-xs">
                    🎬 Tonton
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
        
        {!loadingVideos && videos.length === 0 && (
          <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100/50">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-2 text-gray-600">Belum Ada Video</h3>
            <p className="text-xs text-gray-500 mb-4">Video edukasi akan segera tersedia</p>
            <Button size="sm" variant="outline" asChild>
              <Link to="/edukasi">Lihat Konten Lainnya</Link>
            </Button>
          </Card>
        )}
      </section>

      {/* Artikel & Trending */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600"/> 
                Artikel Terbaru
              </h2>
              <Button variant="link" asChild className="text-emerald-700">
                <Link to="/edukasi" className="flex items-center gap-1">
                  Semua Artikel <ArrowRight className="w-4 h-4"/>
                </Link>
              </Button>
            </div>
            
            {loadingArticles && (
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <LoadingDots />
                Memuat artikel terbaru...
              </div>
            )}
            
            <div className="grid sm:grid-cols-2 gap-6">
              {articles.map(a => (
                <Card key={a.id} className="overflow-hidden group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300" onClick={()=>navigate(`/edukasi/artikel/${a.id}`)}>
                  <div className="relative">
                    <img src={firstImage(a)} alt={a.title} className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-all" />
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-md">
                      ✨ Baru
                    </Badge>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Badge variant="secondary" className="bg-white/90 text-emerald-700 border-0 backdrop-blur-sm text-xs">
                        👁 {a.view_count || 0}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 flex flex-col gap-3">
                    <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">{a.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{stripMarkdown(a.excerpt || a.content || '', 120)}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fmtDate(a.created_at)}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Heart className="w-3 h-3" />
                        {a.like_count||0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {!loadingArticles && articles.length === 0 && (
              <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100/50 border-0">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-2 text-gray-600">Belum Ada Artikel</h3>
                <p className="text-xs text-gray-500">Artikel edukasi akan segera tersedia</p>
              </Card>
            )}
          </div>
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-emerald-600"/> 
              🔥 Trending Hari Ini
            </h2>
            
            {loadingTrending && (
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <LoadingDots />
                Memuat konten trending...
              </div>
            )}
            
            <div className="space-y-3">
              {trending.map((t, index) => (
                <Card key={t.id} className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md group bg-white" onClick={()=>navigate(`/edukasi/artikel/${t.id}`)}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Badge className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700' :
                        index === 2 ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900' :
                        'bg-gradient-to-r from-emerald-400 to-emerald-500 text-emerald-900'
                      }`}>
                        {index + 1}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors leading-tight">{t.title}</h4>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {fmtDate(t.created_at)}
                        </span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {(t.view_count || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {!loadingTrending && trending.length === 0 && (
              <Card className="p-6 text-center bg-gradient-to-br from-gray-50 to-gray-100/50 border-0">
                <TrendingUp className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-2 text-gray-600">Belum Ada Trending</h3>
                <p className="text-xs text-gray-500">Konten trending akan muncul di sini</p>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Komunitas */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600"/> 
            💬 Diskusi Komunitas
          </h2>
          <Button variant="link" asChild className="text-emerald-700">
            <Link to="/komunitas" className="flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-4 h-4"/>
            </Link>
          </Button>
        </div>
        
        {loadingPosts && (
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <LoadingDots />
            Memuat diskusi terbaru...
          </div>
        )}
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(p => (
            <Card key={p.id} className="p-5 flex flex-col gap-3 hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md group bg-white" onClick={()=>navigate(`/komunitas/${p.id}/detail`)}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors leading-tight flex-1">
                  {p.title || p.content.slice(0,60)+'...'}
                </h3>
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-0 text-xs shrink-0">
                  Diskusi
                </Badge>
              </div>
              
              <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {p.content.replace(/[#*_`>/]/g,'').slice(0,120)}...
              </p>
              
              <div className="mt-auto pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    👤 {p.author}
                  </span>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {p.like_count || 0}
                    </span>
                    <span className="text-xs">
                      {fmtDate(p.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {!loadingPosts && !posts.length && (
          <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100/50 border-0">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-2 text-gray-600">Belum Ada Diskusi</h3>
            <p className="text-xs text-gray-500 mb-4">Jadilah yang pertama memulai diskusi!</p>
            <Button size="sm" variant="outline" asChild>
              <Link to="/komunitas">Mulai Diskusi</Link>
            </Button>
          </Card>
        )}
      </section>

      {/* Peta */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="rounded-2xl border bg-white p-3 shadow-sm">
          <InteractiveMap />
        </div>
      </section>

      {/* Chat Assistant */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        <ChatAssistant 
          locationName={wilayahDetails.data?.kelurahan || locationToAdm4.locationDetail?.weatherLocation}
          weatherCondition={weatherQuery.data?.days?.[0]?.items?.[0]?.weather_desc}
          topCommodity={harga.length > 0 ? harga.sort((a,b) => Math.abs(b.gap_percentage) - Math.abs(a.gap_percentage))[0]?.name : undefined}
        />
      </div>
    </div>
  );
};

export default Dashboard;