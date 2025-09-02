import { Button } from '@/components/ui/button';
import { 
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  Users,
  Clock,
  Loader2,
  Video,
  Link,
  Key,
  Image
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Article Actions Component
interface ArticleActionsProps {
  article: {
    id: number;
    title: string;
    status: string;
  };
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  loading?: {[key: string]: boolean};
}

export const ArticleActions = ({ article, onView, onEdit, onDelete, loading = {} }: ArticleActionsProps) => {
  const isViewLoading = loading[`view-article-${article.id}`];
  const isEditLoading = loading[`edit-article-${article.id}`];
  
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onView(article.id)}
        disabled={isViewLoading || isEditLoading}
        className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
        title="Lihat artikel"
      >
        {isViewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onEdit(article.id)}
        disabled={isViewLoading || isEditLoading}
        className="hover:bg-green-50 hover:border-green-200 transition-colors"
        title="Edit artikel"
      >
        {isEditLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onDelete(article.id)}
        className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
        title="Hapus artikel"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Event Actions Component
interface EventActionsProps {
  event: {
    id: number;
    title: string;
    status: string;
    priority?: string;
    event_date: string;
    duration_minutes: number;
    location?: string;
    max_participants: number;
  };
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  loading?: {[key: string]: boolean};
}

export const EventActions = ({ event, onView, onEdit, onDelete, loading = {} }: EventActionsProps) => {
  const isViewLoading = loading[`view-event-${event.id}`];
  const isEditLoading = loading[`edit-event-${event.id}`];
  
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onView(event.id)}
        disabled={isViewLoading || isEditLoading}
        className="hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
        title="Lihat event"
      >
        {isViewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onEdit(event.id)}
        disabled={isViewLoading || isEditLoading}
        className="hover:bg-green-50 hover:border-green-200 transition-colors"
        title="Edit event"
      >
        {isEditLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onDelete(event.id)}
        className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
        title="Hapus event"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

// User Actions Component
interface UserActionsProps {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  onEdit: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const UserActions = ({ user, onEdit, onDelete }: UserActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onEdit(user.id)}
        className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
        title="Edit user"
      >
        <Edit className="h-4 w-4" />
      </Button>
      {onDelete && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete(user.id)}
          className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
          title="Delete user"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// Event Info Component
interface EventInfoProps {
  event: {
    event_date: string;
    duration_minutes: number;
    location?: string;
    zoom_link?: string;
    zoom_meeting_id?: string;
    zoom_password?: string;
    max_participants: number;
    images?: any[];
    image_count?: number;
  };
}

export const EventInfo = ({ event }: EventInfoProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(event.event_date).toLocaleDateString('id-ID')}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {event.duration_minutes} menit
        </span>
        {event.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          Max {event.max_participants} peserta
        </span>
        {(event.images?.length || event.image_count) && (
          <span className="flex items-center gap-1 text-green-600">
            <Image className="h-3 w-3" />
            {event.image_count || event.images?.length || 0} gambar
          </span>
        )}
      </div>
      
      {/* Zoom Info */}
      {event.zoom_link && (
        <div className="flex items-center gap-4 text-sm text-blue-600 flex-wrap">
          <span className="flex items-center gap-1">
            <Video className="h-3 w-3" />
            <a 
              href={event.zoom_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Zoom Meeting
            </a>
          </span>
          {event.zoom_meeting_id && (
            <span className="flex items-center gap-1">
              <Link className="h-3 w-3" />
              ID: {event.zoom_meeting_id}
            </span>
          )}
          {event.zoom_password && (
            <span className="flex items-center gap-1">
              <Key className="h-3 w-3" />
              Password: {event.zoom_password}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Status Badge Component
interface StatusBadgeProps {
  status: string;
  priority?: string;
}

export const StatusBadge = ({ status, priority }: StatusBadgeProps) => {
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

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusBadgeColor(status)}>
        {status}
      </Badge>
      {priority && priority !== 'normal' && (
        <Badge variant={getPriorityBadgeColor(priority)}>
          {priority}
        </Badge>
      )}
    </div>
  );
};

// Add Button Component
interface AddButtonProps {
  onClick: () => void;
  type: 'article' | 'event' | 'user';
  className?: string;
}

export const AddButton = ({ onClick, type, className = "" }: AddButtonProps) => {
  const getButtonText = () => {
    switch (type) {
      case 'article':
        return 'Tambah Artikel';
      case 'event':
        return 'Tambah Event';
      case 'user':
        return 'Tambah User';
      default:
        return 'Tambah';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'article':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
      case 'event':
        return 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700';
      case 'user':
        return 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700';
    }
  };

  return (
    <Button 
      onClick={onClick}
      className={`${getButtonColor()} shadow-lg hover:shadow-xl transition-all ${className}`}
    >
      <Plus className="h-4 w-4 mr-2" />
      {getButtonText()}
    </Button>
  );
};
