import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Award, PlayCircle, Clock, TrendingUp, Video, Play, Star, Eye, Calendar, ArrowRight, Loader2, Search, Filter, Heart, Share2, Bookmark } from "lucide-react";
import { stripMarkdown } from '../lib/text';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
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

const Edukasi = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  // Unique identifier (same approach as in Komunitas)
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

  // Fetch articles from API
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES));
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
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
      } else {
        
        articles = [];
      }
      
      setArticles(articles.filter((article: Article) => article.status === 'published'));
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Gagal memuat artikel dari server.",
        variant: "destructive"
      });
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch featured (trending) articles from API
  const fetchFeaturedArticles = async () => {
    try {
      setFeaturedLoading(true);
      // Update to trending endpoint as source of featured content
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES_TRENDING));
      if (!response.ok) {
        throw new Error('Failed to fetch trending articles');
      }
      const data = await response.json();
      
      // Handle different response structures
      let articles = [];
      // Prefer `{ articles: [...] }` per new API
      if (data.articles && Array.isArray(data.articles)) {
        articles = data.articles;
      } else if (Array.isArray(data)) {
        articles = data;
      } else if (data.data && Array.isArray(data.data)) {
        articles = data.data;
      } else {
        
        articles = [];
      }
      
      setFeaturedArticles(articles);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Gagal memuat artikel trending dari server.",
        variant: "destructive"
      });
      setFeaturedArticles([]);
    } finally {
      setFeaturedLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchFeaturedArticles();
  }, []);

  // Filter articles based on search and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           (article.tags && article.tags.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

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

  // Handle like article
  const handleLikeArticle = async (articleId: number) => {
    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES}/${articleId}/like`), {
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
        try { result = await response.json(); } catch (_) {}
        // Update both articles and featured articles
        setArticles(prev => prev.map(article => {
          if (article.id !== articleId) return article;
          return {
            ...article,
            like_count: (result && typeof result.like_count === 'number')
              ? result.like_count
              : (article.like_count || 0) + 1,
            is_liked: (result && typeof result.liked === 'boolean') ? result.liked : article.is_liked
          };
        }));
        setFeaturedArticles(prev => prev.map(article => {
          if (article.id !== articleId) return article;
          return {
            ...article,
            like_count: (result && typeof result.like_count === 'number')
              ? result.like_count
              : (article.like_count || 0) + 1,
            is_liked: (result && typeof result.liked === 'boolean') ? result.liked : article.is_liked
          };
        }));
        
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
    }
  };

  // Handle share article
  const handleShareArticle = async (articleId: number, title: string) => {
    try {
      // Track share in API
      await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.PUBLIC.ARTICLES}/${articleId}/share`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Copy link to clipboard
      const url = `${window.location.origin}/edukasi/artikel/${articleId}`;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Berhasil Disalin!",
          description: `Link artikel "${title}" telah disalin ke clipboard`
        });
      } else {
        toast({
          title: "Link Artikel",
          description: url
        });
      }
    } catch (error) {
      
      const url = `${window.location.origin}/edukasi/artikel/${articleId}`;
      toast({
        title: "Link Artikel",
        description: url
      });
    }
  };

// Placeholder data untuk video edukasi
const videoEducation = [
    {
      id: 1,
      title: "Teknik Budidaya Padi Modern",
      category: "Tanaman Pangan",
      duration: "15:30",
      views: 1250,
      likes: 89,
      thumbnail: "/placeholder.svg",
      description: "Video tutorial lengkap cara menanam padi dengan teknologi modern untuk hasil maksimal",
      author: "Dr. Agus Pertanian",
      uploaded: "2024-01-15"
    },
    {
      id: 2,
      title: "Pengendalian Hama Terpadu",
      category: "Perlindungan Tanaman",
      duration: "22:15",
      views: 890,
      likes: 67,
      thumbnail: "/placeholder.svg",
      description: "Cara efektif mengendalikan hama tanaman secara terpadu dan ramah lingkungan",
      author: "Prof. Sari Tani",
      uploaded: "2024-01-10"
    },
    {
      id: 3,
      title: "Sistem Irigasi Hemat Air",
      category: "Teknologi Pertanian",
      duration: "18:45",
      views: 2100,
      likes: 156,
      thumbnail: "/placeholder.svg",
      description: "Implementasi sistem irigasi tetes dan sprinkler untuk menghemat air",
      author: "Ir. Budi Santoso",
      uploaded: "2024-01-08"
    },
    {
      id: 4,
      title: "Membaca Prakiraan Cuaca",
      category: "Manajemen Risiko",
      duration: "12:20",
      views: 3200,
      likes: 234,
      thumbnail: "/placeholder.svg",
      description: "Panduan praktis membaca dan menganalisis prakiraan cuaca untuk petani",
      author: "Dr. Ika Meteorologi",
      uploaded: "2024-01-05"
    },
    {
      id: 5,
      title: "Pemasaran Online Hasil Panen",
      category: "Bisnis Pertanian",
      duration: "25:10",
      views: 1560,
      likes: 112,
      thumbnail: "/placeholder.svg",
      description: "Strategi dan platform digital untuk memasarkan hasil pertanian",
      author: "Drs. Andi Market",
      uploaded: "2024-01-02"
    },
    {
      id: 6,
      title: "Pemupukan Organik vs Kimia",
      category: "Nutrisi Tanaman",
      duration: "20:35",
      views: 1890,
      likes: 145,
      thumbnail: "/placeholder.svg",
      description: "Perbandingan efektivitas dan dampak pupuk organik vs pupuk kimia",
      author: "Prof. Lestari Organik",
      uploaded: "2023-12-28"
    }
  ];



  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Edukasi Pangan Jawara
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Perluas wawasan tentang pertanian modern, inovasi teknologi pangan, serta strategi membangun ketahanan pangan melalui artikel mendalam dan program pembelajaran interaktif.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
            <h3 className="text-xl md:text-2xl font-bold text-foreground">{articles.length}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Artikel Tersedia</p>
          </Card>
          <Card className="p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
            <Video className="w-6 h-6 md:w-8 md:h-8 text-secondary mx-auto mb-2" />
            <h3 className="text-xl md:text-2xl font-bold text-foreground">{videoEducation.length}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Video Edukasi</p>
          </Card>
          <Card className="p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
            <Star className="w-6 h-6 md:w-8 md:h-8 text-accent mx-auto mb-2" />
            <h3 className="text-xl md:text-2xl font-bold text-foreground">{articles.reduce((total, article) => total + (article.like_count || 0), 0)}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Total Like</p>
          </Card>
          <Card className="p-4 md:p-6 text-center hover:shadow-lg transition-shadow">
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-warning mx-auto mb-2" />
            <h3 className="text-xl md:text-2xl font-bold text-foreground">{articles.reduce((total, article) => total + article.view_count, 0).toLocaleString()}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Total Pembaca</p>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Cari artikel, topik, atau penulis..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Pilih Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="teknologi">Teknologi</SelectItem>
              <SelectItem value="organik">Organik</SelectItem>
              <SelectItem value="iklim">Iklim</SelectItem>
              <SelectItem value="sustainable">Sustainable</SelectItem>
              <SelectItem value="smart-farming">Smart Farming</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="w-full md:w-auto mb-6">
            <TabsTrigger value="articles">Artikel Terbaru</TabsTrigger>
            <TabsTrigger value="videos">Video Edukasi</TabsTrigger>
            <TabsTrigger value="featured">Artikel Unggulan</TabsTrigger>
          </TabsList>

          <TabsContent value="articles">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                <span className="text-muted-foreground">Memuat artikel...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
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
                      {article.featured ? (
                        <Badge className="absolute top-3 left-3 bg-yellow-500">
                          <Star className="w-3 h-3 mr-1" />
                          Unggulan
                        </Badge>
                      ) : null}
                      <div className="absolute top-3 right-3 bg-black/50 rounded-full p-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleLikeArticle(article.id);
                          }}
                          className="text-white hover:text-red-400 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
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
                        {stripMarkdown(article.excerpt || article.content, 140)}
                      </p>
                      
                      {article.tags && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {article.tags.split(',').slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-muted-foreground text-sm">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{article.view_count.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{article.like_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share2 className="w-4 h-4" />
                            <span>{article.shared_count || 0}</span>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="group-hover:bg-primary group-hover:text-primary-foreground"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            navigate(`/edukasi/artikel/${article.id}`);
                          }}
                        >
                          Baca <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {!loading && filteredArticles.length === 0 && (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tidak Ada Artikel</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedCategory !== "all" 
                    ? "Tidak ditemukan artikel yang sesuai dengan pencarian Anda" 
                    : "Belum ada artikel yang tersedia"
                  }
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="videos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoEducation.map((video) => (
                <Card key={video.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white transition-all duration-300">
                        <Play className="w-6 h-6 text-primary ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-red-600">
                      <Video className="w-3 h-3 mr-1" />
                      {video.duration}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <Badge variant="outline" className="text-xs mb-2">
                      {video.category}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {video.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>By {video.author}</span>
                      <span>{new Date(video.uploaded).toLocaleDateString('id-ID')}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{video.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{video.likes}</span>
                        </div>
                      </div>
                      
                      <Button size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                        Tonton <PlayCircle className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="featured">
            {featuredLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                <span className="text-muted-foreground">Memuat artikel unggulan...</span>
              </div>
            ) : featuredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredArticles.map((article) => (
                  <Card 
                    key={article.id} 
                    className="group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/edukasi/artikel/${article.id}`)}
                  >
                    <div className="md:flex">
                      <div className="md:w-1/2 relative">
                        <img 
                          src={getArticleImage(article)} 
                          alt={article.title}
                          className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-3 left-3 bg-yellow-500">
                          <Star className="w-3 h-3 mr-1" />
                          Unggulan
                        </Badge>
                        <div className="absolute top-3 right-3 bg-black/50 rounded-full p-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              handleLikeArticle(article.id);
                            }}
                            className="text-white hover:text-red-400 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <CardContent className="md:w-1/2 p-6">
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
                        
                        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        
                        <p className="text-muted-foreground mb-4">
                          {stripMarkdown(article.excerpt || article.content, 160)}
                        </p>
                        
                        {article.tags && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {article.tags.split(',').slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-muted-foreground text-sm">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{article.view_count.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{article.like_count || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="w-4 h-4" />
                              <span>{article.shared_count || 0}</span>
                            </div>
                          </div>
                          
                          <Button 
                            className="group-hover:bg-primary group-hover:text-primary-foreground"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              navigate(`/edukasi/artikel/${article.id}`);
                            }}
                          >
                            Baca Selengkapnya
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tidak Ada Artikel Unggulan</h3>
                <p className="text-muted-foreground">
                  Belum ada artikel unggulan yang tersedia saat ini.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default Edukasi;