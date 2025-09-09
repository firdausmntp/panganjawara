import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  PlayCircle,
  Eye,
  Heart,
  Share2,
  Clock,
  Search,
  Filter,
  Play,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG, buildApiUrl } from "../lib/api";

interface VideoEducation {
  id: number;
  title: string;
  description: string;
  author: string;
  youtube_url: string;
  thumbnail_url?: string;
  duration?: string;
  view_count: number;
  like_count?: number;
  status: "published" | "draft" | "archived";
  featured?: boolean;
  tags?: string;
  created_at: string;
  updated_at?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse {
  success: boolean;
  data: VideoEducation[];
  pagination: Pagination;
}

const EdukasiVideo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [videos, setVideos] = useState<VideoEducation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [likedVideos, setLikedVideos] = useState<Set<number>>(new Set());
  const [likingVideo, setLikingVideo] = useState<number | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Categories extracted from video tags
  const [categories, setCategories] = useState<string[]>(["all"]);

  // Fetch videos from API
  const fetchVideos = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      let url = `${API_CONFIG.ENDPOINTS.PUBLIC.VIDEOS}?page=${page}&limit=${pagination.limit}`;

      if (search) {
        url = `/public/videos/search?q=${encodeURIComponent(
          search
        )}&page=${page}&limit=${pagination.limit}`;
      }

      const response = await fetch(buildApiUrl(url));
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setVideos(data.data);
        setPagination(data.pagination);

        // Extract unique categories from tags
        const uniqueCategories = new Set<string>();
        data.data.forEach((video) => {
          if (video.tags) {
            const tagArray = video.tags.split(",").map((tag) => tag.trim());
            tagArray.forEach((tag) => uniqueCategories.add(tag));
          }
        });
        setCategories(["all", ...Array.from(uniqueCategories)]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast({
        title: "Error",
        description: "Gagal memuat video dari server.",
        variant: "destructive",
      });
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter videos based on category (client-side filtering)
  const filteredVideos = videos.filter((video) => {
    if (selectedCategory === "all") return true;
    return video.tags?.includes(selectedCategory);
  });

  // Handle search
  const handleSearch = () => {
    fetchVideos(1, searchQuery);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchVideos(newPage, searchQuery);
  };

  // Handle video click - get details and increase view count
  const handleVideoClick = async (video: VideoEducation) => {
    try {
      // Call API to get video details and increase view count
      const response = await fetch(buildApiUrl(`/public/videos/${video.id}`), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Update local view count
        setVideos((prevVideos) =>
          prevVideos.map((v) => {
            if (v.id === video.id) {
              return {
                ...v,
                view_count: v.view_count + 1,
              };
            }
            return v;
          })
        );
      }
    } catch (error) {
      console.error("Error fetching video details:", error);
    } finally {
      // Open YouTube video regardless of API call result
      window.open(video.youtube_url, "_blank");
    }
  };

  // Handle like functionality
  const handleLike = async (videoId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    setLikingVideo(videoId);

    try {
      const response = await fetch(
        buildApiUrl(`/public/videos/${videoId}/like`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const wasLiked = likedVideos.has(videoId);

        // Update local state
        setLikedVideos((prev) => {
          const newLiked = new Set(prev);
          if (wasLiked) {
            newLiked.delete(videoId);
          } else {
            newLiked.add(videoId);
          }
          return newLiked;
        });

        // Update video like count locally
        setVideos((prevVideos) =>
          prevVideos.map((video) => {
            if (video.id === videoId) {
              const currentLikes = video.like_count || 0;
              return {
                ...video,
                like_count: wasLiked ? currentLikes - 1 : currentLikes + 1,
              };
            }
            return video;
          })
        );

        toast({
          title: wasLiked ? "Unlike berhasil" : "Like berhasil",
          description: wasLiked
            ? "Video telah di-unlike"
            : "Terima kasih atas like Anda!",
        });
      }
    } catch (error) {
      console.error("Error liking video:", error);
      toast({
        title: "Error",
        description: "Gagal memberikan like. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLikingVideo(null);
    }
  };

  // Share functionality
  const handleShare = async (video: VideoEducation, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: video.youtube_url,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(video.youtube_url);
        toast({
          title: "Link disalin!",
          description: "Link video telah disalin ke clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Utility functions
  const getVideoThumbnail = (video: VideoEducation) => {
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
    return "/placeholder.svg";
  };

  const extractYouTubeVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getVideoCategory = (tags?: string) => {
    if (!tags) return "Edukasi";
    const tagArray = tags.split(",").map((tag) => tag.trim());
    return tagArray[0] || "Edukasi";
  };

  // Initialize
  useEffect(() => {
    fetchVideos();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl blur-3xl -z-10"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-green-100">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                <Video className="h-8 w-8 text-white" />
              </div>
<h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent pb-2">
  Video tentang Ketahanan Pangan
</h1>

            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Panduan lengkap tentang pertanian berkelanjutan, teknologi pangan
              modern, dan inovasi agrikultur untuk mewujudkan ketahanan pangan
              masa depan.
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <button
            onClick={() => navigate("/edukasi")}
            className="hover:text-primary transition-colors"
          >
            Edukasi
          </button>
          <span>/</span>
          <span className="text-foreground">Video</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card className="p-6 text-center border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-xl transition-all duration-300">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl w-fit mx-auto mb-3">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-700 mb-1">
              {pagination.total}
            </h3>
            <p className="text-sm text-green-600 font-medium">Total Video</p>
          </Card>
          <Card className="p-6 text-center border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-xl transition-all duration-300">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl w-fit mx-auto mb-3">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-700 mb-1">
              {videos
                .reduce((total, video) => total + video.view_count, 0)
                .toLocaleString()}
            </h3>
            <p className="text-sm text-emerald-600 font-medium">Total Views</p>
          </Card>
          <Card className="p-6 text-center border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100/50 hover:shadow-xl transition-all duration-300">
            <div className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl w-fit mx-auto mb-3">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-teal-700 mb-1">
              {videos.reduce(
                (total, video) => total + (video.like_count || 0),
                0
              )}
            </h3>
            <p className="text-sm text-teal-600 font-medium">Total Likes</p>
          </Card>
          <Card className="p-6 text-center border-0 shadow-lg bg-gradient-to-br from-lime-50 to-lime-100/50 hover:shadow-xl transition-all duration-300">
            <div className="p-3 bg-gradient-to-r from-lime-500 to-lime-600 rounded-2xl w-fit mx-auto mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-lime-700 mb-1">
              {categories.length - 1}
            </h3>
            <p className="text-sm text-lime-600 font-medium">Kategori</p>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-gray-50 to-gray-100/50 border-0 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Cari video, topik, atau instruktur..."
                className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-green-400 rounded-xl shadow-sm bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="h-12 px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Search className="w-5 h-5 mr-2" />
              )}
              Cari Video
            </Button>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-56 h-12 border-2 border-gray-200 focus:border-green-400 rounded-xl bg-white">
                <Filter className="w-5 h-5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">🎯 Semua Kategori</SelectItem>
                {categories.slice(1).map((category) => (
                  <SelectItem key={category} value={category}>
                    📂 {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Videos Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <Card
                key={video.id}
                className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer border-0 shadow-lg bg-white"
                onClick={() => handleVideoClick(video)}
              >
                <div className="relative">
                  <img
                    src={getVideoThumbnail(video)}
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/40 transition-all duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-green-500 group-hover:scale-110 transition-all duration-500 shadow-lg">
                      <Play className="w-6 h-6 text-green-500 group-hover:text-white ml-1 transition-colors duration-300" />
                    </div>
                  </div>
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
                    <Video className="w-3 h-3 mr-1" />
                    Video
                  </Badge>
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant="secondary"
                      className="bg-black/70 text-white border-0 backdrop-blur-sm"
                    >
                      👁 {video.view_count.toLocaleString()}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-9 w-9 p-0 bg-white/90 hover:bg-white border-0 shadow-md"
                      onClick={(e) => handleLike(video.id, e)}
                      disabled={likingVideo === video.id}
                    >
                      {likingVideo === video.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                      ) : (
                        <Heart
                          className={`h-4 w-4 ${
                            likedVideos.has(video.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-600 hover:text-red-500"
                          } transition-colors`}
                        />
                      )}
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant="outline"
                      className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
                    >
                      📁 {getVideoCategory(video.tags)}
                    </Badge>
                    {video.featured && (
                      <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-0">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors line-clamp-2 leading-tight">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-3 border-b border-gray-100">
                    <span className="font-medium">👨‍� {video.author}</span>
                    <span className="text-xs">
                      📅 {formatDate(video.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-emerald-600">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">
                          {video.view_count.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-red-500">
                        <Heart
                          className={`w-4 h-4 ${
                            likedVideos.has(video.id) ? "fill-current" : ""
                          }`}
                        />
                        <span className="font-medium">
                          {video.like_count || 0}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-md group-hover:shadow-lg transition-all duration-300"
                    >
                      🎬 Tonton
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <Card className="p-6 mt-12 bg-gradient-to-r from-gray-50 to-gray-100/50 border-0 shadow-lg">
            <div className="flex items-center justify-center space-x-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="bg-white border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 rounded-xl shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Sebelumnya
              </Button>

              <div className="flex items-center space-x-2">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNumber = pagination.page - 2 + i;
                    if (pageNumber < 1 || pageNumber > pagination.totalPages)
                      return null;

                    return (
                      <Button
                        key={pageNumber}
                        variant={
                          pageNumber === pagination.page ? "default" : "outline"
                        }
                        size="lg"
                        onClick={() => handlePageChange(pageNumber)}
                        className={
                          pageNumber === pagination.page
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg rounded-xl min-w-[3rem]"
                            : "bg-white border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 rounded-xl min-w-[3rem] shadow-sm"
                        }
                      >
                        {pageNumber}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="bg-white border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 rounded-xl shadow-sm"
              >
                Selanjutnya
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="text-center mt-4 text-sm text-gray-600">
              Halaman {pagination.page} dari {pagination.totalPages} • Total{" "}
              {pagination.total} video
            </div>
          </Card>
        )}

        {filteredVideos.length === 0 && (
          <Card className="p-12 text-center">
            <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak Ada Video</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== "all"
                ? "Tidak ditemukan video yang sesuai dengan pencarian Anda"
                : "Belum ada video yang tersedia"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EdukasiVideo;
