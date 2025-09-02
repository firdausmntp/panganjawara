import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
  category: string;
  tags: string[];
}

const ArticleManagement = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([
    {
      id: 1,
      title: 'Panduan Ketahanan Pangan untuk Petani',
      content: 'Ketahanan pangan merupakan kondisi terpenuhinya pangan bagi negara sampai dengan perseorangan...',
      author: 'Admin',
      date: '2024-01-15',
      status: 'published',
      views: 1250,
      category: 'Edukasi',
      tags: ['pertanian', 'ketahanan pangan', 'petani']
    },
    {
      id: 2,
      title: 'Teknologi Modern dalam Pertanian',
      content: 'Perkembangan teknologi modern telah membawa perubahan signifikan dalam dunia pertanian...',
      author: 'Admin',
      date: '2024-01-10',
      status: 'draft',
      views: 0,
      category: 'Teknologi',
      tags: ['teknologi', 'pertanian modern', 'inovasi']
    },
    {
      id: 3,
      title: 'Strategi Menghadapi Krisis Pangan',
      content: 'Krisis pangan dapat terjadi kapan saja dan memerlukan strategi yang tepat untuk mengatasinya...',
      author: 'Admin',
      date: '2024-01-08',
      status: 'published',
      views: 890,
      category: 'Strategi',
      tags: ['krisis pangan', 'strategi', 'manajemen']
    }
  ]);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isNewArticle, setIsNewArticle] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    status: 'draft' as 'published' | 'draft' | 'archived',
    tags: ''
  });

  const categories = ['Edukasi', 'Teknologi', 'Strategi', 'Berita', 'Tips'];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category,
      status: article.status,
      tags: article.tags.join(', ')
    });
    setIsNewArticle(false);
    setIsEditDialogOpen(true);
  };

  const handleNew = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      content: '',
      category: '',
      status: 'draft',
      tags: ''
    });
    setIsNewArticle(true);
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.content || !formData.category) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi.",
        variant: "destructive"
      });
      return;
    }

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    if (isNewArticle) {
      // Add new article
      const newArticle: Article = {
        id: Math.max(...articles.map(a => a.id)) + 1,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        status: formData.status,
        tags: tagsArray,
        author: 'Admin',
        date: new Date().toISOString().split('T')[0],
        views: 0
      };
      setArticles(prev => [...prev, newArticle]);
      toast({
        title: "Artikel dibuat",
        description: "Artikel baru berhasil dibuat.",
      });
    } else if (editingArticle) {
      // Update existing article
      setArticles(prev => prev.map(article =>
        article.id === editingArticle.id
          ? {
              ...article,
              title: formData.title,
              content: formData.content,
              category: formData.category,
              status: formData.status,
              tags: tagsArray
            }
          : article
      ));
      toast({
        title: "Artikel diperbarui",
        description: "Artikel berhasil diperbarui.",
      });
    }

    setIsEditDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setArticles(prev => prev.filter(article => article.id !== id));
    toast({
      title: "Artikel dihapus",
      description: "Artikel berhasil dihapus.",
    });
  };

  const handleStatusChange = (id: number, newStatus: 'published' | 'draft' | 'archived') => {
    setArticles(prev => prev.map(article =>
      article.id === id ? { ...article, status: newStatus } : article
    ));
    toast({
      title: "Status diubah",
      description: `Artikel berhasil diubah ke status ${newStatus}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manajemen Artikel</h2>
          <p className="text-gray-600">Kelola semua artikel di platform</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Artikel
        </Button>
      </div>

      {/* Articles List */}
      <div className="grid gap-4">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{article.title}</h3>
                    <Badge variant={getStatusBadgeColor(article.status)}>
                      {article.status}
                    </Badge>
                    <Badge variant="outline">{article.category}</Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {article.content.substring(0, 200)}...
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    By {article.author} • {article.date} • {article.views} views
                  </p>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Select
                    value={article.status}
                    onValueChange={(value: 'published' | 'draft' | 'archived') =>
                      handleStatusChange(article.id, value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(article)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(article.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Article Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewArticle ? 'Tambah Artikel Baru' : 'Edit Artikel'}
            </DialogTitle>
            <DialogDescription>
              {isNewArticle 
                ? 'Buat artikel baru untuk platform ketahanan pangan'
                : 'Ubah informasi artikel yang dipilih'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Artikel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Masukkan judul artikel"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select value={formData.category} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Konten Artikel *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Tulis konten artikel di sini..."
                rows={10}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="pertanian, teknologi, strategi"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'published' | 'draft' | 'archived') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {isNewArticle ? 'Buat Artikel' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArticleManagement;
