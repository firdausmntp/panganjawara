import { 
  Wheat,
  CloudRain,
  Users,
  Package,
  TrendingUp,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, Link } from 'react-router-dom';
import { useCommodityPrices } from '@/components/data/useCommodityPrices';
import WeatherForecast from '@/components/data/WeatherForecast';
import { useAutoWeatherAdm4 } from '@/components/data/useAutoWeatherAdm4';
import { useWeatherForecast } from '@/components/data/useWeatherForecast';
import { getUserIdentifier } from '@/lib/user';
import { stripMarkdown } from '../lib/text';
import ChatAssistant from "@/components/dashboard/ChatAssistant";
import InteractiveMap from "@/components/dashboard/InteractiveMap";

interface ArticleLite { id:number; title:string; created_at?:string; excerpt?:string; like_count?:number; view_count?:number; images?: { path:string }[]; content?: string; }
interface PostLite { id:number; title?:string; content:string; author:string; like_count?:number; created_at?:string; }

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: harga, loading: loadingHarga, error: hargaError } = useCommodityPrices(1);
  const [articles, setArticles] = useState<ArticleLite[]>([]);
  const [trending, setTrending] = useState<ArticleLite[]>([]);
  const [posts, setPosts] = useState<PostLite[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Auto lokasi untuk cuaca
  const auto = useAutoWeatherAdm4();
  const adm4 = auto.adm4 || '36.03.12.2001';
  const weatherQuery = useWeatherForecast(adm4);

  // AI summary state (derived)
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    // Bangun ringkasan setelah data tersedia
    if (loadingHarga || weatherQuery.isLoading) return;
    let parts: string[] = [];
    // Harga
    if (harga.length) {
      const sorted = [...harga].sort((a,b)=> Math.abs(b.gap_percentage) - Math.abs(a.gap_percentage));
      const top = sorted.slice(0,3);
      const movers = top.map(c => `${c.name} ${c.gap>0?'+':''}${c.gap_percentage.toFixed(1)}%`).join(', ');
      const naik = top.filter(c=>c.gap>0).length; const turun = top.filter(c=>c.gap<0).length;
      parts.push(`Pergerakan harga dominan: ${movers}. (${naik} naik / ${turun} turun)`);
    } else {
      parts.push('Data harga belum tersedia.');
    }
    // Cuaca
    const days = weatherQuery.data?.days || [];
    if (days.length) {
      const today = days[0];
      const temps = today.items.map(i=>i.t);
      const maxT = Math.max(...temps); const minT = Math.min(...temps);
      // pilih slot sekitar jam 12 atau fallback index tengah
      const midday = today.items.find(i=> i.local_datetime.slice(11,13)==='12') || today.items[Math.floor(today.items.length/2)];
      if (midday) {
        parts.push(`Cuaca siang: ${midday.weather_desc?.toLowerCase()} suhu ${midday.t}°C (rentang harian ${minT}–${maxT}°C).`);
      }
    } else if (weatherQuery.error) {
      parts.push('Data cuaca belum tersedia.');
    }
    setSummary(parts.join(' '));
  }, [harga, loadingHarga, weatherQuery.data, weatherQuery.isLoading, weatherQuery.error]);

  // Fetch helpers
  useEffect(()=> {
    let abort=false;
    (async()=>{
      try { setLoadingArticles(true); const r = await fetch('http://127.0.0.1:3000/pajar/public/articles/'); if(!r.ok) throw new Error(); const j= await r.json(); let list:any[] = Array.isArray(j)? j : (j.data||j.articles||[]); list = list.filter(a=>a.status==='published').slice(0,4); if(!abort) setArticles(list); } catch { if(!abort) setArticles([]);} finally { if(!abort) setLoadingArticles(false);} })();
    return ()=>{abort=true};
  },[]);
  useEffect(()=> {
    let abort=false;
    (async()=>{ try { setLoadingTrending(true); const r= await fetch('http://127.0.0.1:3000/pajar/public/articles/trending'); if(!r.ok) throw new Error(); const j= await r.json(); let list:any[] = j.articles || j.data || (Array.isArray(j)?j:[]); if(!abort) setTrending(list.slice(0,5)); } catch { if(!abort) setTrending([]);} finally { if(!abort) setLoadingTrending(false);} })();
    return ()=>{abort=true};
  },[]);
  useEffect(()=> {
    let abort=false;
    (async()=>{ 
      try { 
        setLoadingPosts(true); 
        const uid = getUserIdentifier();
        const r= await fetch(`http://127.0.0.1:3000/pajar/posts?user_id=${uid}&page=1&limit=6`); 
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

  const doRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        (async()=>{ const r = await fetch('http://127.0.0.1:3000/pajar/public/articles/'); if(r.ok){ const j= await r.json(); let list:any[] = Array.isArray(j)?j:(j.data||j.articles||[]); setArticles(list.filter(a=>a.status==='published').slice(0,4)); } })(),
        (async()=>{ const r = await fetch('http://127.0.0.1:3000/pajar/public/articles/trending'); if(r.ok){ const j= await r.json(); let list:any[] = j.articles || j.data || (Array.isArray(j)?j:[]); setTrending(list.slice(0,5)); } })(),
  (async()=>{ const uid = getUserIdentifier(); const r = await fetch(`http://127.0.0.1:3000/pajar/posts?user_id=${uid}&page=1&limit=6`); if(r.ok){ const j= await r.json(); let list:any[] = Array.isArray(j)? j : (j.posts || j.data?.posts || []); setPosts(list.slice(0,6)); } })()
      ]);
    } finally { setRefreshing(false); }
  };

  const fmtDate = (s?:string) => s ? new Date(s).toLocaleDateString('id-ID',{ day:'numeric', month:'short' }) : '';
  const firstImage = (a:any) => a?.images?.[0]?.path ? `http://127.0.0.1:3000${a.images[0].path}` : '/placeholder.svg';

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
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center lg:text-left">
                  <p className="text-xl font-semibold">{articles.length}</p>
                  <p className="text-[10px] uppercase tracking-wide text-emerald-100">Artikel</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-xl font-semibold">{posts.length}</p>
                  <p className="text-[10px] uppercase tracking-wide text-emerald-100">Posting</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-xl font-semibold">{harga.slice(0,50).length}</p>
                  <p className="text-[10px] uppercase tracking-wide text-emerald-100">Komoditas</p>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-[300px] bg-white/10 rounded-xl p-4 backdrop-blur">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold"><CloudRain className="w-4 h-4"/> Cuaca (3 Hari)</div>
              <div className="h-64 overflow-auto pr-1 custom-scrollbar">
                <WeatherForecast defaultAdm4={adm4} variant="onDark" />
              </div>
              <div className="mt-2 text-[10px] text-emerald-100">Lokasi otomatis: {auto.loading? 'mendeteksi...' : (auto.city || 'default')} • kode: {adm4}</div>
            </div>
          </div>
          {/* AI Summary */}
          <div className="rounded-xl bg-white/10 backdrop-blur p-4 flex items-start gap-3 border border-white/20">
            <Sparkles className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed">
              <p className="font-semibold text-white mb-1">Ringkasan Hari Ini</p>
              <p className="text-emerald-50 text-xs whitespace-pre-line min-h-[32px]">{summary || 'Menganalisis data...'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Harga Komoditas Snapshot */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Package className="w-5 h-5 text-emerald-600"/> Harga Komoditas</h2>
          <Button variant="link" className="text-emerald-700" asChild><Link to="/data" className="flex items-center gap-1">Detail <ArrowRight className="w-4 h-4"/></Link></Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {loadingHarga && <div className="col-span-full text-sm text-slate-500">Memuat...</div>}
          {!loadingHarga && harga.slice(0,12).map(h => (
            <Card key={h.id} className="p-3 hover:shadow-sm transition">
              <p className="text-[11px] font-medium text-slate-600 line-clamp-1">{h.name}</p>
              <p className="text-sm font-bold mt-1">Rp {h.today.toLocaleString('id-ID')}</p>
              <p className={`text-[10px] mt-0.5 ${h.gap>0?'text-red-600':h.gap<0?'text-emerald-600':'text-slate-400'}`}>{h.gap>0?'+':''}{h.gap.toLocaleString('id-ID')} ({h.gap_percentage.toFixed(2)}%)</p>
            </Card>
          ))}
          {hargaError && <div className="col-span-full text-xs text-red-600">Gagal memuat data harga</div>}
        </div>
      </section>

      {/* Artikel & Trending */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-600"/> Artikel Terbaru</h2><Button variant="link" asChild className="text-emerald-700"><Link to="/edukasi" className="flex items-center gap-1">Semua <ArrowRight className="w-4 h-4"/></Link></Button></div>
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
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1"><span>{fmtDate(a.created_at)}</span><span>👍 {a.like_count||0}</span></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-emerald-600"/> Trending</h2>
            {loadingTrending && <div className="text-sm text-slate-500">Memuat trending...</div>}
            <div className="space-y-4">
              {trending.map(t => (
                <Card key={t.id} className="p-4 hover:shadow-sm transition cursor-pointer" onClick={()=>navigate(`/edukasi/artikel/${t.id}`)}>
                  <h4 className="font-semibold text-sm line-clamp-2 mb-1">{t.title}</h4>
                  <div className="text-[11px] text-slate-400 flex justify-between"><span>{fmtDate(t.created_at)}</span><span>👁️ {t.view_count||0}</span></div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Komunitas */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-emerald-600"/> Komunitas</h2><Button variant="link" asChild className="text-emerald-700"><Link to="/komunitas" className="flex items-center gap-1">Lihat Semua <ArrowRight className="w-4 h-4"/></Link></Button></div>
  {loadingPosts && <div className="text-sm text-slate-500">Memuat posting...</div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(p => (
            <Card key={p.id} className="p-4 flex flex-col gap-2 hover:shadow-sm transition cursor-pointer" onClick={()=>navigate(`/komunitas/${p.id}/detail`)}>
              <h3 className="font-semibold text-sm line-clamp-2">{p.title || p.content.slice(0,60)+'...'}</h3>
              <p className="text-[12px] text-slate-500 line-clamp-3">{p.content.replace(/[#*_`>/]/g,'').slice(0,140)}...</p>
              <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400"><span>{p.author}</span><span>👍 {p.like_count||0}</span></div>
            </Card>
          ))}
        </div>
        {!loadingPosts && !posts.length && <div className="text-xs text-slate-500">Belum ada posting.</div>}
      </section>

      {/* Peta */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="rounded-2xl border bg-white p-3 shadow-sm">
          <InteractiveMap />
        </div>
      </section>

      {/* Chat Assistant */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        <ChatAssistant />
      </div>
    </div>
  );
};

export default Dashboard;