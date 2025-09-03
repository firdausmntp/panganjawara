import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, Heart, Share2, Eye, ArrowLeft, Calendar, User, Clock, Loader2, Star, ChevronRight, ThumbsUp, Bookmark, X, MapPin, Users, Mail, Phone, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/lib/markdown";
import { API_CONFIG, buildApiUrl, buildImageUrl } from '../lib/api';

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

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  duration_minutes: number;
  location?: string;
  zoom_link?: string;
  zoom_meeting_id?: string;
  zoom_password?: string;
  max_participants?: number;
  status: string;
  priority: string;
  created_by: string;
  image_count: number;
  created_at: string;
  updated_at: string;
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

const ArtikelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>('Semua');
  const { toast } = useToast();

  // Reuse the unique user identifier logic from Komunitas
  const getUserIdentifier = () => {
    let identifier = localStorage.getItem('user_identifier');
    if (!identifier) {
      const browserInfo = `${navigator.userAgent}|${navigator.language}|${screen.width}x${screen.height}`;
      const timestamp = Date.now().toString(36);
      identifier = btoa(browserInfo + timestamp).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
      localStorage.setItem('user_identifier', identifier);
    }
    return identifier;
  };

  // Fetch article detail from API
  const fetchArticleDetail = async (articleId: string) => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES}/${articleId}`));
      if (!response.ok) {
        throw new Error('Failed to fetch article detail');
      }
      const data = await response.json();
      setArticle(data);
      
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Gagal memuat detail artikel dari server.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch related articles
  const fetchRelatedArticles = async () => {
    try {
      setLoadingRelated(true);
      
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES}?limit=10&status=published`));
      if (!response.ok) {
        throw new Error('Failed to fetch related articles');
      }
      const data = await response.json();
      
      
      // Handle different response structures
      let articles = [];
      if (Array.isArray(data)) {
        articles = data;
      } else if (data.data && Array.isArray(data.data)) {
        articles = data.data;
      } else if (data.articles && Array.isArray(data.articles)) {
        articles = data.articles;
      }
      
      // Filter out current article and get random selection
      const filteredArticles = articles.filter((art: Article) => art.id !== parseInt(id || '0'));
      const randomArticles = filteredArticles.sort(() => 0.5 - Math.random()).slice(0, 4);
      
      setRelatedArticles(randomArticles);
      
    } catch (error) {
      
    } finally {
      setLoadingRelated(false);
    }
  };

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.EVENTS.UPCOMING));
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      
      
      // Handle different response structures
      let eventsData = [];
      if (Array.isArray(data)) {
        eventsData = data;
      } else if (data.data && Array.isArray(data.data)) {
        eventsData = data.data;
      } else if (data.events && Array.isArray(data.events)) {
        eventsData = data.events;
      }
      
      
      setEvents(eventsData);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Gagal memuat data event dari server.",
        variant: "destructive"
      });
      // Set empty array on error
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchArticleDetail(id);
      fetchRelatedArticles();
      fetchEvents();
    }
  }, [id]);

  // Get article image URL
  const getArticleImage = (article: Article) => {
    if (article.images && article.images.length > 0) {
      return buildImageUrl(article.images[0].path);
    }
    return '/placeholder.svg';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format read time estimation
  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} menit baca`;
  };

  // Format event date
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Get event category based on title or description
  const getEventCategory = (event: Event) => {
    const text = (event.title + ' ' + event.description).toLowerCase();
    if (text.includes('workshop')) return 'Workshop';
    if (text.includes('bootcamp')) return 'Bootcamp';
    if (text.includes('seminar')) return 'Seminar';
    if (text.includes('pelatihan')) return 'Pelatihan';
    if (text.includes('webinar')) return 'Webinar';
    return 'Event';
  };

  // Check if event is online
  const isEventOnline = (event: Event) => {
    return !!event.zoom_link || !!event.zoom_meeting_id;
  };

  // Get event duration in readable format
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}j ${mins}m` : `${hours} jam`;
    }
    return `${mins} menit`;
  };

  // Handle event click
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Filter events based on category
  const filteredEvents = eventFilter === 'Semua' 
    ? events 
    : events.filter(event => getEventCategory(event) === eventFilter);

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setEventFilter(filter);
  };

  // Handle like article
  const handleLikeArticle = async () => {
    if (!article || likeLoading) return;

    try {
      setLikeLoading(true);
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES}/${article.id}/like`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_identifier: getUserIdentifier()
        })
      });
      
      if (response.ok) {
        let result: any = null;
        try {
          result = await response.json();
        } catch (_) {}

        setArticle(prev => {
          if (!prev) return null;
          const next: Article = { ...prev };
          if (result && typeof result.like_count === 'number') {
            next.like_count = result.like_count;
          } else {
            next.like_count = (prev.like_count || 0) + 1;
          }
          if (result && typeof result.liked === 'boolean') {
            next.is_liked = result.liked;
          }
          return next;
        });
        
        toast({
          title: "Berhasil!",
          description: "Artikel berhasil di-like"
        });
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Gagal memberikan like pada artikel",
        variant: "destructive"
      });
    } finally {
      setLikeLoading(false);
    }
  };

  // Handle share article
  const handleShareArticle = async () => {
    if (!article || shareLoading) return;

    try {
      setShareLoading(true);
      // Track share in API
      await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES}/${article.id}/share`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Copy link to clipboard
      const url = window.location.href;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Berhasil Disalin!",
          description: `Link artikel "${article.title}" telah disalin ke clipboard`
        });
      } else {
        toast({
          title: "Link Artikel",
          description: url
        });
      }

      // Update share count
      setArticle(prev => prev ? {
        ...prev,
        shared_count: (prev.shared_count || 0) + 1
      } : null);
    } catch (error) {
      
      const url = window.location.href;
      toast({
        title: "Link Artikel",
        description: url
      });
    } finally {
      setShareLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-16 md:pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Memuat Artikel</h3>
              <p className="text-muted-foreground">Sedang mengambil konten artikel...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-16 md:pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-orange-600 dark:text-orange-400" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
                Artikel Tidak Ditemukan
              </h1>
              
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Maaf, artikel yang Anda cari tidak dapat ditemukan atau mungkin telah dihapus.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/edukasi')}
                  size="lg"
                  className="w-full sm:w-auto px-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Edukasi
                </Button>
                
                <div className="text-xs text-muted-foreground pt-2">
                  atau coba refresh halaman ini
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-16 md:pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6 sm:mb-8 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50 shadow-sm gap-4 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm w-full sm:w-auto overflow-x-auto">
              <button 
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-primary transition-colors font-medium px-2 py-1 rounded-md hover:bg-primary/5 whitespace-nowrap"
              >
                Home
              </button>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground/50 flex-shrink-0" />
              <button 
                onClick={() => navigate('/edukasi')}
                className="text-muted-foreground hover:text-primary transition-colors font-medium px-2 py-1 rounded-md hover:bg-primary/5 whitespace-nowrap"
              >
                Edukasi
              </button>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground/50 flex-shrink-0" />
              <span className="text-foreground font-semibold bg-primary/10 px-2 sm:px-3 py-1 rounded-full truncate max-w-32 sm:max-w-xs lg:max-w-md">
                {article.title}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/edukasi')}
              className="text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all border-border/50 hover:border-primary/30 w-full sm:w-auto"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="sm:hidden">Kembali</span>
              <span className="hidden sm:inline">Kembali</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Main Article Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
              {/* Hero Image */}
              {article.images && article.images.length > 0 && (
                <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 overflow-hidden">
                  <img 
                    src={getArticleImage(article)} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  
                  {/* Featured Badge Overlay */}
                  {article.featured ? (
                    <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                      <Badge className="bg-yellow-500/95 text-yellow-900 backdrop-blur-sm border border-yellow-400/50 shadow-lg text-xs sm:text-sm">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        <span className="hidden sm:inline">Artikel Unggulan</span>
                        <span className="sm:hidden">Unggulan</span>
                      </Badge>
                    </div>
                  ) : null}

                  {/* Reading Stats Overlay */}
                  <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 bg-black/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-2 text-white text-xs sm:text-sm border border-white/20 shadow-lg">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {getReadTime(article.content)}
                  </div>
                </div>
              )}

              {/* Article Content */}
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
                {/* Featured Badge (if no image) */}
                {!article.images?.length && article.featured && (
                  <Badge className="mb-4 sm:mb-6 bg-yellow-500 text-yellow-900">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Artikel Unggulan
                  </Badge>
                )}

                {/* Title */}
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-6 sm:mb-8 leading-tight tracking-tight">
                  {article.title}
                </h1>

                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-muted-foreground mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-muted/30">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ring-2 ring-primary/20 shadow-sm">
                      <AvatarFallback className="text-xs sm:text-sm font-bold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                        {article.author.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-foreground">{article.author}</p>
                      <p className="text-xs text-muted-foreground">Content Writer</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {article.tags && (
                  <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                    {article.tags.split(',').map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105 cursor-pointer border-primary/30 hover:border-primary"
                      >
                        #{tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Enhanced Main Content with Better Markdown Styling */}
                <div className="prose prose-sm sm:prose-base lg:prose-lg prose-slate dark:prose-invert max-w-none mb-8 sm:mb-10">
                  <div className="article-content text-foreground leading-relaxed space-y-4 sm:space-y-6">
                    <MarkdownRenderer
                      content={article.content}
                      images={article.images}
                      className="
                        prose-headings:font-bold prose-headings:tracking-tight 
                        prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:mb-4 sm:prose-h1:mb-6 prose-h1:mt-6 sm:prose-h1:mt-8
                        prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mb-3 sm:prose-h2:mb-4 prose-h2:mt-4 sm:prose-h2:mt-6 
                        prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mb-2 sm:prose-h3:mb-3 prose-h3:mt-3 sm:prose-h3:mt-4
                        prose-p:text-sm sm:prose-p:text-base prose-p:leading-6 sm:prose-p:leading-7 prose-p:mb-3 sm:prose-p:mb-4
                        prose-ul:space-y-1 sm:prose-ul:space-y-2 prose-ol:space-y-1 sm:prose-ol:space-y-2 
                        prose-li:text-sm sm:prose-li:text-base prose-li:leading-5 sm:prose-li:leading-6
                        prose-strong:font-semibold prose-strong:text-foreground
                        prose-em:italic prose-em:text-muted-foreground
                        prose-blockquote:border-l-4 prose-blockquote:border-primary 
                        prose-blockquote:pl-4 sm:prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:my-4 sm:prose-blockquote:my-6
                        prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg
                        prose-code:bg-muted prose-code:px-1 sm:prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm
                        prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-3 sm:prose-pre:p-4 prose-pre:rounded-lg prose-pre:text-xs sm:prose-pre:text-sm
                        prose-img:rounded-lg prose-img:shadow-lg prose-img:mx-auto prose-img:max-w-full prose-img:h-auto
                      "
                    />
                  </div>
                </div>

                <Separator className="my-8 sm:my-10" />

                {/* Enhanced Action Buttons */}
                <div className="mb-8 sm:mb-10 p-4 sm:p-6 bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 rounded-xl sm:rounded-2xl border border-muted/30 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLikeArticle}
                        disabled={likeLoading}
                        className={`
                          hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200 flex-1 sm:flex-initial min-w-0
                          ${article.is_liked ? 'bg-red-50 text-red-600 border-red-300 shadow-sm' : ''}
                        `}
                      >
                        {likeLoading ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                        ) : (
                          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${article.is_liked ? 'fill-current' : ''}`} />
                        )}
                        <span className="font-medium text-xs sm:text-sm">Suka</span>
                        <span className="ml-1 font-semibold text-xs sm:text-sm">({article.like_count || 0})</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShareArticle}
                        disabled={shareLoading}
                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 flex-1 sm:flex-initial min-w-0"
                      >
                        {shareLoading ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                        ) : (
                          <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        )}
                        <span className="font-medium text-xs sm:text-sm">Bagikan</span>
                        <span className="ml-1 font-semibold text-xs sm:text-sm">({article.shared_count || 0})</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300 transition-all duration-200 flex-1 sm:flex-initial min-w-0"
                      >
                        <Bookmark className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="font-medium text-xs sm:text-sm">Simpan</span>
                      </Button>
                    </div>

                    <div className="flex items-center justify-center sm:justify-end gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-full">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-medium">Dilihat {article.view_count.toLocaleString()} kali</span>
                    </div>
                  </div>
                </div>

                {/* Back to Articles Button */}
                <div className="text-center">
                  <Button 
                    onClick={() => navigate('/edukasi')} 
                    size="lg" 
                    className="w-full sm:w-auto sm:min-w-48 shadow-lg"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Lihat Artikel Lainnya
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
              {/* Article Statistics Card */}
              <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-card to-card/95">
                <CardHeader className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 pb-3 sm:pb-4 border-b border-primary/10">
                  <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Statistik Artikel
                  </h3>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center">
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold">Views</span>
                      </div>
                      <span className="font-bold text-lg sm:text-xl text-blue-600 dark:text-blue-400">
                        {article.view_count.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 rounded-xl border border-red-200/30 dark:border-red-700/30">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-800/50 rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold">Likes</span>
                      </div>
                      <span className="font-bold text-lg sm:text-xl text-red-600 dark:text-red-400">
                        {article.like_count || 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200/30 dark:border-green-700/30">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center">
                          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold">Shares</span>
                      </div>
                      <span className="font-bold text-lg sm:text-xl text-green-600 dark:text-green-400">
                        {article.shared_count || 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl border border-purple-200/30 dark:border-purple-700/30">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-800/50 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold">Waktu Baca</span>
                      </div>
                      <span className="font-bold text-lg sm:text-xl text-purple-600 dark:text-purple-400">
                        {getReadTime(article.content).replace(' menit baca', 'm')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Author Info */}
              <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-card to-card/95">
                <CardContent className="p-6 sm:p-8">
                  <div className="text-center">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 ring-4 ring-primary/20 shadow-lg">
                      <AvatarFallback className="text-lg sm:text-2xl font-bold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                        {article.author.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg sm:text-xl mb-2">{article.author}</h3>
                    <p className="text-sm text-muted-foreground mb-3 sm:mb-4">Content Writer & Expert</p>
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                      ⭐ Kontributor Aktif
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Event Section */}
              <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                <CardHeader className="pb-3 sm:pb-4">
                  <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 text-orange-800 dark:text-orange-200">
                    🎯 Event Terbaru
                  </h3>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-2">
                  {loadingEvents ? (
                    <div className="flex items-center justify-center py-6 sm:py-8">
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-orange-600" />
                    </div>
                  ) : events.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {events.slice(0, 2).map((event) => {
                        const eventDate = formatEventDate(event.event_date);
                        const category = getEventCategory(event);
                        const isOnline = isEventOnline(event);
                        return (
                          <div 
                            key={event.id}
                            className="bg-white/70 dark:bg-orange-900/30 p-3 sm:p-4 rounded-xl border border-orange-200/50 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-xs sm:text-sm text-orange-900 dark:text-orange-100 line-clamp-2 flex-1 mr-2 leading-tight">
                                {event.title}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className="text-xs border-green-300 text-green-700 bg-green-50/50 shrink-0"
                              >
                                {category}
                              </Badge>
                            </div>
                            <p className="text-xs text-orange-700 dark:text-orange-200 mb-3 leading-relaxed line-clamp-2">
                              {event.description.replace(/{{image:\d+}}/g, '').replace(/\*\*/g, '')}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-orange-600 dark:text-orange-300">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{eventDate.date}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 flex-shrink-0" />
                                  <span>{eventDate.time}</span>
                                </span>
                              </div>
                              <div className="flex items-center justify-end">
                                {isOnline ? (
                                  <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50/50">
                                    Online
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 bg-purple-50/50">
                                    <MapPin className="w-2 h-2 mr-1" />
                                    Offline
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3 sm:mt-4 border-orange-300 text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-xs sm:text-sm"
                        onClick={() => setShowEventModal(true)}
                      >
                        Lihat Semua Event ({events.length})
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-200/50 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold mb-2 text-orange-900 dark:text-orange-100">
                        Belum ada event tersedia
                      </h4>
                      <p className="text-xs text-orange-700 dark:text-orange-200">
                        Event akan segera diupdate
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Related Articles Section */}
        <div className="mt-16 max-w-6xl mx-auto">
          <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 backdrop-blur-sm">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <BookOpen className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
                  📚 Artikel Lainnya
                </h3>
                <p className="text-muted-foreground mb-8 text-xl leading-relaxed max-w-3xl mx-auto">
                  Jelajahi koleksi artikel edukasi ketahanan pangan kami yang menarik dan informatif
                </p>
              </div>

              {/* Related Articles Grid */}
              {loadingRelated ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
                    <p className="text-muted-foreground text-lg">Memuat artikel lainnya...</p>
                  </div>
                </div>
              ) : relatedArticles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
                  {relatedArticles.map((relatedArticle) => (
                    <Card 
                      key={relatedArticle.id} 
                      className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] border-0 bg-gradient-to-br from-card to-card/90 backdrop-blur-sm overflow-hidden"
                      onClick={() => navigate(`/artikel/${relatedArticle.id}`)}
                    >
                      {relatedArticle.images && relatedArticle.images.length > 0 ? (
                        <div className="relative w-full h-48 sm:h-52 overflow-hidden">
                          <img 
                            src={buildImageUrl(relatedArticle.images[0].path)}
                            alt={relatedArticle.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          
                          {relatedArticle.featured && (
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-yellow-500/95 text-yellow-900 text-xs backdrop-blur-sm border border-yellow-400/50 shadow-lg">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Unggulan
                              </Badge>
                            </div>
                          )}

                          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs border border-white/20">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {getReadTime(relatedArticle.content)}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-48 sm:h-52 bg-gradient-to-br from-muted/40 to-muted/20 flex items-center justify-center border-b border-muted/20">
                          <BookOpen className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                      )}
                      
                      <CardContent className="p-6 sm:p-8">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-1 bg-blue-50/50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(relatedArticle.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-purple-50/50 dark:bg-purple-900/20 px-2 py-1 rounded-full">
                            <Eye className="w-3 h-3" />
                            <span>{relatedArticle.view_count}</span>
                          </div>
                        </div>
                        
                        <h4 className="font-bold text-xl mb-4 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                          {relatedArticle.title}
                        </h4>
                        
                        {relatedArticle.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
                            {relatedArticle.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                                {relatedArticle.author.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-medium text-foreground">{relatedArticle.author}</p>
                              <p className="text-xs text-muted-foreground">Content Writer</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-primary/30">
                              <Heart className="w-3 h-3 mr-1" />
                              {relatedArticle.like_count || 0}
                            </Badge>
                          </div>
                        </div>
                        
                        {relatedArticle.tags && (
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-muted/20">
                            {relatedArticle.tags.split(',').slice(0, 3).map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="text-xs px-3 py-1 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                              >
                                #{tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4 text-foreground">Belum ada artikel lain yang tersedia</h4>
                  <p className="text-muted-foreground mb-8">Kami sedang menyiapkan konten menarik lainnya untuk Anda</p>
                  <Button 
                    onClick={() => navigate('/edukasi')} 
                    size="lg"
                    className="min-w-48"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Kembali ke Edukasi
                  </Button>
                </div>
              )}

              {/* Enhanced Action Buttons */}
              {relatedArticles.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-muted/20">
                  <Button 
                    onClick={() => navigate('/edukasi')} 
                    size="lg"
                    className="min-w-48 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Jelajahi Semua Artikel
                  </Button>
                  <Button 
                    onClick={() => navigate('/komunitas')} 
                    variant="outline"
                    size="lg"
                    className="min-w-48 shadow-lg hover:shadow-xl transition-shadow duration-300 border-primary/30 hover:bg-primary/5"
                  >
                    💬 Gabung Diskusi
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              🎯 Event Ketahanan Pangan
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 mt-6">
            {selectedEvent ? (
              // Single Event Detail View
              <div className="space-y-6">
                {/* Event Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{selectedEvent.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <Badge className={`${getEventCategory(selectedEvent) === 'Workshop' ? 'bg-blue-500' : 
                          getEventCategory(selectedEvent) === 'Bootcamp' ? 'bg-purple-500' : 
                          getEventCategory(selectedEvent) === 'Seminar' ? 'bg-green-500' : 
                          getEventCategory(selectedEvent) === 'Pelatihan' ? 'bg-purple-500' :
                          getEventCategory(selectedEvent) === 'Webinar' ? 'bg-orange-500' : 'bg-cyan-500'}`}>
                          {getEventCategory(selectedEvent)}
                        </Badge>
                        <span className="text-xs sm:text-sm">Dibuat oleh: <strong>{selectedEvent.created_by}</strong></span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedEvent.description.replace(/{{image:\d+}}/g, '').replace(/\*\*/g, '')}
                  </p>
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date and Time */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Waktu & Tanggal
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Tanggal</p>
                          <p className="text-muted-foreground">{formatEventDate(selectedEvent.event_date).date}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Waktu</p>
                          <p className="text-muted-foreground">{formatEventDate(selectedEvent.event_date).time} WIB</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Durasi</p>
                          <p className="text-muted-foreground">{formatDuration(selectedEvent.duration_minutes)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location or Online Info */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        {isEventOnline(selectedEvent) ? (
                          <>
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            Online Event
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4 text-primary" />
                            Lokasi
                          </>
                        )}
                      </h4>
                      {isEventOnline(selectedEvent) ? (
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Event akan dilaksanakan secara online</p>
                          {selectedEvent.zoom_link && (
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedEvent.zoom_link!);
                                  toast({ title: "Link Zoom berhasil disalin!" });
                                }}
                                className="text-xs"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy Zoom Link
                              </Button>
                            </div>
                          )}
                          {selectedEvent.zoom_meeting_id && (
                            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm"><strong>Meeting ID:</strong> {selectedEvent.zoom_meeting_id}</p>
                              {selectedEvent.zoom_password && (
                                <p className="text-sm"><strong>Password:</strong> {selectedEvent.zoom_password}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-muted-foreground">{selectedEvent.location || 'Lokasi belum ditentukan'}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Event Status & Info */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Informasi Event
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Status</span>
                          <Badge className={selectedEvent.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {selectedEvent.status === 'published' ? 'Terbuka' : 'Draft'}
                          </Badge>
                        </div>
                        {selectedEvent.max_participants && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Kapasitas Maksimal</span>
                              <span className="font-medium">{selectedEvent.max_participants} orang</span>
                            </div>
                          </>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Dibuat pada</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(selectedEvent.created_at)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Images */}
                  {selectedEvent.images && selectedEvent.images.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Gambar Event</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedEvent.images.map((image) => (
                            <div key={image.id} className="relative">
                              <img 
                                src={buildImageUrl(image.path)}
                                alt={image.original_name}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Action Section */}
                {selectedEvent.zoom_link && (
                  <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-primary" />
                        Bergabung dengan Event
                      </h4>
                      <p className="text-muted-foreground mb-4">
                        Event ini dilaksanakan secara online. Gunakan link di bawah untuk bergabung.
                      </p>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => window.open(selectedEvent.zoom_link, '_blank')}
                          className="flex-1"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Buka Link Zoom
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedEvent.zoom_link!);
                            toast({ 
                              title: "Link berhasil disalin!",
                              description: "Link zoom telah disalin ke clipboard"
                            });
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Salin Link
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Back Button */}
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedEvent(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Daftar Event
                  </Button>
                </div>
              </div>
            ) : (
              // All Events List View
              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Menampilkan {filteredEvents.length} event tersedia</p>
                    <div className="flex gap-2 flex-wrap">
                      {['Semua', 'Workshop', 'Bootcamp', 'Seminar', 'Webinar', 'Event'].map((filter) => (
                        <Button 
                          key={filter}
                          variant={filter === eventFilter ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs"
                          onClick={() => handleFilterChange(filter)}
                        >
                          {filter}
                        </Button>
                      ))}
                    </div>
                  </div>                <div className="grid gap-4">
                  {filteredEvents.map((event) => {
                    const eventDate = formatEventDate(event.event_date);
                    const category = getEventCategory(event);
                    const isOnline = isEventOnline(event);
                    
                    return (
                      <Card 
                        key={event.id} 
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.01] border-l-4 border-l-primary"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge className={`text-xs ${category === 'Workshop' ? 'bg-blue-500' : 
                                  category === 'Bootcamp' ? 'bg-purple-500' : 
                                  category === 'Seminar' ? 'bg-green-500' :
                                  category === 'Webinar' ? 'bg-orange-500' : 'bg-cyan-500'}`}>
                                  {category}
                                </Badge>
                                <Badge className={event.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}>
                                  {event.status === 'published' ? 'Terbuka' : 'Draft'}
                                </Badge>
                              </div>
                              <h3 className="text-base sm:text-lg font-bold mb-2 line-clamp-2">{event.title}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                                Oleh: {event.created_by} • Durasi: {formatDuration(event.duration_minutes)}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
                            {event.description.replace(/{{image:\d+}}/g, '').replace(/\*\*/g, '')}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{eventDate.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{eventDate.time}</span>
                            </div>
                            {isOnline ? (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span>Online</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate max-w-32">{event.location}</span>
                              </div>
                            )}
                            {event.max_participants && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>Maks: {event.max_participants} orang</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {filteredEvents.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">Tidak ada event ditemukan</h4>
                    <p className="text-muted-foreground mb-4">
                      Tidak ada event dalam kategori "{eventFilter}" saat ini.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => handleFilterChange('Semua')}
                    >
                      Lihat Semua Event
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArtikelDetail;
