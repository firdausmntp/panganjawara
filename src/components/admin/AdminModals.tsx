import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Eye, Edit2, Trash2, Upload, X, Image as ImageIcon, Move, Video, Link, Key } from 'lucide-react';
import { MarkdownRenderer } from '@/lib/markdown';
import { useToast } from '@/hooks/use-toast';

// Article Detail Modal
interface ArticleDetailModalProps {
  article: {
    id: number;
    title: string;
    content: string;
    author: string;
    created_at: string;
    status: string;
    view_count: number;
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
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ArticleDetailModal = ({ article, isOpen, onClose, onEdit, onDelete }: ArticleDetailModalProps) => {
  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto rounded-3xl border-0 shadow-2xl p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-6 rounded-t-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">{article?.title || 'Article Details'}</DialogTitle>
            <DialogDescription className="sr-only">
              Detailed view of article: {article?.title || 'Article'}
            </DialogDescription>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-600">
              <Badge variant={article?.status === 'published' ? 'default' : 'secondary'} className="rounded-full">
                {article?.status}
              </Badge>
              <span className="text-gray-400">•</span>
              <span>By {article?.author}</span>
              <span className="text-gray-400">•</span>
              <span>{article?.created_at ? new Date(article.created_at).toLocaleDateString('id-ID') : 'N/A'}</span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {article?.view_count || 0} views
              </span>
            </div>
          </DialogHeader>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Content</h3>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <MarkdownRenderer 
                content={article?.content || ''} 
                images={article?.images} 
              />
            </div>
          </div>

          {/* Image Gallery */}
          {article?.images && article.images.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Image Gallery ({article.images.length} {article.images.length === 1 ? 'image' : 'images'})
              </h3>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 mb-4">
                <p className="text-sm text-blue-700 font-medium mb-2">📸 Image Placeholders Guide:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-600">
                  <div>• <code>{`{{image:id}}`}</code> → Show specific image by ID</div>
                  <div>• <code>{`{{img:filename}}`}</code> → Show image by filename</div>
                  <div>• <code>{`{{image}}`}</code> → Show first image</div>
                  <div>• Place anywhere in content text</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {article?.images?.map((image) => (
                  <div key={image.id} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <img 
                      src={`http://localhost:3000${image.path}`}
                      alt={image.original_name}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                    <div className="text-xs space-y-1">
                      <p className="font-medium text-gray-900 truncate" title={image.original_name}>
                        {image.original_name}
                      </p>
                      <div className="flex justify-between text-gray-500">
                        <span>ID: {image.id}</span>
                        <span>{(image.size / 1024).toFixed(1)}KB</span>
                      </div>
                      <div className="bg-gray-100 rounded px-2 py-1 font-mono text-xs text-center">
                        {`{{image:${image.id}}}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {article?.tags && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article?.tags?.split(',').map((tag, index) => (
                  <Badge key={index} variant="outline" className="rounded-full">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-6 rounded-b-3xl">
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-2xl">
              Tutup
            </Button>
            <Button onClick={() => onEdit(article.id)} className="rounded-2xl bg-blue-600 hover:bg-blue-700">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => onDelete(article.id)} className="rounded-2xl">
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Event Detail Modal
interface EventDetailModalProps {
  event: {
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
    status: string;
    priority?: string;
    images?: any[];
    image_count?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const EventDetailModal = ({ event, isOpen, onClose, onEdit, onDelete }: EventDetailModalProps) => {
  if (!event) return null;

  const eventDate = new Date(event?.event_date || new Date());
  const duration = event?.duration_minutes || 0;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-y-auto rounded-3xl border-0 shadow-2xl p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-6 rounded-t-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">{event?.title || 'Event Details'}</DialogTitle>
            <DialogDescription className="sr-only">
              Detailed view of event: {event?.title || 'Event'}
            </DialogDescription>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
              <Badge variant={event?.status === 'published' ? 'default' : 'secondary'} className="rounded-full">
                {event?.status}
              </Badge>
              {event?.priority && event.priority !== 'normal' && (
                <Badge variant={event.priority === 'urgent' ? 'destructive' : 'secondary'} className="rounded-full">
                  {event.priority}
                </Badge>
              )}
            </div>
          </DialogHeader>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Description</h3>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <MarkdownRenderer content={event?.description || ''} images={event?.images} />
            </div>
            
            {/* Debug info - show available images and placeholders */}
            {process.env.NODE_ENV === 'development' && event?.images && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                <p className="font-medium text-yellow-800">Debug Info:</p>
                <p className="text-yellow-700">Available images: {event.images.map(img => `${img.id} (${img.original_name})`).join(', ')}</p>
                <p className="text-yellow-700">Description placeholders: {(event.description?.match(/\{\{image:[^}]+\}\}/g) || []).join(', ')}</p>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Date</p>
                  <p className="text-sm text-gray-600">{eventDate.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-2xl">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Time</p>
                  <p className="text-sm text-gray-600">{eventDate.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-2xl">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Duration</p>
                  <p className="text-sm text-gray-600">
                    {hours > 0 && `${hours} hours `}
                    {minutes > 0 && `${minutes} minutes`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-2xl">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Max Participants</p>
                  <p className="text-sm text-gray-600">{event?.max_participants}</p>
                </div>
              </div>
            </div>
          </div>
          
          {event?.location && (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl">
              <div className="p-2 bg-red-100 rounded-xl">
                <MapPin className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>
            </div>
          )}

          {/* Zoom Meeting Information */}
          {event?.zoom_link && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Zoom Meeting Details</h3>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Meeting Link</p>
                      <a 
                        href={event.zoom_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {event.zoom_link}
                      </a>
                    </div>
                  </div>
                  
                  {event.zoom_meeting_id && (
                    <div className="flex items-center gap-3">
                      <Link className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Meeting ID</p>
                        <p className="text-sm text-blue-600">{event.zoom_meeting_id}</p>
                      </div>
                    </div>
                  )}
                  
                  {event.zoom_password && (
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Password</p>
                        <p className="text-sm text-blue-600">{event.zoom_password}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Images Gallery */}
          {event?.images && event.images.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">
                Event Images ({event.images.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.images.map((image: any) => (
                  <div key={image.id} className="group relative bg-gray-100 rounded-2xl overflow-hidden aspect-video">
                    <img
                      src={`http://localhost:3000${image.path}`}
                      alt={image.original_name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium truncate">
                        {image.original_name}
                      </p>
                      <p className="text-white/80 text-xs">
                        {(image.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-6 rounded-b-3xl">
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-2xl">
              Tutup
            </Button>
            <Button onClick={() => onEdit(event.id)} className="rounded-2xl bg-indigo-600 hover:bg-indigo-700">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => onDelete(event.id)} className="rounded-2xl">
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Article Form Modal (Create/Edit)
interface ArticleFormModalProps {
  article?: {
    id: number;
    title: string;
    content: string;
    status: string;
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
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (articleData: any) => void;
  mode: 'create' | 'edit';
}

export const ArticleFormModal = ({ article, isOpen, onClose, onSave, mode }: ArticleFormModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: article?.title || '',
    content: article?.content || '',
    status: article?.status || 'draft',
    tags: article?.tags || ''
  });

  // State for image management
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ file: File; url: string; id: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Update form data when article prop changes (for fresh data from API)
  useEffect(() => {
    if (article && isOpen) {
      setFormData({
        title: article.title || '',
        content: article.content || '',
        status: article.status || 'draft',
        tags: article.tags || ''
      });
    }
  }, [article, isOpen]);

  // Reset images when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedImages([]);
      setImagePreviews([]);
    }
  }, [isOpen]);

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    
    imageFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setSelectedImages(prev => [...prev, file]);
      setImagePreviews(prev => [...prev, { file, url, id }]);
    });
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Remove image
  const removeImage = (id: string) => {
    setImagePreviews(prev => {
      const item = prev.find(p => p.id === id);
      if (item) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter(p => p.id !== id);
    });
    setSelectedImages(prev => {
      const index = imagePreviews.findIndex(p => p.id === id);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Add image placeholder to content
  const addImageToContent = (id: string) => {
    const placeholder = `{{image:${id}}}`;
    setFormData(prev => ({
      ...prev,
      content: prev.content + '\n\n' + placeholder + '\n\n'
    }));
  };

  // Handle save with image upload
  const handleSave = async () => {
    setUploading(true);
    try {
      // Prepare FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Add article data
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('tags', formData.tags);
      
      if (mode === 'edit' && article?.id) {
        formDataToSend.append('id', article.id.toString());
      }
      
      // Add images with their temporary IDs for mapping
      selectedImages.forEach((file, index) => {
        const preview = imagePreviews[index];
        formDataToSend.append('images', file);
        if (preview) {
          formDataToSend.append('imageIds', preview.id); // Send temp ID for mapping
        }
      });
      
      // Call save with FormData
      await onSave(formDataToSend);
      onClose();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: 'Error',
        description: 'Failed to save article. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: article?.title || '',
      content: article?.content || '',
      status: article?.status || 'draft',
      tags: article?.tags || ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-y-auto rounded-3xl border-0 shadow-2xl p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-6 rounded-t-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Buat Artikel Baru' : 'Edit Artikel'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {mode === 'create' 
                ? 'Buat artikel baru untuk platform Anda'
                : 'Lakukan perubahan pada artikel ini'
              }
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-900">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Masukkan judul artikel"
              className="rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
            <div className="space-y-3">
              <Label htmlFor="content" className="text-sm font-semibold text-gray-900">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Tulis konten artikel Anda di sini... Mendukung Markdown:\n\n## Heading 2\n**Bold text**\n*Italic text*\n`Code`\n{{image:1}} - untuk gambar\n- List item"
                className="min-h-[400px] resize-none rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
              />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-2">📝 Markdown Support:</p>
                  <div className="space-y-1 text-xs text-blue-600">
                    <div>• ## Heading → <strong>Header</strong></div>
                    <div>• **text** → <strong>Bold</strong></div>
                    <div>• *text* → <em>Italic</em></div>
                    <div>• `code` → <code className="bg-blue-100 px-1 rounded">code</code></div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
                  <p className="text-xs text-green-700 font-medium mb-2">📸 Image Placeholders:</p>
                  <div className="space-y-1 text-xs text-green-600">
                    <div>• <code className="bg-green-100 px-1 rounded">{`{{image:id}}`}</code> → Specific image</div>
                    <div>• <code className="bg-green-100 px-1 rounded">{`{{img:filename}}`}</code> → By filename</div>
                    <div>• <code className="bg-green-100 px-1 rounded">{`{{image}}`}</code> → First image</div>
                    <div>• Place anywhere in text</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery for Reference */}
            {article?.images && article.images.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">
                  Available Images ({article.images.length})
                </Label>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {article.images.map((image) => (
                      <div key={image.id} className="bg-white rounded-lg p-2 border border-gray-200">
                        <img 
                          src={`http://localhost:3000${image.path}`}
                          alt={image.original_name}
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                        <div className="text-xs space-y-1">
                          <p className="font-medium text-gray-900 truncate" title={image.original_name}>
                            {image.original_name}
                          </p>
                          <div className="bg-blue-100 rounded px-1 py-0.5 font-mono text-center cursor-pointer"
                               onClick={() => {
                                 const placeholder = `{{image:${image.id}}}`;
                                 setFormData(prev => ({ ...prev, content: prev.content + '\n' + placeholder }));
                               }}
                               title="Click to add to content">
                            {`{{image:${image.id}}}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    💡 Click on image placeholder to add it to content
                  </p>
                </div>
              </div>
            )}

            {/* Image Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="images" className="text-sm font-semibold text-gray-900">Upload New Images</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl"
                >
                  <Upload className="h-4 w-4" />
                  Choose Files
                </Button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />

              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-2xl p-6 text-center transition-colors
                  ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                `}
              >
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Drag & drop images here, or{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse files
                  </button>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports: JPG, PNG, GIF, WebP
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-900">
                    Selected Images ({imagePreviews.length})
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto rounded-2xl border border-gray-200 p-4 bg-gray-50">
                    {imagePreviews.map((preview) => (
                      <div key={preview.id} className="relative group border rounded-xl overflow-hidden bg-white">
                        <img
                          src={preview.url}
                          alt="Preview"
                          className="w-full h-24 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="h-6 w-6 p-0"
                              onClick={() => addImageToContent(preview.id)}
                              title="Add to content"
                            >
                              <Move className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="h-6 w-6 p-0"
                              onClick={() => removeImage(preview.id)}
                              title="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 truncate">
                          {preview.file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <p className="font-medium mb-2">💡 Image Positioning Tips:</p>
                    <ul className="text-xs space-y-1">
                      <li className="flex items-center gap-1">
                        • Click <Move className="inline h-3 w-3" /> to add image placeholder to content
                      </li>
                      <li>• Use placeholders: <code className="bg-blue-100 px-1 rounded">{`{{image:${imagePreviews[0]?.id || 'id'}}}`}</code> or <code className="bg-blue-100 px-1 rounded">{`{{image}}`}</code></li>
                      <li>• Position images anywhere in your content by moving the placeholders</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-900">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="rounded-2xl border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="tags" className="text-sm font-semibold text-gray-900">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3"
                className="rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-6 rounded-b-3xl">
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-2xl">
              Batal
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.title.trim() || !formData.content.trim() || uploading}
              className="rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              ) : (
                mode === 'create' ? 'Buat Artikel' : 'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Event Form Modal (Create/Edit)
interface EventFormModalProps {
  event?: {
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
    status: string;
    priority: string;
    images?: any[];
    image_count?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
  mode: 'create' | 'edit';
}

export const EventFormModal = ({ event, isOpen, onClose, onSave, mode }: EventFormModalProps) => {
  // Helper function to get default date
  const getDefaultDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0); // Set to next hour, no minutes/seconds
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    event_date: event?.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : getDefaultDate(),
    duration_minutes: event?.duration_minutes || 60,
    location: event?.location || '',
    zoom_link: event?.zoom_link || '',
    zoom_meeting_id: event?.zoom_meeting_id || '',
    zoom_password: event?.zoom_password || '',
    max_participants: event?.max_participants || 50,
    status: event?.status || 'draft',
    priority: event?.priority || 'normal'
  });

  // State for image management
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ file: File; url: string; id: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Update form data when event prop changes (for fresh data from API)
  useEffect(() => {
    if (event && isOpen) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : getDefaultDate(),
        duration_minutes: event.duration_minutes || 60,
        location: event.location || '',
        max_participants: event.max_participants || 50,
        status: event.status || 'draft',
        priority: event.priority || 'normal',
        zoom_link: event.zoom_link || '',
        zoom_meeting_id: event.zoom_meeting_id || '',
        zoom_password: event.zoom_password || ''
      });
    }
  }, [event, isOpen]);

  // Reset images when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedImages([]);
      setImagePreviews([]);
    }
  }, [isOpen]);

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    
    imageFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setSelectedImages(prev => [...prev, file]);
      setImagePreviews(prev => [...prev, { file, url, id }]);
    });
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Remove image
  const removeImage = (id: string) => {
    setImagePreviews(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Clean up object URLs to prevent memory leaks
      prev.forEach(img => {
        if (img.id === id) {
          URL.revokeObjectURL(img.url);
        }
      });
      return updated;
    });
    
    setSelectedImages(prev => {
      const imageToRemove = imagePreviews.find(img => img.id === id);
      if (imageToRemove) {
        return prev.filter(file => file !== imageToRemove.file);
      }
      return prev;
    });
  };

  // Insert image placeholder in description
  const insertImagePlaceholder = (imageId: string) => {
    const placeholder = `{{image:${imageId}}}`;
    setFormData(prev => ({
      ...prev,
      description: prev.description + `\n\n${placeholder}\n\n`
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    
    if (!formData.event_date) {
      alert('Event date is required');
      return;
    }

    // Validate and convert date
    const eventDate = new Date(formData.event_date);
    if (isNaN(eventDate.getTime())) {
      alert('Invalid event date');
      return;
    }

    if (selectedImages.length > 0) {
      // Create FormData for multipart upload
      const formDataWithImages = new FormData();
      
      // Add event data
      formDataWithImages.append('title', formData.title);
      formDataWithImages.append('description', formData.description);
      formDataWithImages.append('event_date', eventDate.toISOString());
      formDataWithImages.append('duration_minutes', formData.duration_minutes.toString());
      formDataWithImages.append('location', formData.location);
      formDataWithImages.append('zoom_link', formData.zoom_link);
      formDataWithImages.append('zoom_meeting_id', formData.zoom_meeting_id);
      formDataWithImages.append('zoom_password', formData.zoom_password);
      formDataWithImages.append('max_participants', formData.max_participants.toString());
      formDataWithImages.append('status', formData.status);
      formDataWithImages.append('priority', formData.priority);
      
      if (mode === 'edit' && event?.id) {
        formDataWithImages.append('id', event.id.toString());
      }
      
      // Add images
      selectedImages.forEach((file, index) => {
        formDataWithImages.append('images', file);
      });
      
      onSave(formDataWithImages);
    } else {
      // Regular JSON save without images
      onSave({
        ...(mode === 'edit' && { id: event?.id }),
        ...formData,
        event_date: eventDate.toISOString()
      });
    }
    onClose();
  };

  const resetForm = () => {
    setFormData({
      title: event?.title || '',
      description: event?.description || '',
      event_date: event?.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : getDefaultDate(),
      duration_minutes: event?.duration_minutes || 60,
      location: event?.location || '',
      max_participants: event?.max_participants || 50,
      status: event?.status || 'draft',
      priority: event?.priority || 'normal',
      zoom_link: event?.zoom_link || '',
      zoom_meeting_id: event?.zoom_meeting_id || '',
      zoom_password: event?.zoom_password || ''
    });
    
    // Reset image states
    setSelectedImages([]);
    imagePreviews.forEach(img => URL.revokeObjectURL(img.url));
    setImagePreviews([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-y-auto rounded-3xl border-0 shadow-2xl p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-6 rounded-t-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Buat Event Baru' : 'Edit Event'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {mode === 'create' 
                ? 'Buat event baru untuk platform Anda'
                : 'Lakukan perubahan pada event ini'
              }
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-900">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Masukkan judul event"
              className="rounded-2xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-900">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Jelaskan event Anda... Mendukung Markdown:\n\n## Heading 2\n**Bold text**\n*Italic text*"
              className="min-h-[200px] rounded-2xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
              <p className="text-xs text-indigo-700 font-medium">📝 Markdown support tersedia untuk format teks</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date & Time</Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                min="1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Event location or 'Online'"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                min="1"
              />
            </div>
          </div>

          {/* Zoom Meeting Section */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Video className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Zoom Meeting Details</h4>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="zoom_link" className="text-sm font-medium text-blue-900">Zoom Meeting Link</Label>
                <Input
                  id="zoom_link"
                  value={formData.zoom_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, zoom_link: e.target.value }))}
                  placeholder="https://zoom.us/j/123456789"
                  className="bg-white border-blue-200 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zoom_meeting_id" className="text-sm font-medium text-blue-900">Meeting ID</Label>
                  <Input
                    id="zoom_meeting_id"
                    value={formData.zoom_meeting_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, zoom_meeting_id: e.target.value }))}
                    placeholder="123 456 789"
                    className="bg-white border-blue-200 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zoom_password" className="text-sm font-medium text-blue-900">Meeting Password</Label>
                  <Input
                    id="zoom_password"
                    value={formData.zoom_password}
                    onChange={(e) => setFormData(prev => ({ ...prev, zoom_password: e.target.value }))}
                    placeholder="Optional password"
                    className="bg-white border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-blue-100 p-3 rounded-xl">
              <p className="text-xs text-blue-700">💡 Zoom details akan ditampilkan kepada peserta yang terdaftar</p>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4 p-4 bg-green-50 rounded-2xl border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Event Images</h4>
              <span className="text-xs text-gray-500">({imagePreviews.length}/10)</span>
            </div>
            
            {/* File Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-green-400 bg-green-100' 
                  : 'border-green-300 hover:border-green-400 hover:bg-green-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-green-700 font-medium">
                  Click to upload or drag and drop images here
                </p>
                <p className="text-xs text-green-600 mt-1">
                  PNG, JPG up to 10MB each (max 10 images)
                </p>
              </label>
            </div>

            {/* Existing Images (for edit mode) */}
            {mode === 'edit' && event?.images && event.images.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-medium text-green-900">Existing Images ({event.images.length}):</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.images.map((image: any) => (
                    <div key={`existing-${image.id}`} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-green-200">
                        <img 
                          src={`http://localhost:3000${image.path}`}
                          alt={image.original_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <button
                        onClick={() => insertImagePlaceholder(image.id.toString())}
                        className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700"
                        title="Insert in description"
                      >
                        Insert {`{{image:${image.id}}}`}
                      </button>
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {image.original_name}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-700">
                    💡 Click "Insert" to add existing images to description using {`{{image:id}}`} format
                  </p>
                </div>
              </div>
            )}

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-medium text-green-900">Selected Images:</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-green-200">
                        <img 
                          src={image.url} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => insertImagePlaceholder(image.id)}
                        className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-700"
                        title="Insert in description"
                      >
                        Insert
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-green-100 p-3 rounded-xl">
              <p className="text-xs text-green-700">
                📷 Use placeholders like {`{{image:img_id}}`} in description to position images
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onClose(); }}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === 'create' ? 'Create Event' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// User Form Modal (Create/Edit)
interface UserFormModalProps {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  mode: 'create' | 'edit';
}

export const UserFormModal = ({ user, isOpen, onClose, onSave, mode }: UserFormModalProps) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'user',
    password: '' // Only for create mode
  });

  // Update form data when user prop changes (for fresh data from API)
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'user',
        password: '' // Reset password field
      });
    }
  }, [user, isOpen]);

  const handleSave = () => {
    const dataToSave = {
      ...(mode === 'edit' && { id: user?.id }),
      ...formData
    };
    
    // Remove password field if it's empty in edit mode
    if (mode === 'edit' && !formData.password) {
      delete dataToSave.password;
    }
    
    onSave(dataToSave);
    onClose();
  };

  const resetForm = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      role: user?.role || 'user',
      password: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="max-w-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New User' : 'Edit User'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new user account'
              : 'Make changes to user information'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {mode === 'edit' && <span className="text-xs text-gray-500">(leave empty to keep current)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder={mode === 'create' ? 'Enter password' : 'Enter new password (optional)'}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onClose(); }}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === 'create' ? 'Create User' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
