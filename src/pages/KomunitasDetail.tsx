import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Share2, Eye, Send, Loader2, X, Star, Plus, ZoomIn, ZoomOut, RotateCw, Download, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG, buildApiUrl, buildImageUrl } from '../lib/api';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorRole?: string;
  createdAt?: string; 
  created_at?: string; 
  updated_at?: string | null;
  view_count?: number;
  like_count?: number;
  share_count?: number;
  likes?: number; 
  comment_count?: number;
  shares?: number;
  shared_count?: number;
  tags?: string[];
  is_liked?: boolean;
  images?: Array<{
    id: number;
    entity_type: string;
    entity_id: number;
    filename: string;
    original_name: string;
    mimetype: string;
    size: number;
    path: string;
    created_at: string;
  }> | string[]; 
}

interface Comment {
  id: number;
  content: string;
  author: string;
  authorRole?: string;
  created_at: string;
  updated_at?: string | null;
  like_count?: number;
  is_liked?: boolean;
  images?: Array<{
    id: number;
    entity_type: string;
    entity_id: number;
    filename: string;
    original_name: string;
    mimetype: string;
    size: number;
    path: string;
    created_at: string;
  }> | string[];
}

const KomunitasDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentRole, setCommentRole] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [otherPosts, setOtherPosts] = useState<Post[]>([]);
  const [loadingOtherPosts, setLoadingOtherPosts] = useState(false);
  
  // Enhanced image modal state
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageRotation, setImageRotation] = useState(0);
  
  // Comment image upload state
  const [commentImages, setCommentImages] = useState<File[]>([]);
  const [commentImagePreviews, setCommentImagePreviews] = useState<string[]>([]);
  
  const { toast } = useToast();

  const getUserIdentifier = () => {
    let identifier = localStorage.getItem('user_identifier');
    if (!identifier) {
      const browserInfo = navigator.userAgent + navigator.language + screen.width + screen.height;
      const timestamp = Date.now();
      identifier = btoa(browserInfo + timestamp).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
      localStorage.setItem('user_identifier', identifier);
    }
    return identifier;
  };

  const fetchPost = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const userIdentifier = getUserIdentifier();
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS}/${id}?user_id=${userIdentifier}`));
      
      if (response.ok) {
        const postData = await response.json();
        setPost(postData);
        await fetchComments();
        await fetchOtherPosts(); // Fetch other posts after getting the current post
      } else {
        
        setPost(null);
      }
    } catch (error) {
      
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS}/${id}/comments`));
      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      }
    } catch (error) {
      
    }
  };

  const fetchOtherPosts = async () => {
    if (!id) return;
    
    try {
      setLoadingOtherPosts(true);
      
      
      // First try to get posts from the same endpoint used in the main community page
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS}?limit=10`));
      if (response.ok) {
        const postsData = await response.json();
        
        
        // Handle different response structures
        let posts = [];
        if (Array.isArray(postsData)) {
          posts = postsData;
        } else if (postsData.data && Array.isArray(postsData.data)) {
          posts = postsData.data;
        } else if (postsData.posts && Array.isArray(postsData.posts)) {
          posts = postsData.posts;
        }
        
        
        
        if (posts.length > 0) {
          // Filter out current post and get random selection
          const filteredPosts = posts.filter(p => p.id.toString() !== id.toString());
          
          
          // Show up to 4 other posts, shuffled for variety
          const shuffled = filteredPosts.sort(() => 0.5 - Math.random());
          const selectedPosts = shuffled.slice(0, 4);
          
          
          setOtherPosts(selectedPosts);
        } else {
          
          setOtherPosts([]);
        }
      } else {
        
        setOtherPosts([]);
      }
    } catch (error) {
      
      setOtherPosts([]);
    } finally {
      setLoadingOtherPosts(false);
    }
  };

  const handleLike = async () => {
    if (!post || !id || isLiking) return;
    
    try {
      setIsLiking(true);
      const userIdentifier = getUserIdentifier();
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS}/${id}/like`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userIdentifier })
      });

      if (response.ok) {
        const result = await response.json();
        setPost(prev => prev ? {
          ...prev,
          is_liked: result.liked,
          like_count: result.like_count
        } : null);
        
        toast({
          title: result.liked ? "Liked!" : "Unliked",
          description: result.liked ? "Anda menyukai postingan ini" : "Like dibatalkan",
        });
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Gagal memproses like",
        variant: "destructive"
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (!post || !id) return;
    
    try {
      const userIdentifier = getUserIdentifier();
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS}/${id}/share`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userIdentifier })
      });

      if (response.ok) {
        // Copy URL to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Link Dibagikan!",
            description: "Link postingan berhasil disalin ke clipboard",
          });
        }
        
        // Update share count
        setPost(prev => prev ? {
          ...prev,
          share_count: (prev.share_count || 0) + 1
        } : null);
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Gagal membagikan postingan",
        variant: "destructive"
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !commentAuthor.trim() || !id) {
      toast({
        title: "Lengkapi Data",
        description: "Harap isi nama dan komentar Anda",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCommenting(true);
      
      // Create FormData to support file uploads
      const formData = new FormData();
      formData.append('content', newComment.trim());
      formData.append('author', commentAuthor.trim());
      formData.append('authorRole', commentRole.trim() || 'Community Member');
      
      // Add images if any
      commentImages.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS}/${id}/comments`), {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setNewComment("");
        setCommentAuthor("");
        setCommentRole("");
        setCommentImages([]);
        setCommentImagePreviews([]);
        await fetchComments();
        
        // Update comment count
        setPost(prev => prev ? {
          ...prev,
          comment_count: (prev.comment_count || 0) + 1
        } : null);
        
        toast({
          title: "Berhasil",
          description: "Komentar berhasil ditambahkan",
        });
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Gagal menambahkan komentar",
        variant: "destructive"
      });
    } finally {
      setIsCommenting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getPostImages = (post: Post): string[] => {
    if (!post.images || post.images.length === 0) return [];
    
    if (typeof post.images[0] === 'object' && post.images[0] !== null && 'path' in post.images[0]) {
      return (post.images as Array<{path: string}>).map(img => buildImageUrl(img.path));
    }
    
    return post.images as string[];
  };

  const getCommentImages = (comment: Comment): string[] => {
    if (!comment.images || comment.images.length === 0) return [];
    
    if (typeof comment.images[0] === 'object' && comment.images[0] !== null && 'path' in comment.images[0]) {
      return (comment.images as Array<{path: string}>).map(img => buildImageUrl(img.path));
    }
    
    return comment.images as string[];
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-100 text-red-800', 'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800', 'bg-purple-100 text-purple-800', 'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800', 'bg-gray-100 text-gray-800'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Image modal controls
  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleResetImage = () => {
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
    setImageRotation(0);
  };

  const handleRotateImage = () => {
    setImageRotation(prev => (prev + 90) % 360);
  };

  const handleDownloadImage = () => {
    if (selectedImage) {
      const link = document.createElement('a');
      link.href = selectedImage;
      link.download = 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageZoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleImageMouseUp = () => {
    setIsDragging(false);
  };

  // Comment image handling
  const handleCommentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...commentImages, ...files].slice(0, 3); // Max 3 images
      setCommentImages(newImages);
      
      // Create previews
      const newPreviews = [...commentImagePreviews];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string);
            setCommentImagePreviews([...newPreviews].slice(0, 3));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeCommentImage = (index: number) => {
    setCommentImages(prev => prev.filter((_, i) => i !== index));
    setCommentImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  // Debug other posts state
  useEffect(() => {
    
  }, [otherPosts]);

  // Debug modal state
  useEffect(() => {
    
  }, [imageModalOpen, selectedImage]);

  // Handle mouse wheel zoom in image modal
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (imageModalOpen) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.2 : 0.2;
        setImageZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && imageModalOpen) {
        
        setImageModalOpen(false);
      }
    };

    if (imageModalOpen) {
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageModalOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-16 md:pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Memuat Postingan</h3>
              <p className="text-muted-foreground">Sedang mengambil detail postingan...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-16 md:pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
                Postingan Tidak Ditemukan
              </h1>
              
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Maaf, postingan yang Anda cari tidak dapat ditemukan atau mungkin telah dihapus.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/komunitas')}
                  size="lg"
                  className="w-full sm:w-auto px-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Komunitas
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
        {/* Header with Back Button */}
        <div className="mb-4 md:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/komunitas')}
              className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali ke Komunitas</span>
              <span className="sm:hidden">Kembali</span>
            </Button>
            
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Main Content */}
          <div className="col-span-1 lg:col-span-3 space-y-4 lg:space-y-6 order-1">

            {/* Post Detail Card */}
            <Card className="overflow-hidden shadow-lg lg:shadow-xl border-0 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 bg-gradient-to-r from-muted/30 to-muted/10">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <Avatar className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 ring-2 ring-primary/20">
                    <AvatarFallback className={`text-base sm:text-lg font-bold ${getAvatarColor(post.author)}`}>
                      {post.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg sm:text-xl text-foreground">
                          {post.author}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {post.authorRole || 'Community Member'}
                        </p>
                      </div>
                      {(post.like_count || 0) > 10 && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 ml-2 text-xs">
                          <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-1 fill-current" />
                          Popular
                        </Badge>
                      )}
                    </div>

                    {post.title && (
                      <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                        {post.title}
                      </CardTitle>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                {/* Post Content */}
                <div className="prose prose-sm sm:prose-lg max-w-none mb-4 sm:mb-6">
                  <p className="text-foreground text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className={`mb-6 grid gap-2 sm:gap-3 rounded-xl overflow-hidden ${
                    getPostImages(post).length === 1 
                      ? 'grid-cols-1' 
                      : getPostImages(post).length === 2 
                        ? 'grid-cols-1 sm:grid-cols-2' 
                        : getPostImages(post).length === 3 
                          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                          : getPostImages(post).length === 4 
                            ? 'grid-cols-2 sm:grid-cols-2' 
                            : 'grid-cols-2 sm:grid-cols-3'
                  }`}>
                    {getPostImages(post).map((image, imgIndex) => {
                      const handleImageClick = (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        setSelectedImage(image);
                        setImageZoom(1);
                        setImagePosition({ x: 0, y: 0 });
                        setImageRotation(0);
                        setImageModalOpen(true);
                        
                      };

                      return (
                        <div 
                          key={imgIndex} 
                          className="relative rounded-lg sm:rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                          onClick={handleImageClick}
                        >
                          <img
                            src={image}
                            alt={`Post image ${imgIndex + 1}`}
                            className={`w-full object-cover hover:scale-105 transition-transform duration-300 ${
                              getPostImages(post).length === 1 
                                ? 'h-64 sm:h-80 lg:h-96' 
                                : getPostImages(post).length === 2 
                                  ? 'h-48 sm:h-64 lg:h-72' 
                                  : 'h-40 sm:h-48 lg:h-56'
                            }`}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3">
                              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Post Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-all hover:scale-105">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-muted/10 to-muted/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-all ${
                        post.is_liked ? 'text-red-600 bg-red-50' : ''
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                      <span>{post.like_count || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-all"
                      onClick={() => document.getElementById('commentAuthor')?.focus()}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{comments.length}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="flex items-center gap-2 hover:bg-green-50 hover:text-green-600 transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{post.shared_count || 0}</span>
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(post.updated_at || post.created_at || post.createdAt || "")}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section - Now directly below the post */}
            <Card className="overflow-hidden shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/10 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <MessageCircle className="w-5 h-5" />
                  Komentar ({comments.length})
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6">
                {/* Add Comment Form */}
                <Card className="mb-6 bg-gradient-to-br from-muted/20 to-muted/5">
                  <CardContent className="p-4 sm:p-6">
                    <h4 className="font-semibold mb-4">Tambah Komentar</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="commentAuthor" className="text-sm">Nama Anda *</Label>
                          <Input
                            id="commentAuthor"
                            placeholder="Nama lengkap"
                            value={commentAuthor}
                            onChange={(e) => setCommentAuthor(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="commentRole" className="text-sm">Role (Opsional)</Label>
                          <Select value={commentRole} onValueChange={setCommentRole}>
                            <SelectTrigger id="commentRole" className="mt-1">
                              <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Petani">Petani</SelectItem>
                              <SelectItem value="Peternak">Peternak</SelectItem>
                              <SelectItem value="Nelayan">Nelayan</SelectItem>
                              <SelectItem value="Peneliti">Peneliti</SelectItem>
                              <SelectItem value="Dosen">Dosen</SelectItem>
                              <SelectItem value="Mahasiswa">Mahasiswa</SelectItem>
                              <SelectItem value="Developer">Developer</SelectItem>
                              <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="newComment" className="text-sm">Komentar Anda *</Label>
                        <Textarea
                          id="newComment"
                          placeholder="Bagikan pemikiran Anda tentang postingan ini..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[100px] resize-none mt-1"
                        />
                      </div>
                      
                      {/* Image Upload Section */}
                      <div>
                        <Label className="text-sm">Lampiran Gambar (Opsional)</Label>
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleCommentImageChange}
                            className="hidden"
                            id="comment-image-upload"
                          />
                          <div className="flex flex-wrap gap-3">
                            {/* Image Previews */}
                            {commentImagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeCommentImage(index)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            
                            {/* Add Image Button */}
                            {commentImages.length < 3 && (
                              <label
                                htmlFor="comment-image-upload"
                                className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                              >
                                <ImagePlus className="w-5 h-5 text-muted-foreground" />
                              </label>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Maksimal 3 gambar, ukuran per gambar maksimal 5MB
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleAddComment}
                          disabled={isCommenting || !newComment.trim() || !commentAuthor.trim()}
                          className="min-w-[120px]"
                        >
                          {isCommenting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Mengirim...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Kirim
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <Card key={comment.id} className="bg-gradient-to-br from-muted/10 to-muted/5 hover:from-muted/20 hover:to-muted/10 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex space-x-3">
                            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 ring-2 ring-muted/50">
                              <AvatarFallback className={`text-xs sm:text-sm font-semibold ${getAvatarColor(comment.author)}`}>
                                {comment.author.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="font-semibold text-sm sm:text-base text-foreground">
                                  {comment.author}
                                </h5>
                                {comment.authorRole && (
                                  <Badge variant="outline" className="text-xs px-2 py-1">
                                    {comment.authorRole}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-sm sm:text-base text-foreground break-words whitespace-pre-wrap leading-relaxed mb-2">
                                {comment.content}
                              </p>
                              
                              {/* Comment Images */}
                              {comment.images && comment.images.length > 0 && (
                                <div className={`grid gap-1 sm:gap-2 mb-2 ${
                                  getCommentImages(comment).length === 1 
                                    ? 'grid-cols-1 max-w-xs' 
                                    : getCommentImages(comment).length === 2 
                                      ? 'grid-cols-2 max-w-sm' 
                                      : 'grid-cols-2 sm:grid-cols-3 max-w-md'
                                }`}>
                                  {getCommentImages(comment).map((image, imgIndex) => {
                                    const handleCommentImageClick = (e: React.MouseEvent) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      
                                      setSelectedImage(image);
                                      setImageZoom(1);
                                      setImagePosition({ x: 0, y: 0 });
                                      setImageRotation(0);
                                      setImageModalOpen(true);
                                      
                                    };

                                    return (
                                      <div 
                                        key={imgIndex} 
                                        className="relative rounded-md overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-300"
                                        onClick={handleCommentImageClick}
                                      >
                                        <img
                                          src={image}
                                          alt={`Comment image ${imgIndex + 1}`}
                                          className="w-full h-16 sm:h-20 object-cover hover:scale-105 transition-transform duration-300"
                                          loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold mb-2">Belum Ada Komentar</h4>
                      <p className="text-muted-foreground text-sm mb-4">Jadilah yang pertama berkomentar tentang postingan ini!</p>
                      <Button variant="outline" size="sm" onClick={() => document.getElementById('commentAuthor')?.focus()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tulis Komentar Pertama
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-1 lg:col-span-1 space-y-4 lg:space-y-6 order-2">
            {/* Author Info */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4 ring-2 ring-primary/20">
                    <AvatarFallback className={`text-2xl font-bold ${getAvatarColor(post.author)}`}>
                      {post.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg mb-1">{post.author}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{post.authorRole || 'Community Member'}</p>
                  
                  {/* Author Statistics */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
                      <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                        1
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Postingan
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg">
                      <div className="text-xl font-bold text-green-700 dark:text-green-300">
                        {post.like_count || 0}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Total Likes
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Post Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Statistik Postingan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">Likes</span>
                    </div>
                    <span className="font-bold text-lg text-red-600 dark:text-red-400">{post.like_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Komentar</span>
                    </div>
                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{comments.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Dibagikan</span>
                    </div>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">{post.shared_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">Views</span>
                    </div>
                    <span className="font-bold text-lg text-purple-600 dark:text-purple-400">{(post.view_count || 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tingkat Interaksi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Engagement Rate</span>
                      <span className="font-semibold">
                        {((((post.like_count || 0) + comments.length + (post.share_count || 0)) / Math.max(post.view_count || 1, 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(((((post.like_count || 0) + comments.length + (post.share_count || 0)) / Math.max(post.view_count || 1, 1)) * 100), 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-sm font-semibold">{(((post.like_count || 0) / Math.max(post.view_count || 1, 1)) * 100).toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Like Rate</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-sm font-semibold">{((comments.length / Math.max(post.view_count || 1, 1)) * 100).toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Comment Rate</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-sm font-semibold">{(((post.share_count || 0) / Math.max(post.view_count || 1, 1)) * 100).toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Share Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Postingan Lainnya</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingOtherPosts ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Memuat postingan lain...</p>
                    </div>
                  ) : otherPosts.length > 0 ? (
                    <>
                      {otherPosts.map((otherPost) => (
                        <div 
                          key={otherPost.id}
                          className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                          onClick={() => navigate(`/komunitas/${otherPost.id}/detail`)}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback className={`text-xs font-semibold ${getAvatarColor(otherPost.author)}`}>
                                {otherPost.author.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                                {otherPost.title || otherPost.content.substring(0, 60) + (otherPost.content.length > 60 ? '...' : '')}
                              </h5>
                              <p className="text-xs text-muted-foreground mb-2">
                                {otherPost.author} • {formatDate(otherPost.created_at || otherPost.createdAt || "")}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {otherPost.like_count || otherPost.likes || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  {otherPost.comment_count || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {otherPost.view_count || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center pt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/komunitas')}
                          className="text-xs"
                        >
                          Lihat Semua Postingan
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-6">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="font-medium mb-1">Belum ada postingan lain tersedia</p>
                      <p className="text-xs mt-1 mb-3">
                        {post.tags && post.tags.length > 0 
                          ? `Postingan dengan tag ${post.tags.map(tag => `#${tag}`).join(', ')} akan muncul di sini`
                          : 'Postingan lain akan muncul di sini'
                        }
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          
                          fetchOtherPosts();
                        }}
                        className="text-xs"
                      >
                        Coba Lagi
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Image Modal */}
        {imageModalOpen && selectedImage && createPortal(
          <div 
            className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[99999]" 
            onClick={(e) => {
              e.stopPropagation();
              
              setImageModalOpen(false);
            }}
          >
            <div className="relative w-full h-full max-w-7xl flex items-center justify-center">
              {/* Image Container */}
              <div 
                className="relative overflow-hidden rounded-lg shadow-2xl cursor-grab active:cursor-grabbing bg-black/20"
                style={{ 
                  maxWidth: '95vw', 
                  maxHeight: '90vh',
                  minHeight: '200px'
                }}
                onMouseDown={handleImageMouseDown}
                onMouseMove={handleImageMouseMove}
                onMouseUp={handleImageMouseUp}
                onMouseLeave={handleImageMouseUp}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedImage}
                  alt="Full size image"
                  className="max-w-full max-h-full object-contain transition-all duration-300"
                  style={{ 
                    transform: `scale(${imageZoom}) rotate(${imageRotation}deg) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
                    transformOrigin: 'center center'
                  }}
                  onClick={(e) => e.stopPropagation()}
                  draggable={false}
                />
              </div>

              {/* Control Buttons */}
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomIn();
                  }}
                  variant="secondary"
                  size="sm"
                  className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 bg-black/50 hover:bg-black/70 border-0 text-white"
                  disabled={imageZoom >= 5}
                >
                  <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomOut();
                  }}
                  variant="secondary"
                  size="sm"
                  className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 bg-black/50 hover:bg-black/70 border-0 text-white"
                  disabled={imageZoom <= 0.5}
                >
                  <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRotateImage();
                  }}
                  variant="secondary"
                  size="sm"
                  className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 bg-black/50 hover:bg-black/70 border-0 text-white"
                >
                  <RotateCw className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadImage();
                  }}
                  variant="secondary"
                  size="sm"
                  className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 bg-black/50 hover:bg-black/70 border-0 text-white"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageModalOpen(false);
                  }}
                  variant="secondary"
                  size="sm"
                  className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 bg-red-500/50 hover:bg-red-500/70 border-0 text-white"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-4 bg-black/50 rounded-full px-3 py-1 sm:px-4 sm:py-2">
                <span className="text-white text-xs sm:text-sm">
                  Zoom: {Math.round(imageZoom * 100)}%
                </span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetImage();
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-6 sm:h-8 text-xs sm:text-sm px-2"
                >
                  Reset
                </Button>
              </div>

              {/* Instructions - Hidden on mobile for space */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 text-white text-xs sm:text-sm bg-black/50 rounded-lg px-2 py-1 sm:px-3 sm:py-2 hidden sm:block">
                <div className="space-y-1">
                  <div>Scroll: Zoom in/out</div>
                  <div>Drag: Move image (when zoomed)</div>
                  <div>Click outside: Close</div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default KomunitasDetail;
