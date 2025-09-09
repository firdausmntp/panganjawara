// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.fsu.my.id/pajar',
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REFRESH: '/auth/refresh',
    },
    // Public endpoints
    PUBLIC: {
      ARTICLES: '/public/articles',
      ARTICLES_TRENDING: '/public/articles/trending',
      VIDEOS: '/public/videos',
      VIDEOS_FEATURED: '/public/videos/featured',
      VIDEOS_TRENDING: '/public/videos/trending',
    },
    // Posts endpoints
    POSTS: '/posts',
    COMMENTS: '/comments',
    // Events endpoints
    EVENTS: {
      UPCOMING: '/events/upcoming',
    },
    // Location endpoints
    LOCATION: '/location',
    WILAYAH: {
      SEARCH: '/wilayah/search',
    },
    // Stats endpoints
    STATS: {
      POPULAR: '/stats/popular',
    },
    // Health endpoint
    HEALTH: '/health',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function for image URLs
export const buildImageUrl = (imagePath: string): string => {
  return `${API_CONFIG.BASE_URL}${imagePath}`;
};
