import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Video, Star, Eye, TrendingUp, ArrowRight, Loader2, PlayCircle, Calculator, Calendar, Droplets, TrendingUp as ROI, Users, Award, MessageCircle, Thermometer } from "lucide-react";
import { stripMarkdown } from '../lib/text';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG, buildApiUrl, buildImageUrl } from '../lib/api';
import { cn } from "@/lib/utils";

interface Article {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  created_at: string;
  updated_at?: string;
  published_at?: string;
  status: 'published' | 'draft' | 'archived';
  view_count: number;
  like_count?: number;
  shared_count?: number;
  image_count?: number;
  featured?: number;
  tags?: string;
  is_liked?: boolean;
  images?: {
    id: number;
    entity_type: string;
    entity_id: number;
    filename: string;
    original_name: string;
    mimetype: string;
    size: number;
    path: string;
    created_at: string;
  }[];
}

interface Video {
  id: number;
  title: string;
  description: string;
  author: string;
  youtube_url: string;
  thumbnail_url?: string;
  duration?: string;
  view_count: number;
  like_count?: number;
  status: 'published' | 'draft' | 'archived';
  featured?: boolean;
  tags?: string;
  created_at: string;
  updated_at?: string;
}

const EdukasiOverview = () => {
  const navigate = useNavigate();
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [topVideos, setTopVideos] = useState<Video[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch trending videos
  const fetchTrendingVideos = async () => {
    try {
      setVideosLoading(true);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PUBLIC.VIDEOS_TRENDING));
      if (!response.ok) {
        throw new Error('Failed to fetch trending videos');
      }
      const data = await response.json();
      
      let videos = [];
      if (Array.isArray(data)) {
        videos = data;
      } else if (data.data && Array.isArray(data.data)) {
        videos = data.data;
      } else if (data.videos && Array.isArray(data.videos)) {
        videos = data.videos;
      }
      
      setTopVideos(videos.slice(0, 3)); // Get top 3 trending videos
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      toast({
        title: "Error",
        description: "Gagal memuat video dari server.",
        variant: "destructive"
      });
      setTopVideos([]);
    } finally {
      setVideosLoading(false);
    }
  };

  // Tools & Calculators data
  const farmingTools = [
    {
      id: 1,
      title: "Kalkulator Pupuk",
      description: "Hitung dosis pupuk yang tepat berdasarkan jenis tanaman dan luas lahan",
      icon: Calculator,
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Jadwal Tanam",
      description: "Tentukan waktu tanam terbaik berdasarkan musim dan wilayah Anda",
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "Kalkulator Irigasi",
      description: "Hitung kebutuhan air untuk berbagai jenis tanaman",
      icon: Droplets,
      color: "bg-cyan-500",
    },
    {
      id: 4,
      title: "Prediksi Cuaca",
      description: "Analisis kondisi cuaca untuk perencanaan pertanian",
      icon: Thermometer,
      color: "bg-orange-500",
    }
  ];





  // Fetch recent articles
  const fetchRecentArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES));
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      
      let articles = [];
      if (Array.isArray(data)) {
        articles = data;
      } else if (data.data && Array.isArray(data.data)) {
        articles = data.data;
      } else if (data.articles && Array.isArray(data.articles)) {
        articles = data.articles;
      }
      
      const publishedArticles = articles.filter((article: Article) => article.status === 'published');
      setRecentArticles(publishedArticles.slice(0, 6)); // Get latest 6 articles
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Gagal memuat artikel dari server.",
        variant: "destructive"
      });
      setRecentArticles([]);
    }
  };

  // Fetch featured articles
  const fetchFeaturedArticles = async () => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES_TRENDING));
      if (!response.ok) {
        throw new Error('Failed to fetch trending articles');
      }
      const data = await response.json();
      
      let articles = [];
      if (data.articles && Array.isArray(data.articles)) {
        articles = data.articles;
      } else if (Array.isArray(data)) {
        articles = data;
      } else if (data.data && Array.isArray(data.data)) {
        articles = data.data;
      }
      
      setFeaturedArticles(articles.slice(0, 3)); // Get top 3 featured
    } catch (error) {
      console.error('Error fetching featured articles:', error);
      setFeaturedArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentArticles();
    fetchFeaturedArticles();
    fetchTrendingVideos();
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch('https://api.fsu.my.id/pajar/events/upcoming');
      const data = await response.json();
      setUpcomingEvents(data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setUpcomingEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  // Get article image URL
  const getArticleImage = (article: Article) => {
    if (article.images && article.images.length > 0) {
      return buildImageUrl(article.images[0].path);
    }
    return '/placeholder.svg';
  };

  // Get video thumbnail URL
  const getVideoThumbnail = (video: Video) => {
    if (video.thumbnail_url) {
      return video.thumbnail_url;
    }
    // Extract YouTube thumbnail from youtube_url
    if (video.youtube_url) {
      const videoId = extractYouTubeVideoId(video.youtube_url);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    return '/placeholder.svg';
  };

  // Extract YouTube video ID from URL
  const extractYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Get video category from tags
  const getVideoCategory = (tags?: string) => {
    if (!tags) return 'Edukasi';
    const tagArray = tags.split(',').map(tag => tag.trim());
    return tagArray[0] || 'Edukasi';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Edukasi Pangan Jawara
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Perluas wawasan tentang pertanian modern, inovasi teknologi pangan, serta strategi membangun ketahanan pangan.
          </p>
          
          {/* Quick Access Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => navigate('/edukasi/artikel')}
              className="flex items-center space-x-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>Jelajahi Artikel</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/edukasi/video')}
              className="flex items-center space-x-2"
            >
              <Video className="w-5 h-5" />
              <span>Tonton Video</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
            <h3 className="text-xl md:text-2xl font-bold text-foreground">{recentArticles.length}+</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Artikel Tersedia</p>
          </Card>
          <Card className="p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
            <Video className="w-6 h-6 md:w-8 md:h-8 text-secondary mx-auto mb-2" />
            <h3 className="text-xl md:text-2xl font-bold text-foreground">{topVideos.length}+</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Video Edukasi</p>
          </Card>
          <Card className="p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
            <Star className="w-6 h-6 md:w-8 md:h-8 text-accent mx-auto mb-2" />
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              {(recentArticles.reduce((total, article) => total + (article.like_count || 0), 0) + 
                topVideos.reduce((total, video) => total + (video.like_count || 0), 0)).toLocaleString()}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">Total Like</p>
          </Card>
          <Card className="p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-warning mx-auto mb-2" />
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              {(recentArticles.reduce((total, article) => total + article.view_count, 0) + 
                topVideos.reduce((total, video) => total + video.view_count, 0)).toLocaleString()}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">Total Views</p>
          </Card>
        </div>

        {/* Tools & Calculators Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Tools & Kalkulator Pertanian</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manfaatkan berbagai tools dan kalkulator untuk membantu dalam perencanaan dan analisis pertanian Anda
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {farmingTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Card key={tool.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform", tool.color)}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/edukasi/tools')}
            >
              Lihat Semua Tools <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>





        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Memuat konten...</span>
          </div>
        ) : (
          <>

            {/* Recent Articles Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Artikel Terbaru</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/edukasi/artikel')}
                  className="text-primary hover:text-primary/80"
                >
                  Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentArticles.slice(0, 6).map((article) => (
                  <Card 
                    key={article.id} 
                    className="group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/edukasi/artikel/${article.id}`)}
                  >
                    <div className="relative">
                      <img 
                        src={getArticleImage(article)} 
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {article.author.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{article.author}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(article.created_at)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {stripMarkdown(article.excerpt || article.content, 120)}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-muted-foreground text-sm">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{article.view_count.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <Button size="sm" variant="ghost">
                          Baca <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>


            {/* Top Videos Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Video Populer</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/edukasi/video')}
                  className="text-primary hover:text-primary/80"
                >
                  Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              {videosLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : topVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topVideos.map((video) => (
                    <Card key={video.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                          onClick={() => window.open(video.youtube_url, '_blank')}>
                      <div className="relative">
                        <img 
                          src={getVideoThumbnail(video)} 
                          alt={video.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white transition-all duration-300">
                            <PlayCircle className="w-6 h-6 text-primary ml-1" />
                          </div>
                        </div>
                        <Badge className="absolute top-3 left-3 bg-red-600">
                          <Video className="w-3 h-3 mr-1" />
                          Video
                        </Badge>
                      </div>
                      
                      <CardContent className="p-4">
                        <Badge variant="outline" className="text-xs mb-2">
                          {getVideoCategory(video.tags)}
                        </Badge>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {video.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {video.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{video.view_count.toLocaleString()}</span>
                            </div>
                            {video.like_count && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4" />
                                <span>{video.like_count}</span>
                              </div>
                            )}
                          </div>
                          
                          <Button size="sm" variant="ghost">
                            Tonton <PlayCircle className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center p-8">
                  <CardContent>
                    <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Belum ada video tersedia</p>
                    <p className="text-sm text-gray-400 mt-2">Video akan ditambahkan segera</p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Upcoming Events & Webinars Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Event & Webinar Mendatang</h2>
                <Button 
                  variant="ghost" 
                  className="text-primary hover:text-primary/80"
                >
                  Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              {eventsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-3"></div>
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="space-y-2 mb-4">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <Card key={event.id} className="group hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge className="bg-primary">{event.type || 'Event'}</Badge>
                          {event.is_free && <Badge variant="outline">Gratis</Badge>}
                        </div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {event.description || 'Deskripsi event akan segera tersedia'}
                        </p>
                        <div className="text-sm text-muted-foreground mb-4">
                          <div>📅 {formatDate(event.date || event.start_date)}</div>
                          {event.time && <div>🕒 {event.time}</div>}
                          {event.location && <div>📍 {event.location}</div>}
                        </div>
                        <Button size="sm" className="w-full">
                          Lihat Detail
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center p-8">
                  <CardContent>
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Belum ada event mendatang</p>
                    <p className="text-sm text-gray-400 mt-2">Event akan diumumkan segera</p>
                  </CardContent>
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default EdukasiOverview;
