import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Eye, Heart, Share2, ArrowRight, Loader2, Search, Filter, Star } from "lucide-react";
import { stripMarkdown } from '../lib/text';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const EdukasiArtikel = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  // Unique identifier (same approach as in original Edukasi)
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
      console.error('Error fetching articles:', error);
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

  useEffect(() => {
    fetchArticles();
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
        // Update articles
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
        
        toast({
          title: "Berhasil!",
          description: "Artikel berhasil di-like"
        });
      }
    } catch (error) {
      console.error('Error liking article:', error);
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
      console.error('Error sharing article:', error);
      const url = `${window.location.origin}/edukasi/artikel/${articleId}`;
      toast({
        title: "Link Artikel",
        description: url
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Artikel Edukasi Pangan
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Kumpulan artikel terbaru dan mendalam tentang pertanian modern, teknologi pangan, dan strategi ketahanan pangan.
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <button 
            onClick={() => navigate('/edukasi')}
            className="hover:text-primary transition-colors"
          >
            Edukasi
          </button>
          <span>/</span>
          <span className="text-foreground">Artikel</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-bold text-foreground">{articles.length}</h3>
            <p className="text-sm text-muted-foreground">Total Artikel</p>
          </Card>
          <Card className="p-4 text-center">
            <Eye className="w-6 h-6 text-secondary mx-auto mb-2" />
            <h3 className="text-xl font-bold text-foreground">{articles.reduce((total, article) => total + article.view_count, 0).toLocaleString()}</h3>
            <p className="text-sm text-muted-foreground">Total Pembaca</p>
          </Card>
          <Card className="p-4 text-center">
            <Heart className="w-6 h-6 text-accent mx-auto mb-2" />
            <h3 className="text-xl font-bold text-foreground">{articles.reduce((total, article) => total + (article.like_count || 0), 0)}</h3>
            <p className="text-sm text-muted-foreground">Total Like</p>
          </Card>
          <Card className="p-4 text-center">
            <Share2 className="w-6 h-6 text-warning mx-auto mb-2" />
            <h3 className="text-xl font-bold text-foreground">{articles.reduce((total, article) => total + (article.shared_count || 0), 0)}</h3>
            <p className="text-sm text-muted-foreground">Total Share</p>
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

        {/* Articles Grid */}
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleShareArticle(article.id, article.title);
                        }}
                        className="flex items-center space-x-1 hover:text-primary transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{article.shared_count || 0}</span>
                      </button>
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
      </div>
    </div>
  );
};

export default EdukasiArtikel;
