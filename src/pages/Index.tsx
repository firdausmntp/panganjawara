import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ArrowRight, Wheat, BookOpen, Users, CloudRain, TrendingUp, Package, Calendar, MapPin } from 'lucide-react';
import WeatherForecast from '@/components/data/WeatherForecast';
import WeatherMini from '@/components/data/WeatherMini';
import IndonesiaMap from '@/components/data/IndonesiaMap';
import { useAutoWeatherAdm4 } from '@/components/data/useAutoWeatherAdm4';
import { useWeatherForecast } from '@/components/data/useWeatherForecast';
import { getUserIdentifier } from '@/lib/user';
import { stripMarkdown } from '../lib/text';
import { Sparkles } from 'lucide-react';
import { useCommodityPrices } from '@/components/data/useCommodityPrices';
import { useProvinces } from '@/components/data/useProvinces';
import { useDistricts } from '@/components/data/useDistricts';
import { API_CONFIG, buildApiUrl, buildImageUrl } from '../lib/api';

interface ArticleLite { id: number; title: string; author?: string; created_at?: string; excerpt?: string; content?: string; view_count?: number; like_count?: number; images?: { path: string }[]; };
interface PostLite { id: number; title: string; content: string; author: string; created_at?: string; like_count?: number; view_count?: number; images?: any[]; };

const Index = () => {
  const navigate = useNavigate();
  // Harga (ambil top few)
  const { data: harga, loading: loadingHarga, error: hargaError } = useCommodityPrices(1);
  // Provinces for potential auto location (optional future)
  useProvinces(); // just warm cache
  useDistricts(undefined); // no-op but consistent pattern

  const [articles, setArticles] = useState<ArticleLite[]>([]);
  const [trending, setTrending] = useState<ArticleLite[]>([]);
  const [posts, setPosts] = useState<PostLite[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const auto = useAutoWeatherAdm4();
  const adm4 = auto.adm4 || '36.03.12.2001';
  const weatherQuery = useWeatherForecast(adm4);
  const [summary, setSummary] = useState('');

  useEffect(()=> {
    if (weatherQuery.isLoading || loadingHarga) return;
    const parts: string[] = [];
    if (harga.length) {
      const sorted = [...harga].sort((a,b)=> Math.abs(b.gap_percentage) - Math.abs(a.gap_percentage));
      const top = sorted.slice(0,2);
      const txt = top.map(c=> `${c.name} ${c.gap>0?'+':''}${c.gap_percentage.toFixed(1)}%`).join(', ');
      parts.push(`Pergerakan: ${txt}.`);
    }
    const days = weatherQuery.data?.days || [];
    if (days.length) {
      const today = days[0];
      const temps = today.items.map(i=>i.t);
      const maxT = Math.max(...temps); const minT = Math.min(...temps);
      parts.push(`Rentang suhu ${minT}–${maxT}°C.`);
    }
    setSummary(parts.join(' '));
  }, [weatherQuery.data, weatherQuery.isLoading, harga, loadingHarga]);

  // Fetch latest published articles
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoadingArticles(true);
        const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES));
        if (!res.ok) throw new Error('Status '+res.status);
        const json = await res.json();
        let list: any[] = Array.isArray(json) ? json : (json.data || json.articles || []);
        list = list.filter(a => a.status === 'published').slice(0,6);
        if (!abort) setArticles(list);
      } catch (e) {
        if (!abort) setArticles([]);
      } finally { if (!abort) setLoadingArticles(false); }
    })();
    return () => { abort = true; };
  }, []);

  // Fetch upcoming events
  useEffect(()=> {
    let abort=false;
    (async()=>{
      try { setLoadingEvents(true); const r= await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.EVENTS.UPCOMING)); if(!r.ok) throw new Error(); const j= await r.json(); let list:any[] = Array.isArray(j)? j : (j.events||j.data||[]); if(!abort) setEvents(list.slice(0,4)); }
      catch { if(!abort) setEvents([]);} finally { if(!abort) setLoadingEvents(false);} })();
    return ()=>{abort=true};
  },[]);

  // Fetch trending articles
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoadingTrending(true);
        const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES_TRENDING));
        if (!res.ok) throw new Error('Status '+res.status);
        const json = await res.json();
        let list: any[] = json.articles || json.data || (Array.isArray(json)?json:[]);
        list = list.slice(0,4);
        if (!abort) setTrending(list);
      } catch (e) {
        if (!abort) setTrending([]);
      } finally { if (!abort) setLoadingTrending(false); }
    })();
    return () => { abort = true; };
  }, []);

  // Fetch community posts (recent) - gunakan endpoint posts konsisten
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoadingPosts(true);
        const uid = getUserIdentifier();
        const res = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS}?user_id=${uid}&page=1&limit=6`));
        if (!res.ok) throw new Error('Status '+res.status);
        const json = await res.json();
        let list: any[] = Array.isArray(json) ? json : (json.posts || json.data?.posts || []);
        if (!abort) setPosts(list.slice(0,6));
      } catch (e) {
        if (!abort) setPosts([]);
      } finally { if (!abort) setLoadingPosts(false); }
    })();
    return () => { abort = true; };
  }, []);

  const formatDate = (s?: string) => s ? new Date(s).toLocaleDateString('id-ID', { day:'numeric', month:'short' }) : '';
  const firstImage = (a: any) => a?.images?.[0]?.path ? buildImageUrl(a.images[0].path) : '/placeholder.svg';

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Ketahanan Pangan
                </span>
                <br />
                <span className="text-slate-800">Terintegrasi</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Platform terdepan untuk monitoring harga komoditas real-time, edukasi pertanian berkelanjutan, dan membangun komunitas petani yang kuat di seluruh Indonesia.
              </p>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Button size="lg" onClick={()=>navigate('/data')} className="gap-3 px-8 py-4 text-base font-semibold">
                <Package className="w-5 h-5"/> Lihat Data Harga
              </Button>
              <Button size="lg" variant="secondary" onClick={()=>navigate('/edukasi')} className="gap-3 px-8 py-4 text-base font-semibold">
                <BookOpen className="w-5 h-5"/> Belajar & Edukasi
              </Button>
              <Button size="lg" variant="outline" onClick={()=>navigate('/komunitas')} className="gap-3 px-8 py-4 text-base font-semibold border-2">
                <Users className="w-5 h-5"/> Gabung Komunitas
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-6 text-center lg:text-left">
              <div className="bg-white/50 backdrop-blur rounded-2xl p-4 border border-white/20">
                <p className="text-3xl font-bold text-emerald-700">{articles.length}+</p>
                <p className="text-sm font-medium text-slate-600">Artikel Edukasi</p>
              </div>
              <div className="bg-white/50 backdrop-blur rounded-2xl p-4 border border-white/20">
                <p className="text-3xl font-bold text-emerald-700">{posts.length}+</p>
                <p className="text-sm font-medium text-slate-600">Diskusi Aktif</p>
              </div>
              <div className="bg-white/50 backdrop-blur rounded-2xl p-4 border border-white/20">
                <p className="text-3xl font-bold text-emerald-700">{harga.slice(0,10).length}+</p>
                <p className="text-sm font-medium text-slate-600">Data Komoditas</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full flex flex-col gap-6">
            <WeatherMini adm4={adm4} cityLabel={auto.loading? 'Mendeteksi lokasi...' : (auto.city || 'Lokasi Anda')} />
            <div className="hidden xl:block rounded-2xl border bg-white/80 backdrop-blur shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-emerald-600"/> 
                  Prakiraan Cuaca Detail
                </h3>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Live</span>
              </div>
              <div className="max-h-[360px] overflow-auto pr-2 custom-scrollbar">
                <WeatherForecast defaultAdm4={adm4} />
              </div>
              <div className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg p-2">
                📍 {auto.loading ? 'Mendeteksi lokasi...' : (auto.city || 'Lokasi default')} • Kode: {adm4}
              </div>
            </div>
          </div>
        </div>
        {/* AI Summary */}
        <div className="relative max-w-7xl mx-auto px-4 -mt-12">
          <div className="rounded-2xl border bg-white/90 backdrop-blur shadow-xl p-6 flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg text-slate-800 mb-2">💡 Insight Hari Ini</p>
              <p className="text-slate-600 leading-relaxed min-h-[32px]">{summary || 'Menganalisis data terkini untuk memberikan wawasan terbaik...'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Harga Ringkas */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                <Wheat className="w-6 h-6 text-white"/>
              </div>
              Harga Komoditas Terkini
            </h2>
            <p className="text-slate-600 mt-2">Pantau pergerakan harga komoditas utama secara real-time</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex border-2 border-amber-200 hover:bg-amber-50">
            <Link to="/data" className="flex items-center gap-2">
              Lihat Semua Data <ArrowRight className="w-4 h-4"/>
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loadingHarga && <div className="col-span-full text-center py-8 text-slate-500">Memuat data harga...</div>}
          {!loadingHarga && harga.slice(0,12).map(h => (
            <Card key={h.id} className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border-0 shadow-md">
              <p className="text-xs font-semibold text-slate-700 line-clamp-1 mb-2">{h.name}</p>
              <p className="text-lg font-bold text-slate-900 mb-1">Rp {h.today.toLocaleString('id-ID')}</p>
              <div className={`text-xs font-medium flex items-center gap-1 ${h.gap>0?'text-red-600':h.gap<0?'text-emerald-600':'text-slate-400'}`}>
                <span>{h.gap>0?'↗️':'↘️'}</span>
                <span>{h.gap>0?'+':''}{h.gap.toLocaleString('id-ID')} ({h.gap_percentage.toFixed(1)}%)</span>
              </div>
            </Card>
          ))}
          {hargaError && <div className="col-span-full text-center py-8 text-red-600">❌ Gagal memuat data harga</div>}
        </div>
        <div className="sm:hidden mt-6 text-center">
          <Button variant="outline" asChild className="border-2 border-amber-200 hover:bg-amber-50">
            <Link to="/data" className="flex items-center gap-2">
              Lihat Semua Data <ArrowRight className="w-4 h-4"/>
            </Link>
          </Button>
        </div>
      </section>

      {/* Artikel Terbaru & Trending */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-600"/> Artikel Terbaru</h2>
              <Button variant="link" asChild className="text-emerald-700"><Link to="/edukasi" className="flex items-center gap-1">Semua Artikel <ArrowRight className="w-4 h-4"/></Link></Button>
            </div>
            {loadingArticles && <div className="text-sm text-slate-500">Memuat artikel...</div>}
            <div className="grid sm:grid-cols-2 gap-6">
              {articles.map(a => (
                <Card key={a.id} className="overflow-hidden group cursor-pointer" onClick={()=>navigate(`/edukasi/artikel/${a.id}`)}>
                  <div className="relative">
                    <img src={firstImage(a)} alt={a.title} className="w-full h-40 object-cover group-hover:scale-105 transition" />
                    <Badge className="absolute top-2 left-2 bg-emerald-600">Baru</Badge>
                  </div>
                  <CardContent className="p-4 flex flex-col gap-2">
                    <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">{a.title}</h3>
                    <p className="text-[12px] text-slate-500 line-clamp-2">{stripMarkdown(a.excerpt || a.content || '', 110)}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{formatDate(a.created_at)}</span>
                      <span>👍 {a.like_count||0}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-600"/> Trending</h2>
            </div>
            {loadingTrending && <div className="text-sm text-slate-500">Memuat trending...</div>}
            <div className="space-y-4">
              {trending.map(t => (
                <Card key={t.id} className="p-4 hover:shadow-md transition cursor-pointer" onClick={()=>navigate(`/edukasi/artikel/${t.id}`)}>
                  <h4 className="font-semibold text-sm line-clamp-2 mb-1">{t.title}</h4>
                  <div className="text-[11px] text-slate-400 flex justify-between"><span>{formatDate(t.created_at)}</span><span>👁️ {t.view_count||0}</span></div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Komunitas Terbaru */}
  <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-emerald-600"/> Komunitas</h2>
          <Button variant="link" asChild className="text-emerald-700"><Link to="/komunitas" className="flex items-center gap-1">Lihat Komunitas <ArrowRight className="w-4 h-4"/></Link></Button>
        </div>
        {loadingPosts && <div className="text-sm text-slate-500">Memuat posting...</div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(p => (
            <Card key={p.id} className="p-4 flex flex-col gap-2 hover:shadow-md transition cursor-pointer" onClick={()=>navigate(`/komunitas/post/${p.id}`)}>
              <h3 className="font-semibold text-sm line-clamp-2">{p.title || p.content.slice(0,60)+'...'}</h3>
              <p className="text-[12px] text-slate-500 line-clamp-3">{p.content.replace(/[#*_`>/]/g,'').slice(0,140)}...</p>
              <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400">
                <span>{p.author}</span>
                <span>👍 {p.like_count||0}</span>
              </div>
            </Card>
          ))}
        </div>
        {!loadingPosts && !posts.length && <div className="text-xs text-slate-500">Belum ada posting.</div>}
      </section>

      {/* Event Section - Featured */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-3xl p-8 border border-blue-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-lg">
                  <Calendar className="w-6 h-6 text-white"/>
                </div>
                Event & Kegiatan Mendatang
              </h2>
              <p className="text-slate-600 mt-2">Bergabung dengan komunitas dalam berbagai kegiatan edukatif</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex border-2 border-blue-200 hover:bg-blue-50">
              <Link to="/komunitas" className="flex items-center gap-2">
                Semua Event <ArrowRight className="w-4 h-4"/>
              </Link>
            </Button>
          </div>
          {loadingEvents && <div className="text-center py-8 text-slate-500">Memuat event terbaru...</div>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map(ev => {
              const date = new Date(ev.event_date || ev.date || ev.created_at || Date.now());
              const dateStr = date.toLocaleDateString('id-ID',{ day:'numeric', month:'short', year:'numeric' });
              const dayStr = date.toLocaleDateString('id-ID',{ weekday:'long' });
              return (
                <Card key={ev.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-0 shadow-md" onClick={()=>navigate('/komunitas')}>
                  <div className="relative">
                    {ev.images?.[0]?.path ? (
                      <img src={buildImageUrl(ev.images[0].path)} alt={ev.title} className="w-full h-36 object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-36 bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-emerald-600 opacity-40" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-lg p-2 text-center shadow-lg">
                      <div className="text-xs font-medium text-slate-600">{dayStr.slice(0,3)}</div>
                      <div className="text-sm font-bold text-emerald-700">{dateStr.split(' ')[0]}</div>
                      <div className="text-xs text-slate-500">{dateStr.split(' ')[1]}</div>
                    </div>
                  </div>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <h3 className="font-bold text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug">{ev.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ev.description || 'Event menarik untuk komunitas pertanian'}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3"/>
                        {ev.location?.slice(0,20) || 'Online'}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">Gratis</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {!loadingEvents && !events.length && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">Belum ada event yang dijadwalkan</p>
              <Button variant="outline" onClick={()=>navigate('/komunitas')}>Cek Komunitas</Button>
            </div>
          )}
          <div className="sm:hidden mt-6 text-center">
            <Button variant="outline" asChild className="border-2 border-blue-200 hover:bg-blue-50">
              <Link to="/komunitas" className="flex items-center gap-2">
                Semua Event <ArrowRight className="w-4 h-4"/>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="max-w-7xl mx-auto px-4 mt-16 mb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                <MapPin className="w-6 h-6 text-white"/>
              </div>
              Peta Interaktif Indonesia
            </h2>
            <p className="text-slate-600 mt-2">Jelajahi data harga komoditas per provinsi secara visual</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex border-2 border-emerald-200 hover:bg-emerald-50">
            <Link to="/data" className="flex items-center gap-2">
              Lihat Detail Data <ArrowRight className="w-4 h-4"/>
            </Link>
          </Button>
        </div>
        <div className="rounded-3xl border-2 border-emerald-100 bg-white overflow-hidden shadow-xl">
          <IndonesiaMap className="!min-h-[320px] sm:!min-h-[420px] lg:!min-h-[520px] w-full" />
          <div className="p-4 bg-emerald-50 border-t border-emerald-100">
            <p className="text-sm text-emerald-700 text-center">
              💡 <strong>Tips:</strong> Klik pada provinsi untuk melihat data harga komoditas detail
            </p>
          </div>
        </div>
        <div className="sm:hidden mt-4 text-center">
          <Button variant="outline" asChild className="border-2 border-emerald-200 hover:bg-emerald-50">
            <Link to="/data" className="flex items-center gap-2">
              Lihat Detail Data <ArrowRight className="w-4 h-4"/>
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
