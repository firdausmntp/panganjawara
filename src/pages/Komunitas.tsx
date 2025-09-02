import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Users, MessageSquare, Calendar, Award, Send, Heart, MessageCircle, Share2, Plus, User, Clock, TrendingUp, Loader2, ImagePlus, X, ArrowLeft, Eye, Minus, MapPin, Video, Search, Filter, Bookmark, Star, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { parseMarkdown } from "@/lib/markdown";

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
}

interface PopularContent {
  posts: Post[];
  articles: any[];
}

interface CommunityStats {
  totalPosts: number;
  totalMembers: number;
  activeToday: number;
  dailyDiscussions: number;
  totalViews: number;
}

interface Contributor {
  name: string;
  points: number;
  badge: string;
  category: string;
  posts: number;
  likes: number;
  comments: number;
}

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  duration_minutes: number;
  location: string;
  zoom_link?: string;
  zoom_meeting_id?: string;
  zoom_password?: string;
  max_participants: number;
  status: 'published' | 'draft' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_by: string;
  image_count: number;
  created_at: string;
  updated_at: string;
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
  }>;
}

const Komunitas = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [popularContent, setPopularContent] = useState<PopularContent>({
    posts: [],
    articles: []
  });
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [stats, setStats] = useState<CommunityStats>({
    totalPosts: 0,
    totalMembers: 0,
    activeToday: 0,
    dailyDiscussions: 0,
    totalViews: 0
  });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(true); 
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentRole, setCommentRole] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [postDetailLoading, setPostDetailLoading] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("feed");
  const [topContributors, setTopContributors] = useState<Contributor[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsPerPage] = useState(10);
  const [paginationLoading, setPaginationLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Filter posts based on search query and selected filter
  useEffect(() => {
    let filtered = posts;
    
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedFilter !== "all") {
      switch (selectedFilter) {
        case "popular":
          filtered = filtered.sort((a, b) => getPostLikes(b) - getPostLikes(a));
          break;
        case "recent":
          filtered = filtered.sort((a, b) => new Date(getPostDate(b)).getTime() - new Date(getPostDate(a)).getTime());
          break;
        case "trending":
          filtered = filtered.filter(post => getPostLikes(post) > 5 || getPostComments(post) > 3);
          break;
      }
    }
    
    setFilteredPosts(filtered);
  }, [posts, searchQuery, selectedFilter]);

  const getPostUrl = (postId: number) => {
    return `${window.location.origin}/komunitas/post/${postId}`;
  };


  const showSharePopup = (postId: number, postTitle: string) => {
    const postUrl = getPostUrl(postId);
    
  
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(postUrl).then(() => {
        toast({
          title: "Link Berhasil Disalin!",
          description: `Link postingan "${postTitle}" telah disalin ke clipboard`,
        });
      }).catch(() => {
      
        showManualCopyPopup(postUrl, postTitle);
      });
    } else {
    
      showManualCopyPopup(postUrl, postTitle);
    }
  };


  const showManualCopyPopup = (postUrl: string, postTitle: string) => {
  
    const tempInput = document.createElement('input');
    tempInput.value = postUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999);
    
    try {
      document.execCommand('copy');
      toast({
        title: "Link Berhasil Disalin!",
        description: `Link postingan "${postTitle}" telah disalin ke clipboard`,
      });
    } catch (err) {
      toast({
        title: "Bagikan Link Ini:",
        description: postUrl,
        duration: 10000,
      });
    }
    
    document.body.removeChild(tempInput);
  };


  const autoRefreshPosts = async () => {
    await fetchPosts();
    await fetchPopularContent();
  };


  // Generate random avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500 text-white',
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-yellow-500 text-black',
      'bg-purple-500 text-white',
      'bg-pink-500 text-white',
      'bg-indigo-500 text-white',
      'bg-orange-500 text-white',
      'bg-teal-500 text-white',
      'bg-cyan-500 text-white',
      'bg-lime-500 text-black',
      'bg-emerald-500 text-white',
      'bg-rose-500 text-white',
      'bg-violet-500 text-white',
      'bg-amber-500 text-black',
      'bg-red-600 text-white',
      'bg-blue-600 text-white',
      'bg-green-600 text-white',
      'bg-purple-600 text-white',
      'bg-pink-600 text-white',
      'bg-indigo-600 text-white',
      'bg-orange-600 text-white',
      'bg-teal-600 text-white',
      'bg-cyan-600 text-white',
      'bg-emerald-600 text-white',
      'bg-rose-600 text-white',
      'bg-violet-600 text-white',
      'bg-red-700 text-white',
      'bg-blue-700 text-white',
      'bg-green-700 text-white',
      'bg-purple-700 text-white',
      'bg-pink-700 text-white',
      'bg-indigo-700 text-white',
      'bg-orange-700 text-white',
      'bg-teal-700 text-white',
      'bg-cyan-700 text-white',
      'bg-emerald-700 text-white',
      'bg-rose-700 text-white',
      'bg-violet-700 text-white',
      'bg-red-800 text-white',
      'bg-blue-800 text-white',
      'bg-green-800 text-white',
      'bg-purple-800 text-white',
      'bg-pink-800 text-white',
      'bg-indigo-800 text-white',
      'bg-orange-800 text-white',
      'bg-teal-800 text-white',
      'bg-cyan-800 text-white',
      'bg-emerald-800 text-white',
      'bg-rose-800 text-white',
      'bg-violet-800 text-white',
      'bg-slate-600 text-white',
      'bg-gray-600 text-white',
      'bg-zinc-600 text-white',
      'bg-neutral-600 text-white',
      'bg-stone-600 text-white',
      'bg-fuchsia-600 text-white',
      'bg-sky-600 text-white'
    ];
    
    // Generate consistent color based on name hash
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };


  const calculateTopContributors = (postsData: Post[]): Contributor[] => {
    const contributorMap = new Map<string, {
      name: string;
      category: string;
      posts: number;
      likes: number;
      comments: number;
    }>();

  
    postsData.forEach(post => {
      const authorKey = post.author || 'Unknown';
      if (!contributorMap.has(authorKey)) {
        contributorMap.set(authorKey, {
          name: post.author || 'Unknown',
          category: post.authorRole || 'Community Member',
          posts: 0,
          likes: 0,
          comments: 0
        });
      }

      const contributor = contributorMap.get(authorKey)!;
      contributor.posts += 1;
      contributor.likes += getPostLikes(post);
      contributor.comments += post.comment_count || 0;
    });

  
    const contributors = Array.from(contributorMap.values()).map(contrib => {
      const points = (contrib.posts * 10) + (contrib.likes * 2) + (contrib.comments * 1);
      return {
        ...contrib,
        points
      };
    });

  
    const sortedContributors = contributors
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map((contributor, index) => ({
        ...contributor,
        badge: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`
      }));

    return sortedContributors;
  };


  const calculateBetterStats = (postsData: Post[]): CommunityStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - (6 * 24 * 60 * 60 * 1000));

  
    const postsToday = postsData.filter(post => {
      const postDate = new Date(post.created_at || post.createdAt || 0);
      return postDate >= today;
    }).length;

  
    const postsThisWeek = postsData.filter(post => {
      const postDate = new Date(post.created_at || post.createdAt || 0);
      return postDate >= thisWeek;
    }).length;

  
    const uniqueAuthors = new Set(postsData.map(post => post.author || 'Unknown')).size;

  
    const totalLikes = postsData.reduce((sum, post) => sum + (getPostLikes(post) || 0), 0);
    const totalComments = postsData.reduce((sum, post) => sum + (post.comment_count || 0), 0);
    const totalShares = postsData.reduce((sum, post) => sum + (post.shares || 0), 0);

    return {
      totalPosts: postsData.length,
      totalMembers: Math.max(uniqueAuthors, Math.floor(postsData.length * 1.8)),
      activeToday: Math.max(postsToday, Math.floor(postsData.length * 0.1)),
      dailyDiscussions: totalComments,
      totalViews: postsData.reduce((sum, post) => sum + (post.view_count || 0), 0)
    };
  };


  const handlePostClick = async (post: Post, openInModal: boolean = true) => {
    
    
    if (!openInModal) {
      // Navigate to detail page
      navigate(`/komunitas/${post.id}/detail`);
      return;
    }

    // Open in modal (existing behavior)
    setSelectedPost(post); // Set immediately to show modal
    setPostDetailLoading(true);
    setShowComments(true);
    
    // Fetch detailed post information
    await fetchPostDetail(post.id);
    setPostDetailLoading(false);
  };

  
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

  // Pagination handlers
  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    setCurrentPage(page);
    await fetchPosts(page, postsPerPage);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  
  const fetchPosts = async (page: number = 1, limit: number = postsPerPage) => {
    try {
      setLoading(page === 1);
      setPaginationLoading(page > 1);
      
      const userIdentifier = getUserIdentifier();
      const response = await fetch(`http://127.0.0.1:3000/pajar/posts?user_id=${userIdentifier}&page=${page}&limit=${limit}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle pagination response structure
        let postsData: Post[] = [];
        let paginationInfo: any = {};
        
        if (Array.isArray(data)) {
          // Old format - no pagination
          postsData = data;
        } else if (data.posts && Array.isArray(data.posts)) {
          // New format - with pagination
          postsData = data.posts;
          paginationInfo = {
            currentPage: data.currentPage || page,
            totalPages: data.totalPages || 1,
            totalPosts: data.totalPosts || data.total || postsData.length,
            hasNextPage: data.hasNextPage || false,
            hasPrevPage: data.hasPrevPage || false
          };
        }
        
        // Sort posts by date
        const sortedPosts = postsData.sort((a: Post, b: Post) => {
          const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
          const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
          return dateB - dateA; 
        });
        
        // Update posts based on page
        if (page === 1) {
          setPosts(sortedPosts);
        } else {
          // Append to existing posts for infinite scroll or replace for pagination
          setPosts(sortedPosts);
        }
        
        // Update pagination state
        if (paginationInfo.totalPages) {
          setCurrentPage(paginationInfo.currentPage);
          setTotalPages(paginationInfo.totalPages);
          setTotalPosts(paginationInfo.totalPosts);
        } else {
          // Fallback for old API format
          setTotalPosts(sortedPosts.length);
          setTotalPages(1);
          setCurrentPage(1);
        }
        
        // Update stats and contributors only for first page
        if (page === 1) {
          const calculatedStats = calculateBetterStats(sortedPosts);
          setStats(calculatedStats);
          
          const calculatedContributors = calculateTopContributors(sortedPosts);
          setTopContributors(calculatedContributors);
        }
      } else {
        
        const fallbackPosts = [
          {
            id: 1,
            title: "Tips Hidroponik untuk Pemula",
            content: "Panen perdana hidroponik sawi berhasil! 50kg dalam 1 bulan dari lahan 20m². Sharing tips untuk yang mau mulai.",
            author: "Ahmad Rizki",
            authorRole: "Petani",
            createdAt: "2024-08-31T10:00:00Z",
            likes: 23,
            comments: 8,
            shares: 5,
            tags: ["hidroponik", "tips"],
            images: ["http://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"]
          },
          {
            id: 2,
            title: "Pestisida Nabati dari Daun Mimba",
            content: "Hasil riset: pestisida nabati dari daun mimba meningkatkan produktivitas 30% dan lebih ramah lingkungan.",
            author: "Dr. Siti Nurhaliza",
            authorRole: "Peneliti",
            createdAt: "2024-08-31T07:00:00Z",
            likes: 45,
            comments: 12,
            shares: 18,
            tags: ["riset", "organik"]
          },
          {
            id: 3,
            title: "IoT untuk Monitoring Tanah",
            content: "Aplikasi monitoring tanah berbasis IoT selesai beta testing! Butuh 10 petani untuk trial gratis 3 bulan.",
            author: "Budi Santoso",
            authorRole: "Developer",
            createdAt: "2024-08-30T15:30:00Z",
            likes: 67,
            comments: 15,
            shares: 12,
            tags: ["teknologi", "iot"]
          }
        ];
        
        setPosts(fallbackPosts);
        
      
        const calculatedStats = calculateBetterStats(fallbackPosts);
        setStats(calculatedStats);
        
        const calculatedContributors = calculateTopContributors(fallbackPosts);
        setTopContributors(calculatedContributors);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data komunitas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  
  const fetchPostDetail = async (postId: number) => {
    try {
      const userIdentifier = getUserIdentifier();
      const response = await fetch(`http://127.0.0.1:3000/pajar/posts/${postId}?user_id=${userIdentifier}`);
      if (response.ok) {
        const postDetail = await response.json();
        
        setSelectedPost(postDetail);
        
        await fetchPostComments(postId);
      } else {
        
        // Fallback to existing post data if API fails
        const post = posts.find(p => p.id === postId);
        if (post) {
          
          setSelectedPost(post);
          await fetchPostComments(postId);
        }
      }
    } catch (error) {
      console.error('Error fetching post detail:', error);
      // Fallback to existing post data
      const post = posts.find(p => p.id === postId);
      if (post) {
        
        setSelectedPost(post);
        await fetchPostComments(postId);
      }
    }
  };

  
  const fetchPopularContent = async () => {
    try {
      setTrendingLoading(true);
      const userIdentifier = getUserIdentifier();
      const response = await fetch(`http://127.0.0.1:3000/pajar/stats/popular/all?user_id=${userIdentifier}`);
      if (response.ok) {
        const result = await response.json();
        if (result.message === "Popular content retrieved successfully" && result.data) {
          setPopularContent(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching popular content:', error);
      toast({
        title: "Error",
        description: "Gagal memuat konten trending",
        variant: "destructive"
      });
    } finally {
      setTrendingLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/pajar/events/upcoming');
      if (response.ok) {
        const events = await response.json();
        setUpcomingEvents(events);
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    }
  };

  
  const handlePost = async () => {
    if (!postTitle.trim() || !postContent.trim() || !authorName.trim()) {
      toast({
        title: "Lengkapi Data",
        description: "Harap isi semua field yang diperlukan",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsPosting(true);
      
      
      const formData = new FormData();
      formData.append('title', postTitle.trim());
      formData.append('content', postContent.trim());
      formData.append('author', authorName.trim());
      
      
      if (authorRole.trim()) {
        formData.append('authorRole', authorRole.trim());
      }
      
      
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      const response = await fetch('http://127.0.0.1:3000/pajar/posts', {
        method: 'POST',
        body: formData 
      });

      if (response.ok) {
        toast({
          title: "Berhasil!",
          description: "Postingan Anda telah dipublikasikan"
        });
        
        
        setPostTitle("");
        setPostContent("");
        setAuthorName("");
        setAuthorRole("");
        setSelectedImages([]);
        setImagePreviews([]);
        
        
        const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        
        
        await fetchPosts();
      } else {
        throw new Error('Failed to post');
      }
    } catch (error) {
      console.error('Error posting:', error);
      toast({
        title: "Error",
        description: "Gagal mempublikasikan postingan",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    
    if (selectedImages.length + files.length > 4) {
      toast({
        title: "Batas Upload",
        description: "Maksimal 4 gambar per postingan",
        variant: "destructive"
      });
      return;
    }

    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Format File Tidak Valid",
        description: "Hanya file JPG, PNG, dan GIF yang diperbolehkan",
        variant: "destructive"
      });
      return;
    }

    
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File Terlalu Besar",
        description: "Maksimal ukuran file 5MB per gambar",
        variant: "destructive"
      });
      return;
    }

    
    setSelectedImages(prev => [...prev, ...files]);

    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Tanggal tidak tersedia";
    
    try {
      const date = new Date(dateString);
      
      
      if (isNaN(date.getTime())) {
        return "Tanggal tidak valid";
      }
      
      const now = new Date();
      const diffInMilliseconds = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
      const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
      
      
      if (diffInMinutes < 1) return "Baru saja";
      if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
      if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
      if (diffInDays === 1) return "1 hari yang lalu";
      return `${diffInDays} hari yang lalu`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Tanggal tidak valid";
    }
  };

  
  const getPostDate = (post: Post) => {
    return post.created_at || post.createdAt || "";
  };

  
  const getPostImages = (post: Post): string[] => {
    if (!post.images || post.images.length === 0) return [];
    
    
    if (typeof post.images[0] === 'object' && post.images[0] !== null && 'path' in post.images[0]) {
      return (post.images as Array<{path: string}>).map(img => `http://127.0.0.1:3000${img.path}`);
    }
    
    
    return post.images as string[];
  };

  
  const getPostLikes = (post: Post) => {
    return post.like_count ?? post.likes ?? 0;
  };

  const getPostComments = (post: Post) => {
    const count = post.comment_count ?? 0;
    return count;
  };

  const getPostShared = (post: Post) => {
    const count = post.share_count ?? post.shares ?? post.shared_count ?? 0;
    return count;
  };

  const handleLikePost = async (postId: number) => {
    try {
      const userIdentifier = getUserIdentifier();
      const response = await fetch(`http://127.0.0.1:3000/pajar/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_identifier: userIdentifier
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  is_liked: result.liked, 
                  like_count: result.like_count || post.like_count || 0 
                }
              : post
          )
        );
        
        
        setPopularContent(prev => ({
          ...prev,
          posts: prev.posts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  is_liked: result.liked,
                  like_count: result.like_count || post.like_count || 0
                }
              : post
          )
        }));

        // Update selectedPost if it's the current post
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(prev => prev ? {
            ...prev,
            is_liked: result.liked,
            like_count: result.like_count || prev.like_count || 0
          } : prev);
        }
        
        
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(prev => prev ? {
            ...prev,
            is_liked: result.liked,
            like_count: result.like_count || prev.like_count || 0
          } : null);
        }
        
      
        toast({
          title: result.liked ? "Liked!" : "Unliked!",
          description: result.message || `Post ${result.liked ? 'liked' : 'unliked'} successfully`
        });

      
        setTimeout(() => {
          autoRefreshPosts();
        }, 1000);
      } else {
        throw new Error('Failed to update like');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    }
  };

  
  const handleLikeArticle = async (articleId: number) => {
    try {
      const userIdentifier = getUserIdentifier();
      const response = await fetch(`http://localhost:3000/pajar/articles/${articleId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_identifier: userIdentifier
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        
        setPopularContent(prev => ({
          ...prev,
          articles: prev.articles.map(article => 
            (article.id || prev.articles.indexOf(article)) === articleId
              ? {
                  ...article,
                  is_liked: result.liked,
                  like_count: result.like_count || article.like_count || 0
                }
              : article
          )
        }));
        
        toast({
          title: result.liked ? "Liked!" : "Unliked!",
          description: result.message || `Article ${result.liked ? 'liked' : 'unliked'} successfully`
        });
      } else {
        throw new Error('Failed to update article like');
      }
    } catch (error) {
      console.error('Error updating article like:', error);
      toast({
        title: "Error",
        description: "Failed to update article like status",
        variant: "destructive"
      });
    }
  };

  const handleLikeComment = async (commentId: number) => {
    try {
      const userIdentifier = getUserIdentifier();
      const response = await fetch(`http://127.0.0.1:3000/pajar/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_identifier: userIdentifier
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the comment in the comments list
        setPostComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  is_liked: result.liked,
                  like_count: result.like_count || comment.like_count || 0
                }
              : comment
          )
        );
        
        toast({
          title: result.liked ? "Liked!" : "Unliked!",
          description: result.message || `Comment ${result.liked ? 'liked' : 'unliked'} successfully`
        });
      } else {
        throw new Error('Failed to update comment like');
      }
    } catch (error) {
      console.error('Error updating comment like:', error);
      toast({
        title: "Error",
        description: "Failed to update comment like status",
        variant: "destructive"
      });
    }
  };


  const handleSharePost = async (postId: number) => {
    try {
      const userIdentifier = getUserIdentifier();
      
    
      const post = posts.find(p => p.id === postId) || selectedPost;
      const postTitle = post?.title || "Post Komunitas";
      
      const response = await fetch(`http://127.0.0.1:3000/pajar/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_identifier: userIdentifier
        })
      });

      if (response.ok) {
        const result = await response.json();
        
      
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  shares: result.share_count || (post.shares || 0) + 1
                }
              : post
          )
        );
        
      
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(prev => prev ? {
            ...prev,
            shares: result.share_count || (prev.shares || 0) + 1
          } : null);
        }
        
      
        showSharePopup(postId, postTitle);
        
      
        setTimeout(() => {
          autoRefreshPosts();
        }, 1500);
      } else {
        throw new Error('Failed to share post');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive"
      });
    }
  };

  
  const fetchPostComments = async (postId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/pajar/posts/${postId}/comments`);
      if (response.ok) {
        const comments = await response.json();
        setPostComments(comments || []);
      } else {
        setPostComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setPostComments([]);
    }
  };

  
  const handleAddComment = async (postId: number) => {
    if (!newComment.trim() || !commentAuthor.trim()) {
      toast({
        title: "Lengkapi Data",
        description: "Harap isi nama dan komentar Anda",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCommenting(true);
      
      const response = await fetch(`http://127.0.0.1:3000/pajar/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment.trim(),
          author: commentAuthor.trim(),
          authorRole: commentRole.trim() || 'Community Member'
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  comment_count: (post.comment_count || 0) + 1
                }
              : post
          )
        );
        
        
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(prev => prev ? {
            ...prev,
            comment_count: (prev.comment_count || 0) + 1
          } : null);
        }
        
        
        await fetchPostComments(postId);
        
        
        setNewComment("");
        setCommentAuthor("");
        setCommentRole("");
        
        toast({
          title: "Success!",
          description: "Komentar Anda telah ditambahkan"
        });

      
        setTimeout(() => {
          autoRefreshPosts();
        }, 1000);
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan komentar",
        variant: "destructive"
      });
    } finally {
      setIsCommenting(false);
    }
  };


  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
  
    switch (value) {
      case "feed":
        await fetchPosts();
        break;
      case "create":
      
        break;
      case "trending":
        await fetchPopularContent();
        break;
      default:
        break;
    }
  };

  
  const toggleComments = async (postId: number) => {
    
    if (showComments) {
      await fetchPostComments(postId);
    }
    setShowComments(!showComments);
  };

  useEffect(() => {
    fetchPosts();
    fetchPopularContent();
    fetchUpcomingEvents();
  }, []);

  // Reset modal states when selectedPost changes, but only if event modal is not open
  useEffect(() => {
    if (!selectedPost && !eventModalOpen) {
      setImageModalOpen(false);
      setImageLoading(false);
      setSelectedImage(null);
      setImageZoom(1);
      setImagePosition({ x: 0, y: 0 });
      setIsDragging(false);
      setPostDetailLoading(false);
    }
  }, [selectedPost, eventModalOpen]);

  // Reset zoom when new image is selected
  useEffect(() => {
    if (selectedImage) {
      setImageZoom(1);
      setImagePosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [selectedImage]);

  // Debug modal states
  useEffect(() => {
  }, [imageModalOpen, selectedImage]);

  // Handle wheel event for image modal zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setImageZoom(prev => Math.min(prev * 1.5, 5));
      } else {
        setImageZoom(prev => Math.max(prev / 1.5, 0.5));
      }
    };

    const modalElement = modalContentRef.current;
    if (modalElement && imageModalOpen) {
      modalElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        modalElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, [imageModalOpen]);

  // Render Image Modal for main community page
  const renderImageModal = () => {
    
    
    if (!imageModalOpen || !selectedImage) {
      
      return null;
    }

    

    const handleZoomIn = () => {
      setImageZoom(prev => Math.min(prev * 1.5, 5));
    };

    const handleZoomOut = () => {
      setImageZoom(prev => Math.max(prev / 1.5, 0.5));
    };

    const resetZoom = () => {
      setImageZoom(1);
      setImagePosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      if (imageZoom > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - imagePosition.x,
          y: e.clientY - imagePosition.y
        });
      }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (isDragging && imageZoom > 1) {
        setImagePosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const closeModal = () => {
      setImageModalOpen(false);
      setImageLoading(false);
      setSelectedImage(null);
      setImageZoom(1);
      setImagePosition({ x: 0, y: 0 });
      setIsDragging(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[99999]" 
           onClick={closeModal}>
        <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
          
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 text-white bg-black/70 hover:bg-black/90 rounded-full p-2 z-20 shadow-lg transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
            <button
              className="text-white bg-black/70 hover:bg-black/90 rounded-full p-2 shadow-lg transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              title="Zoom In"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              className="text-white bg-black/70 hover:bg-black/90 rounded-full p-2 shadow-lg transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              title="Zoom Out"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              className="text-white bg-black/70 hover:bg-black/90 rounded-full p-2 shadow-lg transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              title="Reset Zoom"
            >
              <div className="h-4 w-4 border-2 border-white rounded"></div>
            </button>
          </div>

          {/* Zoom Level Indicator */}
          <div className="absolute bottom-4 left-4 text-white bg-black/70 px-3 py-1 rounded-full text-sm z-20">
            {Math.round(imageZoom * 100)}%
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 text-white bg-black/70 px-3 py-1 rounded-full text-xs z-20">
            <span className="hidden sm:inline">Scroll to zoom • Drag to pan</span>
            <span className="sm:hidden">Tap buttons to zoom</span>
          </div>

          {/* Loading Spinner */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="flex flex-col items-center text-white">
                <Loader2 className="h-12 w-12 animate-spin mb-3" />
                <p className="text-sm">Loading image...</p>
              </div>
            </div>
          )}

          {/* Image Container */}
          <div 
            ref={modalContentRef}
            className="relative overflow-hidden w-full h-full flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: imageZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-none transition-transform duration-200 ease-out select-none"
              style={{
                transform: `scale(${imageZoom}) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
                maxHeight: imageZoom === 1 ? '90vh' : 'none',
                maxWidth: imageZoom === 1 ? '90vw' : 'none',
              }}
              onClick={(e) => e.stopPropagation()}
              onLoad={() => {
                setImageLoading(false);
              }}
              onError={() => {
                setImageLoading(false);
              }}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render Event Detail Modal
  const renderEventModal = () => {
    if (!eventModalOpen || !selectedEvent) {
      return null;
    }

    const formatEventDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatDuration = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (hours > 0) {
        return `${hours} jam ${remainingMinutes > 0 ? remainingMinutes + ' menit' : ''}`;
      }
      return `${minutes} menit`;
    };

    const closeEventModal = () => {
      setEventModalOpen(false);
      setSelectedEvent(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[9999] p-4" 
           onClick={closeEventModal}>
        <div className="bg-background rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
             onClick={(e) => e.stopPropagation()}>
          
          {/* Modal Header */}
          <div className="flex justify-between items-start p-6 border-b flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold">Detail Event</h2>
            </div>
            <Button 
              onClick={closeEventModal}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="overflow-y-auto flex-1">
            <div className="p-6 space-y-6">
            {/* Event Title */}
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {selectedEvent.title}
              </h3>
              <div 
                className="prose prose-base max-w-none text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: parseMarkdown(selectedEvent.description, selectedEvent.images) 
                }}
              />
            </div>

            {/* Event Images */}
            {selectedEvent.images && selectedEvent.images.length > 0 && (
              <div className={`mb-6 grid gap-3 rounded-lg overflow-hidden ${
                selectedEvent.images.length === 1 ? 'grid-cols-1' :
                selectedEvent.images.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                selectedEvent.images.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {selectedEvent.images.map((image, imgIndex) => (
                  <div key={imgIndex} className="relative rounded-lg overflow-hidden group cursor-pointer">
                    <img
                      src={`http://127.0.0.1:3000${image.path}`}
                      alt={`Event image ${imgIndex + 1}`}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        
                        setSelectedImage(`http://127.0.0.1:3000${image.path}`);
                        setImageModalOpen(true);
                        
                      }}
                    />
                    <div 
                      className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        
                        setSelectedImage(`http://127.0.0.1:3000${image.path}`);
                        setImageModalOpen(true);
                        
                      }}
                    >
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-sm">Tanggal & Waktu</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {formatEventDate(selectedEvent.event_date)}
                </p>
                <p className="text-sm text-muted-foreground ml-6">
                  Durasi: {formatDuration(selectedEvent.duration_minutes)}
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {selectedEvent.location.includes('Online') || selectedEvent.location.includes('Zoom') ? (
                    <Video className="h-4 w-4 text-blue-500" />
                  ) : (
                    <MapPin className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium text-sm">Lokasi</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {selectedEvent.location}
                </p>
              </div>

              {/* Max Participants */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">Kapasitas</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Maksimal {selectedEvent.max_participants} peserta
                </p>
              </div>

              {/* Created By */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-sm">Penyelenggara</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6 capitalize">
                  {selectedEvent.created_by}
                </p>
              </div>
            </div>

            {/* Zoom Details (if online) */}
            {selectedEvent.zoom_link && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-3 flex items-center">
                  <Video className="h-4 w-4 text-blue-500 mr-2" />
                  Detail Zoom Meeting
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Meeting ID:</span>
                    <p className="text-sm font-mono bg-background px-2 py-1 rounded border inline-block ml-2">
                      {selectedEvent.zoom_meeting_id}
                    </p>
                  </div>
                  {selectedEvent.zoom_password && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Password:</span>
                      <p className="text-sm font-mono bg-background px-2 py-1 rounded border inline-block ml-2">
                        {selectedEvent.zoom_password}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              {selectedEvent.zoom_link && (
                <Button 
                  onClick={() => window.open(selectedEvent.zoom_link, '_blank')}
                  className="flex-1"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Zoom Meeting
                </Button>
              )}
              <Button variant="outline" onClick={closeEventModal}>
                Tutup
              </Button>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Post Detail</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8 md:mb-12">
          <Badge className="mb-4" variant="secondary">
            <Globe className="w-3 h-3 mr-1" />
            KOMUNITAS PANGAN JAWARA
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">
            Hub Kolaborasi Petani Indonesia
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Bersama ribuan petani dan praktisi pertanian, mari saling berbagi pengetahuan, bertukar inovasi, dan memperkuat ketahanan pangan untuk masa depan yang berkelanjutan.
          </p>
        </div>

        {/* Enhanced Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4">
              <MessageSquare className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold text-foreground">{stats.totalPosts}</div>
              <p className="text-xs md:text-sm text-muted-foreground">Total Posts</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4">
              <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold text-foreground">{stats.totalMembers.toLocaleString()}</div>
              <p className="text-xs md:text-sm text-muted-foreground">Members</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4">
              <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold text-foreground">{stats.activeToday}</div>
              <p className="text-xs md:text-sm text-muted-foreground">Active Today</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4">
              <TrendingUp className="w-6 h-6 text-warning mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold text-foreground">{stats.dailyDiscussions}</div>
              <p className="text-xs md:text-sm text-muted-foreground">Discussions</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4">
              <Eye className="w-6 h-6 text-success mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs md:text-sm text-muted-foreground">Total Views</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Cari postingan, topik, atau pengguna..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter Posts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Posts</SelectItem>
              <SelectItem value="recent">Terbaru</SelectItem>
              <SelectItem value="popular">Terpopuler</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - Posts */}
          <div className="xl:col-span-2">
            <Tabs defaultValue="feed" value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="w-full mb-4 md:mb-6 grid grid-cols-3">
                <TabsTrigger value="feed" className="text-xs sm:text-sm">Community Feed</TabsTrigger>
                <TabsTrigger value="create" className="text-xs sm:text-sm">Buat Post</TabsTrigger>
                <TabsTrigger value="trending" className="text-xs sm:text-sm">Trending</TabsTrigger>
              </TabsList>
              
              <TabsContent value="feed" className="space-y-6">
                {loading ? (
                  <Card className="p-12">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Memuat postingan...</span>
                    </div>
                  </Card>
                ) : filteredPosts.length > 0 ? (
                  <>
                    {filteredPosts.map((post) => (
                      <Card key={post.id} className="group p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary"
                        onClick={() => handlePostClick(post, false)}
                      >
                        <div className="flex space-x-3">
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                            <AvatarFallback className={`text-sm font-semibold ${getAvatarColor(post.author)}`}>
                              {post.author.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-foreground text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                                  {post.author}
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {post.authorRole || 'Community Member'} • {formatDate(getPostDate(post))}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getPostLikes(post) > 10 && (
                                  <Badge variant="secondary">
                                    <Star className="w-3 h-3 mr-1" />
                                    Popular
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePostClick(post, false);
                                  }}
                                  title="Buka halaman detail"
                                >
                                  <ArrowLeft className="h-3 w-3 rotate-180" />
                                </Button>
                              </div>
                            </div>
                            
                            {post.title && (
                              <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 break-words group-hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                            )}
                            
                            <p className="text-foreground mb-4 text-sm sm:text-base break-words line-clamp-3">
                              {post.content}
                            </p>
                            
                            {post.tags && (
                              <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                                {post.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center flex-wrap gap-3 sm:gap-6 text-muted-foreground">
                              <button 
                                className={`flex items-center space-x-1 sm:space-x-2 transition-all group/like ${
                                  post.is_liked 
                                    ? 'text-red-500' 
                                    : 'hover:text-red-500 hover:scale-105'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLikePost(post.id);
                                }}
                              >
                                <Heart className={`w-4 h-4 transition-all ${
                                  post.is_liked 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'group-hover/like:fill-red-500 group-hover/like:scale-110'
                                }`} />
                                <span className="text-xs sm:text-sm font-medium">{getPostLikes(post)}</span>
                              </button>
                              <button 
                                className="flex items-center space-x-1 sm:space-x-2 hover:text-primary hover:scale-105 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePostClick(post);
                                }}
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-xs sm:text-sm font-medium">{getPostComments(post)}</span>
                              </button>
                              <button 
                                className="flex items-center space-x-1 sm:space-x-2 hover:text-blue-500 hover:scale-105 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSharePost(post.id);
                                }}
                              >
                                <Share2 className="w-4 h-4" />
                                <span className="text-xs sm:text-sm font-medium">{getPostShared(post)}</span>
                              </button>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground ml-auto">
                                <Eye className="w-3 h-3" />
                                <span>{(post.view_count || (getPostLikes(post) * 3)).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {/* Pagination Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-4">
                      {/* Pagination Info */}
                      <div className="text-sm text-muted-foreground">
                        Halaman {currentPage} dari {totalPages} • {totalPosts} total postingan
                      </div>
                      
                      {/* Pagination Buttons */}
                      {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                          {/* Previous Button */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handlePrevPage} 
                            disabled={currentPage === 1 || paginationLoading}
                            className="gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Sebelumnya</span>
                          </Button>
                          
                          {/* Page Numbers */}
                          <div className="flex items-center gap-1">
                            {/* First page */}
                            {currentPage > 2 && (
                              <>
                                <Button 
                                  variant={1 === currentPage ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => handlePageChange(1)}
                                  disabled={paginationLoading}
                                  className="w-10"
                                >
                                  1
                                </Button>
                                {currentPage > 3 && <span className="text-muted-foreground px-1">...</span>}
                              </>
                            )}
                            
                            {/* Current page range */}
                            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                              const pageNum = Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i;
                              if (pageNum > totalPages) return null;
                              
                              return (
                                <Button 
                                  key={pageNum}
                                  variant={pageNum === currentPage ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                                  disabled={paginationLoading}
                                  className="w-10"
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                            
                            {/* Last page */}
                            {currentPage < totalPages - 1 && totalPages > 3 && (
                              <>
                                {currentPage < totalPages - 2 && <span className="text-muted-foreground px-1">...</span>}
                                <Button 
                                  variant={totalPages === currentPage ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => handlePageChange(totalPages)}
                                  disabled={paginationLoading}
                                  className="w-10"
                                >
                                  {totalPages}
                                </Button>
                              </>
                            )}
                          </div>
                          
                          {/* Next Button */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleNextPage} 
                            disabled={currentPage === totalPages || paginationLoading}
                            className="gap-1"
                          >
                            <span className="hidden sm:inline">Selanjutnya</span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Loading indicator for pagination */}
                      {paginationLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Memuat halaman...
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-background to-muted/20">
                    <div className="max-w-md mx-auto">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Plus className="w-3 h-3 text-yellow-800" />
                        </div>
                      </div>
                      
                      <h3 className="text-lg sm:text-xl font-bold mb-3 text-foreground">
                        {searchQuery || selectedFilter !== "all" ? "Tidak Ada Hasil Ditemukan" : "Mari Mulai Diskusi!"}
                      </h3>
                      
                      <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                        {searchQuery || selectedFilter !== "all" 
                          ? "Coba gunakan kata kunci yang berbeda atau ubah filter pencarian Anda" 
                          : "Jadilah yang pertama berbagi pengalaman, tips, atau pertanyaan seputar pertanian dan ketahanan pangan"
                        }
                      </p>
                      
                      {(searchQuery || selectedFilter !== "all") ? (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            variant="outline" 
                            onClick={() => setSearchQuery("")}
                            disabled={!searchQuery}
                            className="w-full sm:w-auto"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Hapus Pencarian
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedFilter("all")}
                            disabled={selectedFilter === "all"}
                            className="w-full sm:w-auto"
                          >
                            <Filter className="w-4 h-4 mr-2" />
                            Reset Filter
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Button 
                            onClick={() => setActiveTab("create")}
                            size="lg"
                            className="w-full sm:w-auto px-8"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Buat Postingan Pertama
                          </Button>
                          
                          <div className="text-xs text-muted-foreground pt-2">
                            atau bergabung dengan diskusi yang sudah ada
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="create" className="space-y-4 md:space-y-6">
                <Card className="p-4 sm:p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Buat Postingan Baru
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <div className="space-y-4">
                      {/* Author Info */}
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="authorName">Nama Anda *</Label>
                          <Input
                            id="authorName"
                            placeholder="Masukkan nama lengkap Anda"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="authorRole">Role/Posisi</Label>
                          <Select value={authorRole} onValueChange={setAuthorRole}>
                            <SelectTrigger id="authorRole">
                              <SelectValue placeholder="Pilih role Anda" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Petani">Petani</SelectItem>
                              <SelectItem value="Peternak">Peternak</SelectItem>
                              <SelectItem value="Nelayan">Nelayan</SelectItem>
                              <SelectItem value="Peneliti">Peneliti</SelectItem>
                              <SelectItem value="Dosen">Dosen</SelectItem>
                              <SelectItem value="Mahasiswa">Mahasiswa</SelectItem>
                              <SelectItem value="Pelajar">Pelajar</SelectItem>
                              <SelectItem value="Developer">Developer</SelectItem>
                              <SelectItem value="Entrepreneur">Entrepreneur</SelectItem>
                              <SelectItem value="Konsultan">Konsultan</SelectItem>
                              <SelectItem value="Penyuluh">Penyuluh Pertanian</SelectItem>
                              <SelectItem value="Distributor">Distributor</SelectItem>
                              <SelectItem value="Pengusaha">Pengusaha</SelectItem>
                              <SelectItem value="Aktivis">Aktivis Lingkungan</SelectItem>
                              <SelectItem value="Jurnalis">Jurnalis</SelectItem>
                              <SelectItem value="Pemerintah">Pegawai Pemerintah</SelectItem>
                              <SelectItem value="NGO">NGO Worker</SelectItem>
                              <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div>
                        <Label htmlFor="postTitle">Judul Postingan *</Label>
                        <Input
                          id="postTitle"
                          placeholder="Tulis judul yang menarik..."
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="postContent">Isi Postingan *</Label>
                        <Textarea
                          id="postContent"
                          placeholder="Bagikan pengalaman, tips, pertanyaan, atau ide Anda di sini..."
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          className="min-h-[150px] resize-none"
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <Label htmlFor="imageUpload">Upload Gambar (Opsional)</Label>
                        <div className="mt-2">
                          <Input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('imageUpload')?.click()}
                            className="w-full"
                          >
                            <ImagePlus className="w-4 h-4 mr-2" />
                            Pilih Gambar (Max 4)
                          </Button>
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end pt-4">
                        <Button 
                          onClick={handlePost}
                          disabled={isPosting || !postTitle.trim() || !postContent.trim() || !authorName.trim()}
                          className="min-w-[140px]"
                        >
                          {isPosting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Memposting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Publikasikan Post
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trending">
                {trendingLoading ? (
                  <Card className="p-12">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Memuat konten trending...</span>
                    </div>
                  </Card>
                ) : popularContent.posts.length > 0 ? (
                  <div className="space-y-6">
                    {popularContent.posts.map((post) => (
                      <Card key={post.id} className="group p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-transparent hover:border-l-orange-500"
                        onClick={() => handlePostClick(post, false)}
                      >
                        <div className="flex space-x-3">
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                            <AvatarFallback className={`text-sm font-semibold ${getAvatarColor(post.author)}`}>
                              {post.author.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-foreground text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                                  {post.author}
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {post.authorRole || 'Community Member'} • {formatDate(getPostDate(post))}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Trending
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePostClick(post, false);
                                  }}
                                  title="Buka halaman detail"
                                >
                                  <ArrowLeft className="h-3 w-3 rotate-180" />
                                </Button>
                              </div>
                            </div>
                            
                            {post.title && (
                              <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 break-words group-hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                            )}
                            
                            <p className="text-foreground mb-4 text-sm sm:text-base break-words line-clamp-3">
                              {post.content}
                            </p>
                            
                            {/* Enhanced Image Gallery */}
                            {post.images && post.images.length > 0 && (
                              <div className={`mb-4 grid gap-2 rounded-lg overflow-hidden ${
                                getPostImages(post).length === 1 ? 'grid-cols-1' :
                                getPostImages(post).length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                                getPostImages(post).length === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
                              }`}>
                                {getPostImages(post).map((image, imgIndex) => (
                                  <div key={imgIndex} className="relative rounded-lg overflow-hidden group/image">
                                    <img
                                      src={image}
                                      alt={`Post image ${imgIndex + 1}`}
                                      className="w-full h-32 sm:h-48 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setImageLoading(true);
                                        setSelectedImage(image);
                                        setImageModalOpen(true);
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                                      <Eye className="w-6 h-6 text-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {post.tags && (
                              <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                                {post.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center flex-wrap gap-3 sm:gap-6 text-muted-foreground">
                              <button 
                                className={`flex items-center space-x-1 sm:space-x-2 transition-all group/like ${
                                  post.is_liked 
                                    ? 'text-red-500' 
                                    : 'hover:text-red-500 hover:scale-105'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLikePost(post.id);
                                }}
                              >
                                <Heart className={`w-4 h-4 transition-all ${
                                  post.is_liked 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'group-hover/like:fill-red-500 group-hover/like:scale-110'
                                }`} />
                                <span className="text-xs sm:text-sm font-medium">{getPostLikes(post)}</span>
                              </button>
                              <button 
                                className="flex items-center space-x-1 sm:space-x-2 hover:text-primary hover:scale-105 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePostClick(post);
                                }}
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-xs sm:text-sm font-medium">{getPostComments(post)}</span>
                              </button>
                              <button 
                                className="flex items-center space-x-1 sm:space-x-2 hover:text-blue-500 hover:scale-105 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSharePost(post.id);
                                }}
                              >
                                <Share2 className="w-4 h-4" />
                                <span className="text-xs sm:text-sm font-medium">{getPostShared(post)}</span>
                              </button>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground ml-auto">
                                <Eye className="w-3 h-3" />
                                <span>{(post.view_count || (getPostLikes(post) * 3)).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {/* Load More Trending */}
                    <div className="text-center pt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          fetchPosts();
                          fetchPopularContent();
                        }}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <MessageSquare className="w-4 h-4 mr-2" />
                        )}
                        Refresh Feed
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-orange-50/50 to-orange-100/20 dark:from-orange-950/20 dark:to-orange-900/10">
                    <div className="max-w-md mx-auto">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white fill-current" />
                        </div>
                      </div>
                      
                      <h3 className="text-lg sm:text-xl font-bold mb-3 text-foreground">
                        Belum Ada Konten Trending
                      </h3>
                      
                      <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                        Konten trending akan muncul ketika ada postingan yang mendapat banyak likes, komentar, dan interaksi dari komunitas
                      </p>
                      
                      <div className="space-y-4">
                        <Button 
                          onClick={() => {
                            fetchPosts();
                            fetchPopularContent();
                          }}
                          disabled={loading}
                          size="lg"
                          className="w-full sm:w-auto px-8"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <TrendingUp className="w-4 h-4 mr-2" />
                          )}
                          Muat Konten Trending
                        </Button>
                        
                        <div className="text-xs text-muted-foreground pt-2">
                          atau buat postingan menarik untuk menjadi trending!
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Quick Stats */}
            <Card className="p-4 md:p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-base md:text-lg">Statistik Komunitas</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-muted-foreground">Total Posts</span>
                    <span className="font-semibold text-sm md:text-base">{stats.totalPosts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-muted-foreground">Total Members</span>
                    <span className="font-semibold text-sm md:text-base">{stats.totalMembers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-muted-foreground">Active Today</span>
                    <span className="font-semibold text-sm md:text-base">{stats.activeToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-muted-foreground">Daily Discussions</span>
                    <span className="font-semibold text-sm md:text-base">{stats.dailyDiscussions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-muted-foreground">Total Views</span>
                    <span className="font-semibold text-sm md:text-base">{stats.totalViews.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="p-4 md:p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Acara Mendatang
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="space-y-3">
                  {upcomingEvents.length > 0 ? (
                    <>
                      {upcomingEvents.slice(0, 3).map((event) => (
                        <div 
                          key={event.id} 
                          className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                          onClick={() => {
                            setSelectedEvent(event);
                            setEventModalOpen(true);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
                                {event.title}
                              </h4>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(event.event_date).toLocaleDateString('id-ID', { 
                                  day: 'numeric', 
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {upcomingEvents.length > 3 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => {
                            // You can add a link to events page or show all events modal
                            toast({
                              title: "Info",
                              description: "Fitur lihat semua acara akan segera hadir!",
                            });
                          }}
                        >
                          Lihat Semua Acara ({upcomingEvents.length})
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6 px-2">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Belum Ada Acara</h4>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                        Acara dan workshop akan muncul di sini ketika sudah dijadwalkan
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Info",
                            description: "Fitur usulan acara akan segera hadir!",
                          });
                        }}
                      >
                        <Plus className="w-3 h-3 mr-2" />
                        Usulkan Acara
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Post Detail Modal */}
        <Dialog open={!!selectedPost} onOpenChange={(open) => {
          
          if (!open) setSelectedPost(null);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Detail Postingan
              </DialogTitle>
            </DialogHeader>
            
            {postDetailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Memuat detail postingan...</span>
              </div>
            ) : selectedPost ? (
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {/* Debug info - remove in production */}
                  <div className="text-xs text-muted-foreground">
                    Post ID: {selectedPost.id} | Author: {selectedPost.author}
                  </div>
                  
                  {/* Post Header */}
                  <div className="flex items-start space-x-3 pb-4 border-b">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarFallback className={`text-sm font-semibold ${getAvatarColor(selectedPost.author)}`}>
                        {selectedPost.author.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-base">
                        {selectedPost.author}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedPost.authorRole || 'Community Member'} • {formatDate(getPostDate(selectedPost))}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      <span>{(selectedPost.view_count || (getPostLikes(selectedPost) * 3)).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Post Title and Content */}
                  {selectedPost.title && (
                    <h2 className="text-xl font-bold text-foreground mb-2 break-words">
                      {selectedPost.title}
                    </h2>
                  )}
                  
                  <div className="text-foreground break-words whitespace-pre-wrap mb-4">
                    {selectedPost.content}
                  </div>
                  
                  {/* Post Images */}
                  {selectedPost.images && selectedPost.images.length > 0 && (
                    <div className={`mb-4 grid gap-2 rounded-lg overflow-hidden ${
                      getPostImages(selectedPost).length === 1 ? 'grid-cols-1' :
                      getPostImages(selectedPost).length === 2 ? 'grid-cols-2' :
                      getPostImages(selectedPost).length === 3 ? 'grid-cols-3' : 'grid-cols-2'
                    }`}>
                      {getPostImages(selectedPost).map((image, imgIndex) => (
                        <div key={imgIndex} className="relative rounded-lg overflow-hidden group">
                          <img
                            src={image}
                            alt={`Post image ${imgIndex + 1}`}
                            className="w-full h-40 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                            onClick={() => {
                              setImageLoading(true);
                              setSelectedImage(image);
                              setImageModalOpen(true);
                            }}
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Post Tags */}
                  {selectedPost.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedPost.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Post Actions */}
                  <div className="flex items-center justify-between mb-4 pt-4 border-t">
                    <div className="flex items-center gap-6 text-muted-foreground">
                      <button 
                        className={`flex items-center space-x-2 transition-all group ${
                          selectedPost.is_liked 
                            ? 'text-red-500' 
                            : 'hover:text-red-500 hover:scale-105'
                        }`}
                        onClick={() => handleLikePost(selectedPost.id)}
                      >
                        <Heart className={`w-5 h-5 transition-all ${
                          selectedPost.is_liked 
                            ? 'fill-red-500 text-red-500' 
                            : 'group-hover:fill-red-500 group-hover:scale-110'
                        }`} />
                        <span className="text-sm font-medium">{getPostLikes(selectedPost)}</span>
                      </button>
                      <button 
                        className="flex items-center space-x-2 hover:text-primary hover:scale-105 transition-all"
                        onClick={() => setShowComments(!showComments)}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{getPostComments(selectedPost)}</span>
                      </button>
                      <button 
                        className="flex items-center space-x-2 hover:text-blue-500 hover:scale-105 transition-all"
                        onClick={() => handleSharePost(selectedPost.id)}
                      >
                        <Share2 className="w-5 h-5" />
                        <span className="text-sm font-medium">{getPostShared(selectedPost)}</span>
                      </button>
                    </div>
                  </div>
                </div>
                  
                {/* Comments Section */}
                {showComments && (
                  <div className="space-y-4 mt-6 border-t pt-4">
                    <h3 className="font-semibold text-lg border-b pb-2">
                      Komentar ({postComments.length})
                    </h3>
                    
                    {/* Add Comment Form */}
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="commentAuthor">Nama Anda *</Label>
                            <Input
                              id="commentAuthor"
                              placeholder="Nama lengkap"
                              value={commentAuthor}
                              onChange={(e) => setCommentAuthor(e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="commentRole">Role (Opsional)</Label>
                            <Select value={commentRole} onValueChange={setCommentRole}>
                              <SelectTrigger id="commentRole" className="text-sm">
                                <SelectValue placeholder="Pilih role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Petani">Petani</SelectItem>
                                <SelectItem value="Peternak">Peternak</SelectItem>
                                <SelectItem value="Nelayan">Nelayan</SelectItem>
                                <SelectItem value="Peneliti">Peneliti</SelectItem>
                                <SelectItem value="Dosen">Dosen</SelectItem>
                                <SelectItem value="Mahasiswa">Mahasiswa</SelectItem>
                                <SelectItem value="Pelajar">Pelajar</SelectItem>
                                <SelectItem value="Developer">Developer</SelectItem>
                                <SelectItem value="Entrepreneur">Entrepreneur</SelectItem>
                                <SelectItem value="Konsultan">Konsultan</SelectItem>
                                <SelectItem value="Penyuluh">Penyuluh Pertanian</SelectItem>
                                <SelectItem value="Distributor">Distributor</SelectItem>
                                <SelectItem value="Pengusaha">Pengusaha</SelectItem>
                                <SelectItem value="Aktivis">Aktivis Lingkungan</SelectItem>
                                <SelectItem value="Jurnalis">Jurnalis</SelectItem>
                                <SelectItem value="Pemerintah">Pegawai Pemerintah</SelectItem>
                                <SelectItem value="NGO">NGO Worker</SelectItem>
                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="newComment">Komentar Anda *</Label>
                          <Textarea
                            id="newComment"
                            placeholder="Tulis komentar Anda di sini..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[80px] resize-none text-sm"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            onClick={() => handleAddComment(selectedPost.id)}
                            disabled={isCommenting || !newComment.trim() || !commentAuthor.trim()}
                            size="sm"
                          >
                            {isCommenting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Mengirim...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Kirim Komentar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Comments List */}
                    <div className="space-y-4">
                      {postComments.length > 0 ? (
                        postComments.map((comment) => (
                          <Card key={comment.id} className="p-4">
                            <div className="flex space-x-3">
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback className={`text-xs font-semibold ${getAvatarColor(comment.author)}`}>
                                  {comment.author.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h5 className="font-medium text-sm text-foreground">
                                    {comment.author}
                                  </h5>
                                  {comment.authorRole && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                                      {comment.authorRole}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(comment.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground break-words whitespace-pre-wrap">
                                  {comment.content}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <button 
                                    className={`flex items-center space-x-1 text-xs transition-colors ${
                                      comment.is_liked 
                                        ? 'text-red-500' 
                                        : 'text-muted-foreground hover:text-red-500'
                                    }`}
                                    onClick={() => handleLikeComment(comment.id)}
                                  >
                                    <Heart className={`w-3 h-3 ${comment.is_liked ? 'fill-current' : ''}`} />
                                    <span>{comment.like_count || 0}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Belum ada komentar. Jadilah yang pertama berkomentar!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Post tidak ditemukan</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Image Modal */}
        {renderImageModal()}

        {/* Event Modal */}
        {renderEventModal()}
      </div>
    </div>
  );
};

export default Komunitas;