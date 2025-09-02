# 🌾 Pangan Jawara

**Platform Terintegrasi untuk Monitoring Ketahanan Pangan Indonesia**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.4-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.3.4-646CFF.svg)](https://vitejs.dev/)

## 🚀 Fitur Utama

### 📊 **Data & Monitoring**
- **Real-time Price Tracking**: Monitoring harga komoditas secara real-time dari berbagai sumber
- **Interactive Map**: Peta Indonesia interaktif dengan data harga per provinsi
- **Weather Forecast**: Integrasi prakiraan cuaca BMKG dengan deteksi lokasi otomatis
- **Commodity Analytics**: Analisis trend dan pergerakan harga komoditas

### 📚 **Edukasi & Konten**
- **AI Article Generator**: Generate artikel berkualitas dengan Gemini AI dan Imagen
- **Educational Content**: Artikel edukasi tentang pertanian dan ketahanan pangan
- **Content Management**: Sistem manajemen konten lengkap untuk admin

### 👥 **Komunitas & Kolaborasi**
- **Community Forum**: Platform diskusi untuk petani dan stakeholder
- **Event Management**: Manajemen acara dan kegiatan komunitas
- **User Engagement**: Sistem like, comment, dan interaksi komunitas

### 🤖 **AI & Automation**
- **Smart Content Generation**: Auto-generate artikel dengan AI
- **Weather Intelligence**: Prediksi cuaca dengan lokasi otomatis
- **Data Analytics**: Analisis cerdas pergerakan harga dan trend pasar

## 🛠️ Teknologi yang Digunakan

### Frontend Stack
- **React 18.3.1**: Library UI modern dengan hooks
- **TypeScript 5.5.3**: Type safety dan developer experience
- **Vite 5.3.4**: Build tool super cepat
- **Tailwind CSS 3.4.4**: Utility-first CSS framework

### UI Components
- **Shadcn/UI**: Komponen UI modern dan accessible
- **Lucide React**: Icon library yang lengkap
- **Recharts**: Library charting untuk visualisasi data

### State Management & Data
- **TanStack Query**: Server state management
- **Custom Hooks**: Hooks khusus untuk API integration
- **LocalStorage**: Persistent storage untuk user preferences

### APIs & Integrations
- **BMKG API**: Data cuaca Indonesia
- **Commodity Price API**: Real-time harga komoditas
- **Gemini AI API**: Content generation
- **Imagen API**: Image generation
- **Geolocation API**: Auto location detection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ dan npm/bun
- API Keys untuk Gemini AI (opsional untuk fitur AI)

### Installation

```bash
# Clone repository
git clone https://github.com/firdausmntp/panganjawara.git

# Navigate to project directory
cd panganjawara

# Install dependencies
npm install
# atau
bun install

# Start development server
npm run dev
# atau
bun dev
```

### Environment Setup

Buat file `.env.local` untuk konfigurasi API (opsional):

```env
# API Endpoints
VITE_API_BASE_URL=http://localhost:3000
VITE_BMKG_API_URL=https://api.bmkg.go.id

# AI Features (Optional)
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_IMAGEN_API_KEY=your_imagen_api_key
```

## 📁 Struktur Project

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── data/           # Data visualization components
│   ├── ui/             # Base UI components (shadcn)
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
├── pages/              # Page components
├── providers/          # Context providers
└── types/              # TypeScript type definitions
```

## 🎯 Fitur Khusus

### 🤖 AI Article Generator
Fitur revolusioner untuk membuat artikel berkualitas dengan AI:

```typescript
// Penggunaan AI Article Generator
import AIArticleGenerator from '@/components/admin/AIArticleGenerator';

const handleArticleGenerated = (article) => {
  console.log('Generated:', article);
  // Save to your CMS
};

<AIArticleGenerator onArticleGenerated={handleArticleGenerated} />
```

**Fitur AI Generator:**
- Generate artikel dengan topic dan tone yang disesuaikan
- Integrasi Gemini AI untuk konten berkualitas
- Auto-generate gambar dengan Imagen
- Support berbagai panjang artikel (pendek/sedang/panjang)
- Markdown dan HTML output
- Copy to clipboard functionality

### 🗺️ Interactive Map
Peta Indonesia interaktif dengan fitur lengkap:
- **Touch Support**: Zoom dan pan dengan gesture mobile
- **Province Selection**: Klik provinsi untuk detail
- **Price Data**: Hover tooltip dengan harga komoditas
- **Responsive Design**: Optimized untuk mobile dan desktop

### 📡 Real-time Data
- **Auto Location**: Deteksi lokasi otomatis untuk cuaca
- **Live Pricing**: Update harga komoditas real-time
- **Weather Integration**: Prakiraan cuaca 3 hari dengan BMKG API
- **Data Caching**: Optimized dengan TanStack Query

## 🎨 Design System

### Color Palette
- **Primary**: Emerald (pertanian & alam)
- **Secondary**: Blue (teknologi & data)
- **Accent**: Purple (AI & inovasi)
- **Neutral**: Gray (konten & UI)

### Typography
- **Heading**: Inter font family
- **Body**: System font stack untuk performa
- **Mono**: Untuk code dan data

### Components
- Konsisten dengan Shadcn/UI design system
- Dark mode ready (coming soon)
- Accessibility compliant
- Mobile-first responsive design

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Options

**Vercel (Recommended)**
```bash
npm i -g vercel
vercel --prod
```

**Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

**Custom Server**
```bash
npm run build
# Serve dist/ folder dengan web server
```

## 📈 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, SEO)
- **Bundle Size**: Optimized dengan code splitting
- **Loading Speed**: <2s pada 3G connection
- **Mobile Experience**: Perfect mobile responsiveness

## 🤝 Contributing

Kami menerima kontribusi! Silakan baca [CONTRIBUTING.md](CONTRIBUTING.md) untuk guidelines.

### Development Workflow
1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

## 📊 Roadmap

### Q4 2024
- [ ] Multi-language support (EN/ID)
- [ ] Dark mode implementation  
- [ ] PWA capabilities
- [ ] Push notifications

### Q1 2025
- [ ] Advanced analytics dashboard
- [ ] Machine learning price predictions
- [ ] Mobile app (React Native)
- [ ] API rate limiting & caching

### Q2 2025
- [ ] Marketplace integration
- [ ] Farmer certification system
- [ ] IoT sensor integration
- [ ] Blockchain supply chain tracking

## 🐛 Bug Reports

Temukan bug? Silakan [buat issue](https://github.com/firdausmntp/panganjawara/issues) dengan detail:
- Browser dan versi
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (jika relevan)

## 📞 Support

- **Documentation**: [Wiki](https://github.com/firdausmntp/panganjawara/wiki)
- **Issues**: [GitHub Issues](https://github.com/firdausmntp/panganjawara/issues)
- **Discussions**: [GitHub Discussions](https://github.com/firdausmntp/panganjawara/discussions)

## 📄 License

Project ini dilisensikan under MIT License - lihat [LICENSE](LICENSE) file untuk detail.

## 🙏 Acknowledgments

- **BMKG**: Untuk data cuaca Indonesia
- **Badan Pangan Nasional**: Untuk data komoditas
- **Google AI**: Untuk Gemini dan Imagen API
- **Open Source Community**: Untuk amazing tools dan libraries

---

**Dibuat dengan ❤️ untuk ketahanan pangan Indonesia** 🇮🇩
