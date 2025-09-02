import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseMarkdown } from '@/lib/markdown';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  LogOut, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Edit,
  Trash2,
  Plus,
  Eye,
  Shield,
  Calendar,
  Activity,
  TrendingUp,
  Clock,
  Loader2,
  Search,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SecurityLogs from '@/components/admin/SecurityLogs';
import HealthDashboard from '@/components/admin/HealthDashboard';
import RoleGuard from '@/components/auth/RoleGuard';
import AuthService from '@/lib/auth';
import { 
  ArticleActions, 
  EventActions, 
  UserActions, 
  EventInfo, 
  StatusBadge, 
  AddButton 
} from '@/components/admin/AdminActions';
import {
  ArticleDetailModal,
  EventDetailModal,
  ArticleFormModal,
  EventFormModal,
  UserFormModal
} from '@/components/admin/AdminModals';

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

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
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
  status: 'published' | 'draft';
  priority: 'normal' | 'high' | 'urgent';
  images?: any[];
  image_count?: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at?: string;
  images?: any[];
  tags?: string;
  is_published?: boolean;
}

interface Comment {
  id: number;
  content: string;
  author: string;
  post_id?: number;
  article_id?: number;
  created_at: string;
  updated_at?: string;
  is_approved?: boolean;
  parent_id?: number;
  replies?: Comment[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const currentUser = AuthService.getCurrentUser();

  // Helper function to create preview text from markdown content
  const createPreviewText = (content: string, images?: any[], maxLength: number = 150): string => {
    if (!content) return '';
    
    try {
      // Parse markdown content
      const parsed = parseMarkdown(content, images);
      // Strip HTML tags and clean up whitespace
      const textOnly = parsed.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      // Return truncated text
      return textOnly.length > maxLength ? textOnly.substring(0, maxLength) + '...' : textOnly;
    } catch (error) {
      console.error('Error parsing markdown for preview:', error);
      // Fallback to simple text truncation
      const fallback = content.replace(/\{\{[^}]*\}\}/g, '').replace(/\s+/g, ' ').trim();
      return fallback.length > maxLength ? fallback.substring(0, maxLength) + '...' : fallback;
    }
  };

  
  const handleTabChange = async (newTab: string) => {
    setActiveTab(newTab);
    setTabLoading(true);
    
    try {
      
      switch (newTab) {
        case 'overview':
          
          await Promise.all([
            loadData('dashboard'),
            loadData('articles'),
            loadData('events'),
            loadData('posts'),
            loadData('comments'),
            AuthService.canAccess('users') ? loadData('users') : Promise.resolve()
          ]);
          break;
        case 'articles':
          await loadData('articles');
          break;
        case 'events':
          await loadData('events');
          break;
        case 'posts':
          await loadData('posts');
          break;
        case 'comments':
          await loadData('comments');
          break;
        case 'users':
          if (AuthService.canAccess('users')) {
            await loadData('users');
          }
          break;
        case 'health':
          
          break;
        case 'security':
          
          break;
        case 'settings':
          
          break;
      }
    } catch (error) {
      console.error('Error loading tab data:', error);
    } finally {
      setTabLoading(false);
    }
  };
  
  
  const [adminData, setAdminData] = useState({
    posts: [] as Post[],
    articles: [] as Article[],
    events: [] as Event[],
    users: [] as User[],
    comments: [] as Comment[],
    stats: null,
    dashboardStats: null as any
  });

  // Search states
  const [searchQueries, setSearchQueries] = useState({
    articles: '',
    posts: '',
    events: '',
    users: '',
    comments: ''
  });

  // Filter functions
  const filterArticles = (articles: Article[]) => {
    if (!searchQueries.articles.trim()) return articles;
    const query = searchQueries.articles.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.author.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query) ||
      article.tags?.toLowerCase().includes(query)
    );
  };

  const filterPosts = (posts: Post[]) => {
    if (!searchQueries.posts.trim()) return posts;
    const query = searchQueries.posts.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      post.tags?.toLowerCase().includes(query)
    );
  };

  const filterEvents = (events: Event[]) => {
    if (!searchQueries.events.trim()) return events;
    const query = searchQueries.events.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  };

  const filterUsers = (users: User[]) => {
    if (!searchQueries.users.trim()) return users;
    const query = searchQueries.users.toLowerCase();
    return users.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  };

  const filterComments = (comments: Comment[]) => {
    if (!searchQueries.comments.trim()) return comments;
    const query = searchQueries.comments.toLowerCase();
    return comments.filter(comment => 
      comment.content.toLowerCase().includes(query) ||
      comment.author.toLowerCase().includes(query)
    );
  };

  // Handle search input changes
  const handleSearchChange = (tab: string, value: string) => {
    setSearchQueries(prev => ({ ...prev, [tab]: value }));
  };

  // Highlight search terms in text
  const highlightSearchText = (text: string, searchTerm: string): JSX.Element => {
    if (!searchTerm.trim()) {
      return <span>{text}</span>;
    }

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) => 
          regex.test(part) ? 
            <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : 
            <span key={index}>{part}</span>
        )}
      </span>
    );
  };

  
  const [isLoading, setIsLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});

  
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'article' | 'event' | 'user' | 'post' | 'comment' | null;
    id: number | null;
    title: string;
  }>({
    isOpen: false,
    type: null,
    id: null,
    title: ''
  });

  
  const [modals, setModals] = useState({
    articleDetail: { isOpen: false, article: null as Article | null },
    eventDetail: { isOpen: false, event: null as Event | null },
    articleForm: { isOpen: false, article: null as Article | null, mode: 'create' as 'create' | 'edit' },
    eventForm: { isOpen: false, event: null as Event | null, mode: 'create' as 'create' | 'edit' },
    userForm: { isOpen: false, user: null as User | null, mode: 'create' as 'create' | 'edit' }
  });

  
  const apiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    const token = localStorage.getItem('adminToken') || AuthService.getToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      console.log(`Making API call: ${method} ${endpoint}`);
      const response = await fetch(`http://localhost:3000/pajar${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      
      console.log(`API Response Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`API Response Data:`, data);
        return data;
      } else {
        const errorText = await response.text();
        console.error(`API Error Response:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  
  const loadData = async (section: string) => {
    try {
      console.log(`🔄 Loading ${section} data...`);
      let data;
      switch (section) {
        case 'dashboard':
          data = await apiCall('/stats/dashboard');
          setAdminData(prev => ({ ...prev, dashboardStats: data }));
          console.log(`✅ Loaded dashboard stats:`, data);
          break;
        case 'posts':
          data = await apiCall('/posts');
          
          const posts = data.posts || data || [];
          setAdminData(prev => ({ ...prev, posts: Array.isArray(posts) ? posts : [] }));
          console.log(`✅ Loaded ${posts.length} posts`);
          break;
        case 'articles':
          data = await apiCall('/articles/all');
          
          const articles = data.articles || data || [];
          setAdminData(prev => ({ ...prev, articles: Array.isArray(articles) ? articles : [] }));
          console.log(`✅ Loaded ${articles.length} articles`);
          break;
        case 'events':
          data = await apiCall('/events');
          
          const events = data.events || data || [];
          setAdminData(prev => ({ ...prev, events: Array.isArray(events) ? events : [] }));
          console.log(`✅ Loaded ${events.length} events`);
          break;
        case 'users':
          data = await apiCall('/auth/users');
          
          const users = data.users || data || [];
          setAdminData(prev => ({ ...prev, users: Array.isArray(users) ? users : [] }));
          console.log(`✅ Loaded ${users.length} users`);
          break;
        case 'comments':
          data = await apiCall('/comments');
          
          const comments = data.comments || data || [];
          setAdminData(prev => ({ ...prev, comments: Array.isArray(comments) ? comments : [] }));
          console.log(`✅ Loaded ${comments.length} comments`);
          break;
      }
    } catch (error) {
      console.error(`❌ Failed to load ${section}:`, error);
      
      switch (section) {
        case 'dashboard':
          setAdminData(prev => ({ ...prev, dashboardStats: null }));
          break;
        case 'posts':
          setAdminData(prev => ({ ...prev, posts: [] }));
          break;
        case 'articles':
          setAdminData(prev => ({ ...prev, articles: [] }));
          break;
        case 'events':
          setAdminData(prev => ({ ...prev, events: [] }));
          break;
        case 'users':
          setAdminData(prev => ({ ...prev, users: [] }));
          break;
        case 'comments':
          setAdminData(prev => ({ ...prev, comments: [] }));
          break;
      }
      toast({
        title: 'Error',
        description: `Failed to load ${section}: ${error}`,
        variant: 'destructive'
      });
    }
  };

  
  const createEvent = async (eventData: any) => {
    try {
      // Get the correct token - try adminToken first, then regular token
      const token = localStorage.getItem('adminToken') || AuthService.getToken();
      
      // Handle multipart form data for image upload
      if (eventData instanceof FormData) {
        const response = await fetch('http://localhost:3000/pajar/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: eventData
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }
      } else {
        // Regular JSON creation
        await apiCall('/events', 'POST', eventData);
      }
      
      toast({
        title: 'Success',
        description: 'Event berhasil dibuat!'
      });
      loadData('events');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Error creating event: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const deletePost = async (postId: number) => {
    try {
      await apiCall(`/posts/${postId}`, 'DELETE');
      toast({
        title: 'Success',
        description: 'Post berhasil dihapus!'
      });
      loadData('posts');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Error deleting post: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const deleteArticle = async (articleId: number) => {
    try {
      await apiCall(`/articles/${articleId}`, 'DELETE');
      toast({
        title: 'Success',
        description: 'Article berhasil dihapus!'
      });
      loadData('articles');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Error deleting article: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const deleteEvent = async (eventId: number) => {
    try {
      await apiCall(`/events/${eventId}`, 'DELETE');
      toast({
        title: 'Success',
        description: 'Event berhasil dihapus!'
      });
      loadData('events');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Error deleting event: ${error}`,
        variant: 'destructive'
      });
    }
  };

  
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadData('dashboard'),
          loadData('posts'),
          loadData('articles'),
          loadData('events'),
          loadData('users')
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  
  useEffect(() => {
    
    if (adminData.events.length === 0) {
      const sampleEvents: Event[] = [
        {
          id: 1,
          title: "Workshop React.js untuk Pemula",
          description: "Belajar React.js dari dasar hingga mahir dengan hands-on practice. Workshop ini akan membahas konsep-konsep fundamental React seperti components, props, state, dan hooks.",
          event_date: "2025-09-15T09:00:00.000Z",
          duration_minutes: 480,
          location: "Virtual Meeting (Zoom)",
          max_participants: 50,
          status: "published",
          priority: "normal"
        },
        {
          id: 2,
          title: "Webinar: Tren AI dalam Web Development",
          description: "Diskusi mendalam tentang bagaimana AI mengubah landscape web development dan tools-tools AI yang bisa membantu developer.",
          event_date: "2025-09-20T14:00:00.000Z",
          duration_minutes: 120,
          location: "Online",
          max_participants: 100,
          status: "published",
          priority: "high"
        },
        {
          id: 3,
          title: "Bootcamp Node.js Backend Development",
          description: "Intensive bootcamp untuk menguasai Node.js backend development dengan Express.js, database integration, dan deployment.",
          event_date: "2025-10-01T08:00:00.000Z",
          duration_minutes: 2880, 
          location: "Jakarta Convention Center",
          max_participants: 30,
          status: "draft",
          priority: "urgent"
        }
      ];
      setAdminData(prev => ({ ...prev, events: sampleEvents }));
    }

    
    if (adminData.users.length === 0) {
      const sampleUsers: User[] = [
        {
          id: 1,
          username: "ahmad.sutanto",
          email: "ahmad.sutanto@example.com",
          role: "admin",
          created_at: "2024-01-15T08:00:00.000Z",
          updated_at: "2024-01-15T08:00:00.000Z",
          last_login: "2025-09-01T10:30:00.000Z"
        },
        {
          id: 2,
          username: "sari.wijayanti",
          email: "sari.wijayanti@example.com",
          role: "editor",
          created_at: "2024-03-20T09:15:00.000Z",
          updated_at: "2024-03-20T09:15:00.000Z",
          last_login: "2025-08-30T14:20:00.000Z"
        },
        {
          id: 3,
          username: "rizki.pratama",
          email: "rizki.pratama@example.com",
          role: "user",
          created_at: "2024-06-10T11:00:00.000Z",
          updated_at: "2024-06-10T11:00:00.000Z",
          last_login: undefined
        }
      ];
      if (AuthService.canAccess('users')) {
        setAdminData(prev => ({ ...prev, users: sampleUsers }));
      }
    }

    
    if (adminData.articles.length === 0) {
      const sampleArticles: Article[] = [
        {
          id: 1,
          title: "Panduan Lengkap Web Development dengan Node.js",
          content: "Node.js telah menjadi salah satu teknologi backend paling populer di dunia pengembangan web modern. Dalam artikel ini, kita akan membahas secara mendalam bagaimana memulai journey sebagai Node.js developer.\n\n{{image:1}}\n\n## Apa itu Node.js?\n\nNode.js adalah runtime environment untuk JavaScript yang memungkinkan kita menjalankan JavaScript di server-side. Dibangun di atas V8 JavaScript engine dari Chrome, Node.js memberikan performa yang sangat baik untuk aplikasi web modern.\n\n## Keunggulan Node.js\n\n1. **Single Language**: Menggunakan JavaScript di frontend dan backend\n2. **Non-blocking I/O**: Asynchronous operations yang efisien\n3. **NPM Ecosystem**: Package manager dengan jutaan library\n4. **Scalability**: Mudah di-scale untuk aplikasi besar\n5. **Community Support**: Komunitas developer yang besar dan aktif\n\n{{image:2}}\n\n## Getting Started\n\nUntuk memulai dengan Node.js, Anda perlu menginstall Node.js dari website resmi. Setelah itu, Anda bisa mulai dengan membuat file JavaScript sederhana dan menjalankannya dengan command `node filename.js`.\n\n## Framework Populer\n\nBeberapa framework Node.js yang populer:\n- **Express.js**: Minimal dan fleksibel web framework\n- **Koa.js**: Framework dari tim Express yang lebih modern\n- **NestJS**: Framework enterprise dengan TypeScript\n- **Fastify**: Framework yang fokus pada performance\n\n## Best Practices\n\n1. Gunakan environment variables untuk konfigurasi\n2. Implement proper error handling\n3. Gunakan middleware untuk cross-cutting concerns\n4. Structure project dengan baik\n5. Implement logging dan monitoring\n6. Security first approach\n\nNode.js memang memiliki learning curve, tapi dengan dedikasi dan praktek yang konsisten, Anda akan bisa menguasainya dengan baik.",
          excerpt: "Pelajari Node.js dari dasar hingga advanced untuk menjadi fullstack JavaScript developer yang handal.",
          author: "Ahmad Sutanto",
          status: "published",
          view_count: 6,
          like_count: 0,
          featured: 1,
          tags: "nodejs,javascript,backend,tutorial",
          created_at: "2025-09-01T12:07:22.000Z",
          updated_at: "2025-09-01T12:07:22.000Z",
          published_at: "2025-09-01T12:07:22.000Z",
          shared_count: 0,
          image_count: 2,
          images: [
            {
              id: 1,
              entity_type: "article",
              entity_id: 1,
              filename: "nodejs-banner.png",
              original_name: "Node.js Development Banner",
              mimetype: "image/png",
              size: 5328,
              path: "/pajar/uploads/nodejs-banner.png",
              created_at: "2025-09-01T12:07:22.000Z"
            },
            {
              id: 2,
              entity_type: "article",
              entity_id: 1,
              filename: "nodejs-frameworks.png",
              original_name: "Node.js Frameworks Comparison",
              mimetype: "image/png",
              size: 20773,
              path: "/pajar/uploads/nodejs-frameworks.png",
              created_at: "2025-09-01T12:07:22.000Z"
            }
          ]
        },
        {
          id: 2,
          title: "React Hooks: Panduan Lengkap untuk Developer",
          content: "React Hooks telah mengubah cara kita menulis component di React. Dengan Hooks, functional component bisa memiliki state dan lifecycle methods.\n\n{{image}}\n\n## Apa itu React Hooks?\n\nHooks adalah fungsi spesial yang memungkinkan kita untuk \"hook into\" React features dari functional component. Hooks dimulai dengan kata 'use' seperti useState, useEffect, dll.\n\n## Hooks Dasar\n\n### useState\n```javascript\nconst [count, setCount] = useState(0);\n```\n\n### useEffect\n```javascript\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n```\n\n## Custom Hooks\n\nAnda juga bisa membuat custom hooks untuk logic yang bisa digunakan ulang:\n\n```javascript\nfunction useCounter(initialValue = 0) {\n  const [count, setCount] = useState(initialValue);\n  \n  const increment = () => setCount(count + 1);\n  const decrement = () => setCount(count - 1);\n  \n  return { count, increment, decrement };\n}\n```\n\nHooks memberikan fleksibilitas yang luar biasa dalam pengembangan React applications!",
          excerpt: "Pelajari React Hooks dari dasar hingga custom hooks untuk komponen yang lebih powerful.",
          author: "Sari Wijayanti",
          status: "published",
          view_count: 12,
          like_count: 3,
          featured: 0,
          tags: "react,hooks,javascript,frontend",
          created_at: "2025-08-28T10:30:00.000Z",
          updated_at: "2025-08-28T10:30:00.000Z",
          published_at: "2025-08-28T10:30:00.000Z",
          shared_count: 1,
          image_count: 1,
          images: [
            {
              id: 3,
              entity_type: "article",
              entity_id: 2,
              filename: "react-hooks-diagram.png",
              original_name: "React Hooks Lifecycle Diagram",
              mimetype: "image/png",
              size: 15420,
              path: "/pajar/uploads/react-hooks-diagram.png",
              created_at: "2025-08-28T10:30:00.000Z"
            }
          ]
        }
      ];
      setAdminData(prev => ({ ...prev, articles: sampleArticles }));
    }
  }, [adminData.events.length, adminData.users.length, adminData.articles.length]);

  const handleLogout = () => {
    AuthService.logout();
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari panel admin.",
    });
    navigate('/admon');
  };

  const handleDeleteArticle = async (id: number) => {
    const article = adminData.articles.find(a => a.id === id);
    if (article) {
      setDeleteDialog({
        isOpen: true,
        type: 'article',
        id: id,
        title: article.title
      });
    }
  };

  
  const confirmDelete = async () => {
    if (!deleteDialog.id || !deleteDialog.type) return;
    
    setActionLoading(prev => ({ ...prev, [`delete-${deleteDialog.type}-${deleteDialog.id}`]: true }));
    
    try {
      switch (deleteDialog.type) {
        case 'article':
          await deleteArticle(deleteDialog.id);
          break;
        case 'event':
          await deleteEvent(deleteDialog.id);
          break;
        case 'user':
          
          break;
        case 'post':
          await handleConfirmDeletePost(deleteDialog.id);
          break;
        case 'comment':
          await handleConfirmDeleteComment(deleteDialog.id);
          break;
      }
      
      
      setModals(prev => ({
        ...prev,
        articleDetail: { isOpen: false, article: null },
        eventDetail: { isOpen: false, event: null }
      }));
      
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${deleteDialog.type}-${deleteDialog.id}`]: false }));
      setDeleteDialog({ isOpen: false, type: null, id: null, title: '' });
    }
  };

  
  const handleViewArticle = async (id: number) => {
    setActionLoading(prev => ({ ...prev, [`view-article-${id}`]: true }));
    
    try {
      
      const articleData = await apiCall(`/articles/${id}`);
      const article = articleData.article || articleData;
      
      if (article) {
        setModals(prev => ({
          ...prev,
          articleDetail: { isOpen: true, article }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
      toast({
        title: 'Error',
        description: 'Failed to load article details',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`view-article-${id}`]: false }));
    }
  };

  const handleEditArticle = async (id: number) => {
    setActionLoading(prev => ({ ...prev, [`edit-article-${id}`]: true }));
    
    try {
      
      const articleData = await apiCall(`/articles/${id}`);
      const article = articleData.article || articleData;
      
      if (article) {
        setModals(prev => ({
          ...prev,
          articleForm: { isOpen: true, article, mode: 'edit' }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
      toast({
        title: 'Error',
        description: 'Failed to load article for editing',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`edit-article-${id}`]: false }));
    }
  };

  const handleViewEvent = async (id: number) => {
    setActionLoading(prev => ({ ...prev, [`view-event-${id}`]: true }));
    
    try {
      
      const eventData = await apiCall(`/events/${id}`);
      const event = eventData.event || eventData;
      
      if (event) {
        setModals(prev => ({
          ...prev,
          eventDetail: { isOpen: true, event }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event details',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`view-event-${id}`]: false }));
    }
  };

  const handleEditEvent = async (id: number) => {
    setActionLoading(prev => ({ ...prev, [`edit-event-${id}`]: true }));
    
    try {
      
      const eventData = await apiCall(`/events/${id}`);
      const event = eventData.event || eventData;
      
      if (event) {
        setModals(prev => ({
          ...prev,
          eventForm: { isOpen: true, event, mode: 'edit' }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event for editing',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`edit-event-${id}`]: false }));
    }
  };

  const handleDeleteEvent = async (id: number) => {
    const event = adminData.events.find(e => e.id === id);
    if (event) {
      setDeleteDialog({
        isOpen: true,
        type: 'event',
        id: id,
        title: event.title
      });
    }
  };

  const handleEditUser = (id: number) => {
    const user = adminData.users.find(u => u.id === id);
    if (user) {
      setModals(prev => ({
        ...prev,
        userForm: { isOpen: true, user, mode: 'edit' }
      }));
    }
  };

  const handleAddArticle = () => {
    setModals(prev => ({
      ...prev,
      articleForm: { isOpen: true, article: null, mode: 'create' }
    }));
  };

  const handleAddEvent = () => {
    setModals(prev => ({
      ...prev,
      eventForm: { isOpen: true, event: null, mode: 'create' }
    }));
  };

  const handleAddUser = () => {
    setModals(prev => ({
      ...prev,
      userForm: { isOpen: true, user: null, mode: 'create' }
    }));
  };

  
  const closeModal = (modalType: keyof typeof modals) => {
    setModals(prev => {
      const newModals = { ...prev };
      
      
      switch (modalType) {
        case 'articleDetail':
          newModals.articleDetail = { isOpen: false, article: null };
          break;
        case 'eventDetail':
          newModals.eventDetail = { isOpen: false, event: null };
          break;
        case 'articleForm':
          newModals.articleForm = { isOpen: false, article: null, mode: 'create' };
          break;
        case 'eventForm':
          newModals.eventForm = { isOpen: false, event: null, mode: 'create' };
          break;
        case 'userForm':
          newModals.userForm = { isOpen: false, user: null, mode: 'create' };
          break;
      }
      
      return newModals;
    });
  };

  
  const handleSaveArticle = async (articleData: any) => {
    try {
      // Get the correct token - try adminToken first, then regular token
      const token = localStorage.getItem('adminToken') || AuthService.getToken();
      
      if (modals.articleForm.mode === 'create') {
        
        if (articleData instanceof FormData) {
          const response = await fetch('http://localhost:3000/pajar/articles', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: articleData
          });
          
          if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
          }

          // Handle image ID mapping for new articles
          const result = await response.json();
          console.log('Article creation response:', result);

          // If we have uploaded images and the response contains the created images
          if (result.images && result.images.length > 0) {
            const originalContent = articleData.get('content') as string;
            let updatedContent = originalContent;
            let hasChanges = false;

            // Try to map placeholder IDs to real IDs
            result.images.forEach((savedImage: any, index: number) => {
              // Look for temporary placeholders that might match this image
              const tempPlaceholderPattern = /\{\{image:([^}]+)\}\}/g;
              let match;
              
              while ((match = tempPlaceholderPattern.exec(originalContent)) !== null) {
                const placeholderId = match[1];
                // If this is a temporary ID (contains underscore) and we haven't mapped it yet
                if (placeholderId.includes('_') && updatedContent.includes(`{{image:${placeholderId}}}`)) {
                  // Replace the first unmapped placeholder with the real ID
                  updatedContent = updatedContent.replace(`{{image:${placeholderId}}}`, `{{image:${savedImage.id}}}`);
                  hasChanges = true;
                  break; // Move to next saved image
                }
              }
            });

            // If we made changes, update the article content
            if (hasChanges) {
              console.log('Updating article content with real image IDs...');
              const updateFormData = new FormData();
              updateFormData.append('content', updatedContent);

              const updateResponse = await fetch(`http://localhost:3000/pajar/articles/${result.id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: updateFormData
              });

              if (!updateResponse.ok) {
                console.warn('Failed to update article content with real image IDs');
              }
            }
          }
        } else {
          await apiCall('/articles', 'POST', articleData);
        }
        
        toast({
          title: 'Success',
          description: 'Article created successfully!'
        });
      } else {
        
        if (articleData instanceof FormData) {
          const response = await fetch(`http://localhost:3000/pajar/articles/${articleData.get('id')}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: articleData
          });
          
          if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
          }
        } else {
          await apiCall(`/articles/${articleData.id}`, 'PUT', articleData);
        }
        
        toast({
          title: 'Success',
          description: 'Article updated successfully!'
        });
      }
      loadData('articles');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to save article: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      // Get the correct token - try adminToken first, then regular token
      const token = localStorage.getItem('adminToken') || AuthService.getToken();
      
      if (modals.eventForm.mode === 'create') {
        // Handle multipart form data for image upload
        if (eventData instanceof FormData) {
          const response = await fetch('http://localhost:3000/pajar/events', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: eventData
          });
          
          if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
          }

          // Handle image ID mapping for new events
          const result = await response.json();
          console.log('Event creation response:', result);

          // If we have uploaded images and the response contains the created images
          if (result.images && result.images.length > 0) {
            const originalDescription = eventData.get('description') as string;
            let updatedDescription = originalDescription;
            let hasChanges = false;

            // Try to map placeholder IDs to real IDs
            result.images.forEach((savedImage: any, index: number) => {
              // Look for temporary placeholders that might match this image
              const tempPlaceholderPattern = /\{\{image:([^}]+)\}\}/g;
              let match;
              
              while ((match = tempPlaceholderPattern.exec(originalDescription)) !== null) {
                const placeholderId = match[1];
                // If this is a temporary ID (contains underscore) and we haven't mapped it yet
                if (placeholderId.includes('_') && updatedDescription.includes(`{{image:${placeholderId}}}`)) {
                  // Replace the first unmapped placeholder with the real ID
                  updatedDescription = updatedDescription.replace(`{{image:${placeholderId}}}`, `{{image:${savedImage.id}}}`);
                  hasChanges = true;
                  break; // Move to next saved image
                }
              }
            });

            // If we made changes, update the event description
            if (hasChanges) {
              console.log('Updating event description with real image IDs...');
              const updateFormData = new FormData();
              updateFormData.append('description', updatedDescription);

              const updateResponse = await fetch(`http://localhost:3000/pajar/events/${result.id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: updateFormData
              });

              if (!updateResponse.ok) {
                console.warn('Failed to update event with real image IDs');
              }
            }
          }
        } else {
          // Regular JSON creation
          await apiCall('/events', 'POST', eventData);
        }
        toast({
          title: 'Success',
          description: 'Event created successfully!'
        });
      } else {
        // Handle update - can also be FormData for new images
        if (eventData instanceof FormData) {
          const response = await fetch(`http://localhost:3000/pajar/events/${eventData.get('id')}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: eventData
          });
          
          if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
          }
        } else {
          await apiCall(`/events/${eventData.id}`, 'PUT', eventData);
        }
        toast({
          title: 'Success',
          description: 'Event updated successfully!'
        });
      }
      loadData('events');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to save event: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const handleSaveUser = async (userData: any) => {
    try {
      if (modals.userForm.mode === 'create') {
        await apiCall('/auth/create-user', 'POST', userData);
        toast({
          title: 'Success',
          description: 'User created successfully!'
        });
      } else {
        await apiCall(`/auth/users/${userData.id}`, 'PUT', userData);
        toast({
          title: 'Success',
          description: 'User updated successfully!'
        });
      }
      loadData('users');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to save user: ${error}`,
        variant: 'destructive'
      });
    }
  };

  // Handle Posts Management
  const handleDeletePost = (postId: number) => {
    const post = adminData.posts.find(p => p.id === postId);
    setDeleteDialog({
      isOpen: true,
      type: 'post',
      id: postId,
      title: post?.title || 'Postingan ini'
    });
  };

  const handleConfirmDeletePost = async (postId: number) => {
    try {
      setActionLoading(prev => ({ ...prev, [`delete-post-${postId}`]: true }));
      await apiCall(`/posts/${postId}`, 'DELETE');
      toast({
        title: 'Success',
        description: 'Post deleted successfully!'
      });
      loadData('posts');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete post: ${error}`,
        variant: 'destructive'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-post-${postId}`]: false }));
    }
  };

  const handleGetPostStats = async (postId: number) => {
    try {
      const stats = await apiCall(`/posts/${postId}/stats`);
      return stats;
    } catch (error) {
      console.error('Failed to get post stats:', error);
      return null;
    }
  };

  // Handle Comments Management
  const handleDeleteComment = (commentId: number) => {
    const comment = adminData.comments.find(c => c.id === commentId);
    setDeleteDialog({
      isOpen: true,
      type: 'comment',
      id: commentId,
      title: `Komentar dari ${comment?.author || 'user'}`
    });
  };

  const handleConfirmDeleteComment = async (commentId: number) => {
    try {
      setActionLoading(prev => ({ ...prev, [`delete-comment-${commentId}`]: true }));
      await apiCall(`/comments/${commentId}`, 'DELETE');
      toast({
        title: 'Success',
        description: 'Comment deleted successfully!'
      });
      loadData('comments');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete comment: ${error}`,
        variant: 'destructive'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-comment-${commentId}`]: false }));
    }
  };

  const handleApproveComment = async (commentId: number, approved: boolean) => {
    try {
      await apiCall(`/comments/${commentId}`, 'PUT', { is_approved: approved });
      toast({
        title: 'Success',
        description: `Comment ${approved ? 'approved' : 'unapproved'} successfully!`
      });
      loadData('comments');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${approved ? 'approve' : 'unapprove'} comment: ${error}`,
        variant: 'destructive'
      });
    }
  };

  
  const stats = adminData.dashboardStats ? {
    totalArticles: adminData.dashboardStats.overview?.totalArticles || 0,
    publishedArticles: adminData.dashboardStats.overview?.publishedArticles || 0,
    totalPosts: adminData.dashboardStats.overview?.totalPosts || 0,
    totalComments: adminData.dashboardStats.overview?.totalComments || 0,
    totalEvents: Array.isArray(adminData.events) ? adminData.events.length : 0,
    publishedEvents: Array.isArray(adminData.events) ? adminData.events.filter(e => e.status === 'published').length : 0,
    totalUsers: Array.isArray(adminData.users) ? adminData.users.length : 0,
    activeUsers: Array.isArray(adminData.users) ? adminData.users.filter(u => u.last_login).length : 0,
    totalViews: adminData.dashboardStats.dailySummary?.reduce((sum: number, day: any) => sum + (day.count || 0), 0) || 0,
    topPosts: adminData.dashboardStats.topContent?.posts || [],
    topArticles: adminData.dashboardStats.topContent?.articles || [],
    geographicData: adminData.dashboardStats.geographicDistribution || []
  } : {
    
    totalArticles: Array.isArray(adminData.articles) ? adminData.articles.length : 0,
    publishedArticles: Array.isArray(adminData.articles) ? adminData.articles.filter(a => a.status === 'published').length : 0,
    totalPosts: Array.isArray(adminData.posts) ? adminData.posts.length : 0,
    totalComments: Array.isArray(adminData.comments) ? adminData.comments.length : 0,
    totalEvents: Array.isArray(adminData.events) ? adminData.events.length : 0,
    publishedEvents: Array.isArray(adminData.events) ? adminData.events.filter(e => e.status === 'published').length : 0,
    totalUsers: Array.isArray(adminData.users) ? adminData.users.length : 0,
    activeUsers: Array.isArray(adminData.users) ? adminData.users.filter(u => u.last_login).length : 0,
    totalViews: Array.isArray(adminData.articles) ? adminData.articles.reduce((sum, article) => sum + (article.view_count || 0), 0) : 0,
    topPosts: [],
    topArticles: [],
    geographicData: []
  };

  // SearchBox Component
  const SearchBox = ({ 
    value, 
    onChange, 
    placeholder, 
    className = "" 
  }: { 
    value: string; 
    onChange: (value: string) => void; 
    placeholder: string; 
    className?: string; 
  }) => (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          onClick={() => onChange('')}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Panel Admin
              </h1>
              <div className="flex items-center gap-2 mt-1 sm:mt-2">
                <p className="text-sm text-gray-600">Pangan Jawara</p>
                {currentUser && (
                  <>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 hidden sm:inline">
                        {currentUser.username}
                      </span>
                      <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium ${AuthService.getRoleBadgeColor(currentUser.role)}`}>
                        {AuthService.getRoleDisplayName(currentUser.role)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="shadow-sm hover:shadow-md transition-all ml-4 flex-shrink-0">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          {/* Tab Loading Overlay */}
          {tabLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading data...</p>
              </div>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <TabsList className="grid w-full grid-cols-9 bg-white/50 backdrop-blur-sm p-1 rounded-xl shadow-sm border">
                <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="articles" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                  Artikel
                </TabsTrigger>
                <TabsTrigger value="posts" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="comments" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                  Komentar
                </TabsTrigger>
                <TabsTrigger value="events" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                  Events
                </TabsTrigger>
                {AuthService.canAccess('users') && (
                  <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                    Users
                  </TabsTrigger>
                )}
                <TabsTrigger value="health" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                  Health
                </TabsTrigger>
                <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                  Security
                </TabsTrigger>
                {AuthService.canAccess('settings') && (
                  <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md">
                    Pengaturan
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Select value={activeTab} onValueChange={handleTabChange}>
                <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border rounded-xl shadow-sm">
                  <SelectValue placeholder="Pilih Menu" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="overview" className="rounded-lg">
                    📊 Overview
                  </SelectItem>
                  <SelectItem value="articles" className="rounded-lg">
                    📝 Artikel
                  </SelectItem>
                  <SelectItem value="posts" className="rounded-lg">
                    💬 Posts
                  </SelectItem>
                  <SelectItem value="comments" className="rounded-lg">
                    💭 Komentar
                  </SelectItem>
                  <SelectItem value="events" className="rounded-lg">
                    📅 Events
                  </SelectItem>
                  {AuthService.canAccess('users') && (
                    <SelectItem value="users" className="rounded-lg">
                      👥 Users
                    </SelectItem>
                  )}
                  <SelectItem value="health" className="rounded-lg">
                    💚 Health
                  </SelectItem>
                  <SelectItem value="security" className="rounded-lg">
                    🔒 Security
                  </SelectItem>
                  {AuthService.canAccess('settings') && (
                    <SelectItem value="settings" className="rounded-lg">
                      ⚙️ Pengaturan
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">Total Artikel</CardTitle>
                  <FileText className="h-5 w-5 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalArticles}</div>
                  <p className="text-xs text-blue-200">
                    {stats.publishedArticles} terpublikasi
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-100">Total Posts</CardTitle>
                  <FileText className="h-5 w-5 text-indigo-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalPosts}</div>
                  <p className="text-xs text-indigo-200">
                    Forum posts
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">Total Events</CardTitle>
                  <Calendar className="h-5 w-5 text-purple-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalEvents}</div>
                  <p className="text-xs text-purple-200">
                    {stats.publishedEvents} terpublikasi
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-100">Total Comments</CardTitle>
                  <Activity className="h-5 w-5 text-orange-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalComments}</div>
                  <p className="text-xs text-orange-200">
                    Forum comments
                  </p>
                </CardContent>
              </Card>
              
              {/* Total Users - Super Admin Only */}
              {AuthService.canAccess('users') && (
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-100">Total Users</CardTitle>
                    <Users className="h-5 w-5 text-green-200" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-green-200">
                      {stats.activeUsers} aktif
                    </p>
                  </CardContent>
                </Card>
              )}
              
              <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-teal-100">Total Views</CardTitle>
                  <BarChart3 className="h-5 w-5 text-teal-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-teal-200">
                    {adminData.dashboardStats?.period || "Last 30 days"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Cards */}
            {adminData.dashboardStats && (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {/* Top Posts */}
                {stats.topPosts.length > 0 && (
                  <Card className="bg-white/60 backdrop-blur-sm shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Top Posts
                      </CardTitle>
                      <CardDescription>Posts dengan views tertinggi</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {stats.topPosts.slice(0, 5).map((post: any, index: number) => (
                          <div key={post.entity_id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium text-gray-700">Post #{post.entity_id}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">{post.total_count} views</div>
                              <div className="text-xs text-gray-500">{post.unique_count} unique</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Articles */}
                {stats.topArticles.length > 0 && (
                  <Card className="bg-white/60 backdrop-blur-sm shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        Top Articles
                      </CardTitle>
                      <CardDescription>Artikel dengan views tertinggi</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {stats.topArticles.slice(0, 5).map((article: any, index: number) => (
                          <div key={article.entity_id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full text-xs font-semibold">
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium text-gray-700">Article #{article.entity_id}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">{article.total_count} views</div>
                              <div className="text-xs text-gray-500">{article.unique_count} unique</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Geographic Distribution */}
                {stats.geographicData.length > 0 && (
                  <Card className="bg-white/60 backdrop-blur-sm shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        Geographic Distribution
                      </CardTitle>
                      <CardDescription>Distribusi pengguna berdasarkan lokasi</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {stats.geographicData.slice(0, 5).map((location: any, index: number) => (
                          <div key={`${location.country}-${location.city}-${index}`} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium text-gray-700">{location.city}, {location.country}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">{location.count} views</div>
                              <div className="text-xs text-gray-500">{location.unique_users} users</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Recent Articles */}
            <Card className="bg-white/60 backdrop-blur-sm shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Artikel Terbaru
                </CardTitle>
                <CardDescription>Artikel yang baru saja ditambahkan atau diubah</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Array.isArray(adminData.articles) && adminData.articles.length > 0 ? (
                    adminData.articles.slice(0, 3).map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{article.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            By {article.author} • {new Date(article.created_at).toLocaleDateString('id-ID')} • 
                            <span className="inline-flex items-center ml-1">
                              <Eye className="h-3 w-3 mr-1" />
                              {article.view_count || 0} views
                            </span>
                          </p>
                        </div>
                        <div className="ml-4">
                          <StatusBadge status={article.status} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Belum ada artikel</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            <RoleGuard feature="articles">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Manajemen Artikel
                  </h2>
                  <p className="text-gray-600 mt-1">Kelola semua artikel di platform</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 min-w-0 sm:min-w-[300px]">
                  <SearchBox
                    value={searchQueries.articles}
                    onChange={(value) => handleSearchChange('articles', value)}
                    placeholder="Cari artikel..."
                    className="flex-1"
                  />
                  <AddButton type="article" onClick={handleAddArticle} />
                </div>
              </div>

              <Card className="bg-white/60 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-0">
                  {Array.isArray(adminData.articles) && filterArticles(adminData.articles).length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {filterArticles(adminData.articles).map((article) => (
                        <div key={article.id} className="p-4 sm:p-6 hover:bg-blue-50/50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <h3 className="font-semibold text-lg text-gray-900 truncate">
                                  {highlightSearchText(article.title, searchQueries.articles)}
                                </h3>
                                <StatusBadge status={article.status} />
                              </div>
                              <div className="text-gray-600 mt-2 leading-relaxed">
                                {createPreviewText(article.content || '', article.images)}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-sm text-gray-500">
                                <span className="whitespace-nowrap">By {article.author}</span>
                                <span className="hidden sm:inline text-gray-300">•</span>
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(article.created_at).toLocaleDateString('id-ID')}
                                </span>
                                <span className="hidden sm:inline text-gray-300">•</span>
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <Eye className="h-3 w-3" />
                                  {article.view_count} views
                                </span>
                              </div>
                            </div>
                            <div className="flex sm:ml-4 justify-end">
                              <ArticleActions
                                article={article}
                                onView={handleViewArticle}
                                onEdit={handleEditArticle}
                                onDelete={handleDeleteArticle}
                                loading={actionLoading}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      {searchQueries.articles.trim() ? (
                        <>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada artikel ditemukan</h3>
                          <p>Coba ubah kata kunci pencarian untuk "{searchQueries.articles}"</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada artikel</h3>
                          <p>Mulai dengan menambahkan artikel baru</p>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </RoleGuard>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Manajemen Posts Komunitas
                </h2>
                <p className="text-gray-600 mt-1">Kelola semua postingan komunitas di platform</p>
              </div>
              <SearchBox
                value={searchQueries.posts}
                onChange={(value) => handleSearchChange('posts', value)}
                placeholder="Cari posts..."
                className="min-w-0 sm:min-w-[300px]"
              />
            </div>

            <Card className="bg-white/60 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-0">
                {Array.isArray(adminData.posts) && filterPosts(adminData.posts).length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filterPosts(adminData.posts).map((post) => (
                      <div key={post.id} className="p-4 sm:p-6 hover:bg-indigo-50/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              <h3 className="font-semibold text-lg text-gray-900 truncate">
                                {highlightSearchText(post.title, searchQueries.posts)}
                              </h3>
                              {post.is_published !== undefined && (
                                <Badge variant={post.is_published ? "default" : "secondary"}>
                                  {post.is_published ? 'Published' : 'Draft'}
                                </Badge>
                              )}
                            </div>
                            <div className="text-gray-600 mt-2 leading-relaxed">
                              {createPreviewText(post.content || '', post.images)}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-sm text-gray-500">
                              <span className="whitespace-nowrap">
                                By {highlightSearchText(post.author, searchQueries.posts)}
                              </span>
                              <span className="hidden sm:inline text-gray-300">•</span>
                              <span className="flex items-center gap-1 whitespace-nowrap">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.created_at).toLocaleDateString('id-ID')}
                              </span>
                              <span className="hidden sm:inline text-gray-300">•</span>
                              <span className="flex items-center gap-1 whitespace-nowrap">
                                <Eye className="h-3 w-3" />
                                {post.view_count || 0} views
                              </span>
                              <span className="hidden sm:inline text-gray-300">•</span>
                              <span className="flex items-center gap-1 whitespace-nowrap">
                                <Activity className="h-3 w-3" />
                                {post.like_count || 0} likes
                              </span>
                            </div>
                          </div>
                          <div className="flex sm:ml-4 justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGetPostStats(post.id)}
                              className="rounded-full"
                            >
                              <BarChart3 className="h-4 w-4 mr-1" />
                              Stats
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="rounded-full"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    {searchQueries.posts.trim() ? (
                      <>
                        <p className="text-lg font-medium text-gray-900 mb-2">Tidak ada postingan ditemukan</p>
                        <p className="text-sm">Coba ubah kata kunci pencarian untuk "{searchQueries.posts}"</p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-medium">Tidak ada postingan</p>
                        <p className="text-sm">Belum ada postingan komunitas yang tersedia.</p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Manajemen Komentar
                </h2>
                <p className="text-gray-600 mt-1">Kelola semua komentar di platform</p>
              </div>
              <SearchBox
                value={searchQueries.comments}
                onChange={(value) => handleSearchChange('comments', value)}
                placeholder="Cari komentar..."
                className="min-w-0 sm:min-w-[300px]"
              />
            </div>

            <Card className="bg-white/60 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-0">
                {Array.isArray(adminData.comments) && filterComments(adminData.comments).length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filterComments(adminData.comments).map((comment) => (
                      <div key={comment.id} className="p-4 sm:p-6 hover:bg-orange-50/50 transition-colors">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900">{comment.author}</span>
                                {comment.is_approved !== undefined && (
                                  <Badge variant={comment.is_approved ? "default" : "secondary"}>
                                    {comment.is_approved ? 'Approved' : 'Pending'}
                                  </Badge>
                                )}
                                {comment.parent_id && (
                                  <Badge variant="outline">Reply</Badge>
                                )}
                              </div>
                              <div className="text-gray-700 mb-3 leading-relaxed">
                                {comment.content}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(comment.created_at).toLocaleDateString('id-ID')}
                                </span>
                                {comment.post_id && (
                                  <>
                                    <span className="hidden sm:inline text-gray-300">•</span>
                                    <span>Post ID: {comment.post_id}</span>
                                  </>
                                )}
                                {comment.article_id && (
                                  <>
                                    <span className="hidden sm:inline text-gray-300">•</span>
                                    <span>Article ID: {comment.article_id}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {comment.is_approved !== undefined && !comment.is_approved && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleApproveComment(comment.id, true)}
                                  className="rounded-full text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  ✓ Approve
                                </Button>
                              )}
                              {comment.is_approved && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleApproveComment(comment.id, false)}
                                  className="rounded-full text-orange-600 border-orange-200 hover:bg-orange-50"
                                >
                                  ✗ Unapprove
                                </Button>
                              )}
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="rounded-full"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    {searchQueries.comments.trim() ? (
                      <>
                        <p className="text-lg font-medium text-gray-900 mb-2">Tidak ada komentar ditemukan</p>
                        <p className="text-sm">Coba ubah kata kunci pencarian untuk "{searchQueries.comments}"</p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-medium">Tidak ada komentar</p>
                        <p className="text-sm">Belum ada komentar yang tersedia.</p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <RoleGuard feature="articles">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Manajemen Events
                  </h2>
                  <p className="text-gray-600 mt-1">Kelola semua event di platform</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 min-w-0 sm:min-w-[300px]">
                  <SearchBox
                    value={searchQueries.events}
                    onChange={(value) => handleSearchChange('events', value)}
                    placeholder="Cari events..."
                    className="flex-1"
                  />
                  <AddButton type="event" onClick={handleAddEvent} />
                </div>
              </div>

              <Card className="bg-white/60 backdrop-blur-sm shadow-lg border-0">
                <CardContent className="p-0">
                  {Array.isArray(adminData.events) && filterEvents(adminData.events).length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {filterEvents(adminData.events).map((event) => (
                        <div key={event.id} className="p-4 sm:p-6 hover:bg-indigo-50/50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <h3 className="font-semibold text-lg text-gray-900 truncate">{event.title}</h3>
                                <StatusBadge status={event.status} priority={event.priority} />
                              </div>
                              <div className="text-gray-600 mt-2 leading-relaxed">
                                {createPreviewText(event.description || '', event.images)}
                              </div>
                              <div className="mt-3">
                                <EventInfo event={event} />
                              </div>
                            </div>
                            <div className="flex sm:ml-4 justify-end">
                              <EventActions
                                event={event}
                                onView={handleViewEvent}
                                onEdit={handleEditEvent}
                                onDelete={handleDeleteEvent}
                                loading={actionLoading}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      {searchQueries.events.trim() ? (
                        <>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada event ditemukan</h3>
                          <p>Coba ubah kata kunci pencarian untuk "{searchQueries.events}"</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada event</h3>
                          <p>Mulai dengan menambahkan event baru</p>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </RoleGuard>
          </TabsContent>

          {/* Users Tab - Super Admin Only */}
          {AuthService.canAccess('users') && (
            <TabsContent value="users" className="space-y-6">
              <RoleGuard feature="users">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Manajemen Users
                    </h2>
                    <p className="text-gray-600 mt-1">Kelola pengguna platform</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 min-w-0 sm:min-w-[300px]">
                    <SearchBox
                      value={searchQueries.users}
                      onChange={(value) => handleSearchChange('users', value)}
                      placeholder="Cari users..."
                      className="flex-1"
                    />
                    {/* Only Super Admin can add users */}
                    {(AuthService.hasRole('superadmin') || AuthService.hasRole('super_admin')) && (
                      <AddButton type="user" onClick={handleAddUser} />
                    )}
                  </div>
                </div>

                <Card className="bg-white/60 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-0">
                    {Array.isArray(adminData.users) && filterUsers(adminData.users).length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {filterUsers(adminData.users).map((user) => (
                          <div key={user.id} className="p-4 sm:p-6 hover:bg-green-50/50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-lg text-gray-900 truncate">{user.username}</h3>
                                </div>
                                <p className="text-gray-600 mt-2 truncate">{user.email}</p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-sm text-gray-500">
                                  <span className="whitespace-nowrap">Role: {user.role}</span>
                                  <span className="hidden sm:inline text-gray-300">•</span>
                                  <span className="flex items-center gap-1 whitespace-nowrap">
                                    <Calendar className="h-3 w-3" />
                                    Bergabung {new Date(user.created_at).toLocaleDateString('id-ID')}
                                  </span>
                                  {user.last_login && (
                                    <>
                                      <span className="hidden sm:inline text-gray-300">•</span>
                                      <span className="flex items-center gap-1 whitespace-nowrap">
                                        <Activity className="h-3 w-3" />
                                        Last login: {new Date(user.last_login).toLocaleDateString('id-ID')}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex sm:ml-4 justify-end">
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditUser(user.id)}
                                    className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                    title="Edit user"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        {searchQueries.users.trim() ? (
                          <>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada user ditemukan</h3>
                            <p>Coba ubah kata kunci pencarian untuk "{searchQueries.users}"</p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada user</h3>
                            <p>Data user akan muncul di sini</p>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </RoleGuard>
            </TabsContent>
          )}

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <HealthDashboard />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <RoleGuard feature="security">
              <SecurityLogs />
            </RoleGuard>
          </TabsContent>

          {/* Settings Tab - Super Admin Only */}
          {AuthService.canAccess('settings') && (
            <TabsContent value="settings" className="space-y-6">
              <RoleGuard feature="settings">
                <div>
                  <h2 className="text-xl font-semibold">Pengaturan Sistem</h2>
                  <p className="text-gray-600">Konfigurasi aplikasi dan sistem</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pengaturan Umum</CardTitle>
                      <CardDescription>Konfigurasi dasar aplikasi</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Konfigurasi Situs
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Manajemen Role
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Template Email
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Data & Backup</CardTitle>
                      <CardDescription>Pengelolaan data dan backup</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Backup Database
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Log Sistem
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </RoleGuard>
            </TabsContent>
          )}
        </Tabs>
        </div>
      </div>

      {/* Modals */}
      <ArticleDetailModal
        article={modals.articleDetail.article}
        isOpen={modals.articleDetail.isOpen}
        onClose={() => closeModal('articleDetail')}
        onEdit={handleEditArticle}
        onDelete={handleDeleteArticle}
      />

      <EventDetailModal
        event={modals.eventDetail.event}
        isOpen={modals.eventDetail.isOpen}
        onClose={() => closeModal('eventDetail')}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      <ArticleFormModal
        article={modals.articleForm.article}
        isOpen={modals.articleForm.isOpen}
        onClose={() => closeModal('articleForm')}
        onSave={handleSaveArticle}
        mode={modals.articleForm.mode}
      />

      <EventFormModal
        event={modals.eventForm.event}
        isOpen={modals.eventForm.isOpen}
        onClose={() => closeModal('eventForm')}
        onSave={handleSaveEvent}
        mode={modals.eventForm.mode}
      />

      <UserFormModal
        user={modals.userForm.user}
        isOpen={modals.userForm.isOpen}
        onClose={() => closeModal('userForm')}
        onSave={handleSaveUser}
        mode={modals.userForm.mode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, type: null, id: null, title: '' })}>
        <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-gray-900">
              Konfirmasi Hapus {
                deleteDialog.type === 'article' ? 'Artikel' : 
                deleteDialog.type === 'event' ? 'Event' : 
                deleteDialog.type === 'post' ? 'Postingan' :
                deleteDialog.type === 'comment' ? 'Komentar' : 'User'
              }
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 mt-2">
              Apakah Anda yakin ingin menghapus {
                deleteDialog.type === 'article' ? 'artikel' : 
                deleteDialog.type === 'event' ? 'event' : 
                deleteDialog.type === 'post' ? 'postingan' :
                deleteDialog.type === 'comment' ? 'komentar' : 'user'
              } "{deleteDialog.title}"? 
              <br />
              <span className="text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel 
              className="rounded-xl border-gray-200 hover:bg-gray-50"
              disabled={actionLoading[`delete-${deleteDialog.type}-${deleteDialog.id}`]}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={actionLoading[`delete-${deleteDialog.type}-${deleteDialog.id}`]}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {actionLoading[`delete-${deleteDialog.type}-${deleteDialog.id}`] ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menghapus...
                </div>
              ) : (
                'Ya, Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
