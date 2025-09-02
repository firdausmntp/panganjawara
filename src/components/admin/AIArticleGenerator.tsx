import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Settings,
  Copy,
  Download,
  Eye,
  RefreshCw,
  Key,
  Zap,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseMarkdown } from '@/lib/markdown';

interface AIArticleGeneratorProps {
  onArticleGenerated?: (article: { 
    title: string; 
    content: string; 
    excerpt?: string;
    tags?: string[];
    images: string[] 
  }) => void;
  className?: string;
}

interface GeneratedArticle {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  images: string[];
  metadata: {
    topic: string;
    tone: string;
    length: string;
    generatedAt: string;
  };
}

const AIArticleGenerator: React.FC<AIArticleGeneratorProps> = ({ 
  onArticleGenerated, 
  className = '' 
}) => {
  const { toast } = useToast();

  // API Keys state
  const [apiKeys, setApiKeys] = useState({
    gemini: localStorage.getItem('gemini_api_key') || ''
  });

  // Generation parameters
  const [params, setParams] = useState({
    topic: '',
    tone: 'informative',
    length: 'medium',
    includeImages: true,
    imageCount: 3,
    keywords: '',
    imageStyle: 'realistic' // New parameter for Imagen 3
  });

  // State management
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [error, setError] = useState('');
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);
  const [topicSearchQuery, setTopicSearchQuery] = useState('');

  // Predefined topics and keywords for Indonesian food security and agriculture
  const topicSuggestions = [
    {
      topic: "Teknologi Hidroponik untuk Petani Milenial",
      keywords: "hidroponik, urban farming, teknologi pertanian, petani milenial, inovasi",
      trending: true
    },
    {
      topic: "Program Ketahanan Pangan Desa di Indonesia",
      keywords: "ketahanan pangan, desa, program pemerintah, swasembada, pertanian rakyat",
      popular: true
    },
    {
      topic: "Smart Farming dan IoT dalam Pertanian Indonesia",
      keywords: "smart farming, IoT, teknologi, digitalisasi, precision agriculture",
      trending: true
    },
    {
      topic: "Diversifikasi Pangan Lokal untuk Mengurangi Impor",
      keywords: "diversifikasi pangan, pangan lokal, impor beras, ketahanan pangan, potensi lokal",
      popular: true
    },
    {
      topic: "Budidaya Organik: Solusi Pertanian Berkelanjutan",
      keywords: "pertanian organik, berkelanjutan, ramah lingkungan, sertifikasi organik",
      trending: true
    },
    {
      topic: "Peran Koperasi Tani dalam Meningkatkan Kesejahteraan Petani",
      keywords: "koperasi tani, kesejahteraan petani, ekonomi kerakyatan, gotong royong"
    },
    {
      topic: "Inovasi Pengolahan Hasil Pertanian untuk Nilai Tambah",
      keywords: "pengolahan hasil, nilai tambah, agroindustri, UMKM, inovasi produk"
    },
    {
      topic: "Mitigasi Perubahan Iklim dalam Sektor Pertanian",
      keywords: "perubahan iklim, mitigasi, adaptasi, pertanian berkelanjutan, climate smart",
      popular: true
    },
    {
      topic: "Pengembangan Bibit Unggul Lokal Indonesia",
      keywords: "bibit unggul, varietas lokal, pemuliaan tanaman, produktivitas, ketahanan hama"
    },
    {
      topic: "Sistem Irigasi Modern untuk Optimalisasi Air Pertanian",
      keywords: "irigasi modern, efisiensi air, drip irrigation, teknologi irigasi, manajemen air"
    },
    {
      topic: "Pemanfaatan Lahan Marginal untuk Pertanian Produktif",
      keywords: "lahan marginal, rehabilitasi lahan, produktivitas, ekstensifikasi, reklamasi"
    },
    {
      topic: "Integrasi Ternak-Tanaman untuk Sistem Pertanian Terpadu",
      keywords: "integrated farming, ternak-tanaman, sistem terpadu, circular economy, efisiensi"
    },
    {
      topic: "Digitalisasi Pasar Tani untuk Akses Pasar yang Lebih Luas",
      keywords: "digitalisasi, e-commerce, pasar tani, akses pasar, platform digital",
      trending: true
    },
    {
      topic: "Pengembangan Agrowisata sebagai Diversifikasi Pendapatan Petani",
      keywords: "agrowisata, diversifikasi pendapatan, pariwisata, edukasi pertanian, ekonomi kreatif"
    },
    {
      topic: "Pengendalian Hama Terpadu Ramah Lingkungan",
      keywords: "PHT, pengendalian hama, ramah lingkungan, biologis, pestisida nabati"
    },
    {
      topic: "Aquaponik: Kombinasi Budidaya Ikan dan Sayuran",
      keywords: "aquaponik, budidaya ikan, sayuran, sistem tertutup, efisiensi air"
    },
    {
      topic: "Pengembangan Pupuk Organik dari Limbah Pertanian",
      keywords: "pupuk organik, limbah pertanian, kompos, biochar, sustainable"
    },
    {
      topic: "Vertical Farming untuk Lahan Terbatas di Perkotaan",
      keywords: "vertical farming, urban agriculture, lahan terbatas, kota, inovasi",
      trending: true
    },
    {
      topic: "Blockchain dalam Supply Chain Produk Pertanian",
      keywords: "blockchain, supply chain, traceability, teknologi, transparansi"
    },
    {
      topic: "Regenerative Agriculture untuk Kesehatan Tanah",
      keywords: "regenerative agriculture, kesehatan tanah, carbon sequestration, biodiversitas"
    },
    {
      topic: "Agroforestry: Integrasi Pohon dan Tanaman Pangan",
      keywords: "agroforestry, integrasi pohon, konservasi, sustainable farming, biodiversitas"
    },
    {
      topic: "Peningkatan Produktivitas Padi dengan Teknologi SRI",
      keywords: "SRI, produktivitas padi, efisiensi air, organic farming, sustainable"
    },
    {
      topic: "Budidaya Tanaman Pangan di Greenhouse Modern",
      keywords: "greenhouse, controlled environment, produksi sepanjang tahun, teknologi"
    },
    {
      topic: "Pemasaran Digital Produk Pertanian Organik",
      keywords: "pemasaran digital, organic products, e-commerce, branding, value chain"
    },
    {
      topic: "Pengembangan Seed Bank untuk Konservasi Varietas Lokal",
      keywords: "seed bank, konservasi, varietas lokal, biodiversitas, plasma nutfah"
    }
  ];

  // Save API keys to localStorage
  const saveApiKeys = () => {
    localStorage.setItem('gemini_api_key', apiKeys.gemini);
    toast({
      title: "API Keys disimpan",
      description: "API key Gemini berhasil disimpan ke local storage",
    });
    setShowApiSettings(false);
  };

  // Auto-fill topic and keywords from suggestions
  const selectTopicSuggestion = (suggestion: { topic: string; keywords: string }) => {
    setParams(prev => ({
      ...prev,
      topic: suggestion.topic,
      keywords: suggestion.keywords
    }));
    setShowTopicSuggestions(false);
    toast({
      title: "Topic dipilih",
      description: `"${suggestion.topic}" berhasil dipilih dengan keywords terkait`,
    });
  };

  // Generate random topic suggestion
  const generateRandomTopic = () => {
    const randomSuggestion = topicSuggestions[Math.floor(Math.random() * topicSuggestions.length)];
    selectTopicSuggestion(randomSuggestion);
  };

  // Auto-suggest keywords based on topic input
  const suggestKeywordsForTopic = (topicInput: string) => {
    if (!topicInput.trim() || params.keywords.trim()) return; // Don't override existing keywords

    const lowerTopic = topicInput.toLowerCase();
    
    // Find matching suggestion or generate keywords from topic
    const matchingSuggestion = topicSuggestions.find(s => 
      s.topic.toLowerCase().includes(lowerTopic) || 
      lowerTopic.includes(s.topic.toLowerCase().split(' ')[0])
    );

    if (matchingSuggestion) {
      setParams(prev => ({ ...prev, keywords: matchingSuggestion.keywords }));
    } else {
      // Generate basic keywords from topic words
      const topicWords = topicInput.split(' ').filter(word => word.length > 3);
      const basicKeywords = [
        ...topicWords.slice(0, 3),
        'pertanian indonesia',
        'ketahanan pangan',
        'inovasi'
      ].join(', ');
      
      setParams(prev => ({ ...prev, keywords: basicKeywords }));
    }
  };

  // Generate article with Gemini 2.0 Pro
  const generateArticleContent = async (topic: string, tone: string, length: string, keywords: string) => {
    const prompt = `
    Buatlah artikel tentang "${topic}" dengan kriteria berikut:
    - Tone: ${tone}
    - Panjang: ${length}
    - Keywords yang harus disertakan: ${keywords || 'tidak ada'}
    - Format: Markdown yang clean dan terstruktur
    - Fokus pada ketahanan pangan dan pertanian Indonesia
    - Sertakan informasi yang akurat dan bermanfaat
    - Gunakan bahasa Indonesia yang baik dan benar
    
    Struktur artikel dalam Markdown:
    1. Judul utama dengan # (H1)
    2. Paragraf pembuka yang engaging
    3. Gunakan ## (H2) untuk section utama
    4. Gunakan ### (H3) untuk sub-section
    5. Gunakan **bold** untuk penekanan penting
    6. Gunakan *italic* untuk highlight
    7. Gunakan bullet points (-) atau numbering (1.) untuk list
    8. Gunakan > untuk quote/highlight box
    9. Sertakan kesimpulan yang actionable
    10. Tips atau saran praktis dalam format list
    
    Berikan response dalam format JSON:
    {
      "title": "Judul artikel",
      "content": "Konten artikel dalam format Markdown",
      "excerpt": "Ringkasan singkat artikel (1-2 kalimat)",
      "suggested_images": ["deskripsi gambar 1", "deskripsi gambar 2", "deskripsi gambar 3"],
      "tags": ["tag1", "tag2", "tag3"]
    }
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKeys.gemini}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini 2.0 Pro API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini 2.0 Pro');
    }

    // Parse JSON response
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || topic,
          content: parsed.content || generatedText,
          excerpt: parsed.excerpt || '',
          tags: parsed.tags || [],
          suggested_images: parsed.suggested_images || [`Gambar tentang ${topic}`, `Infografik ${topic}`, `Ilustrasi ${topic}`]
        };
      } else {
        // Fallback: create structure from plain text with basic markdown
        const markdownContent = `# ${topic}\n\n${generatedText}`;
        return {
          title: topic,
          content: markdownContent,
          excerpt: generatedText.substring(0, 150) + '...',
          tags: [topic.toLowerCase().replace(/\s+/g, '-')],
          suggested_images: [`Gambar tentang ${topic}`, `Infografik ${topic}`, `Ilustrasi ${topic}`]
        };
      }
    } catch {
      // Fallback with markdown structure
      const markdownContent = `# ${topic}\n\n${generatedText}`;
      return {
        title: topic,
        content: markdownContent,
        excerpt: generatedText.substring(0, 150) + '...',
        tags: [topic.toLowerCase().replace(/\s+/g, '-')],
        suggested_images: [`Gambar tentang ${topic}`, `Infografik ${topic}`, `Ilustrasi ${topic}`]
      };
    }
  };

  // Generate images with Imagen 3/4 via Gemini API
  const generateImages = async (imageDescriptions: string[]) => {
    if (!apiKeys.gemini) {
      throw new Error('Gemini API key diperlukan untuk generasi gambar');
    }

    const generatedImages: string[] = [];
    
    for (const description of imageDescriptions.slice(0, params.imageCount)) {
      try {
        setGeneratingStep(`Membuat gambar: ${description.substring(0, 50)}...`);
        
        // Enhanced prompt for better image generation
        const enhancedPrompt = `${description}, high quality, professional photography, ${params.imageStyle} style, well-lit, detailed, 4K resolution, related to Indonesian agriculture and food security`;
        
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict', {
          method: 'POST',
          headers: {
            'x-goog-api-key': apiKeys.gemini,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instances: [{
              prompt: enhancedPrompt
            }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "16:9", // Good for article images
              safetyFilterLevel: "block_some"
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn(`Imagen API error for "${description}":`, errorData);
          // Continue with placeholder instead of failing completely
          generatedImages.push(`https://picsum.photos/800/450?random=${Math.random()}`);
          continue;
        }

        const data = await response.json();
        // Handle the correct response structure
        const imageData = data.predictions?.[0]?.bytesBase64Encoded || data.predictions?.[0]?.mimeType && data.predictions?.[0]?.bytesBase64Encoded;
        
        if (imageData) {
          // Convert base64 to blob URL for display
          const imageUrl = `data:image/png;base64,${imageData}`;
          generatedImages.push(imageUrl);
        } else {
          // Fallback to placeholder
          generatedImages.push(`https://picsum.photos/800/450?random=${Math.random()}`);
        }
        
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.warn(`Failed to generate image for "${description}":`, error);
        // Use placeholder image as fallback
        generatedImages.push(`https://picsum.photos/800/450?random=${Math.random()}`);
      }
    }
    
    return generatedImages;
  };

  // Alternative Imagen 4 implementation using Gemini API
  const generateImagesAlternative = async (imageDescriptions: string[]) => {
    const generatedImages: string[] = [];
    
    for (const description of imageDescriptions.slice(0, params.imageCount)) {
      try {
        setGeneratingStep(`Membuat gambar: ${description.substring(0, 50)}...`);
        
        const enhancedPrompt = `${description}, Indonesian agriculture, food security, high quality, professional, ${params.imageStyle}, detailed, 4K`;
        
        // Using Gemini API for Imagen 4
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict', {
          method: 'POST',
          headers: {
            'x-goog-api-key': apiKeys.gemini,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instances: [{
              prompt: enhancedPrompt
            }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "16:9",
              safetyFilterLevel: "block_some"
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          // Handle the correct response structure  
          const imageBase64 = data.predictions?.[0]?.bytesBase64Encoded || data.predictions?.[0]?.mimeType && data.predictions?.[0]?.bytesBase64Encoded;
          
          if (imageBase64) {
            generatedImages.push(`data:image/png;base64,${imageBase64}`);
          } else {
            generatedImages.push(`https://picsum.photos/800/450?random=${Math.random()}`);
          }
        } else {
          // Fallback to placeholder
          generatedImages.push(`https://picsum.photos/800/450?random=${Math.random()}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.warn(`Image generation failed for "${description}":`, error);
        generatedImages.push(`https://picsum.photos/800/450?random=${Math.random()}`);
      }
    }
    
    return generatedImages;
  };

  // Main generation function
  const handleGenerate = async () => {
    if (!params.topic.trim()) {
      setError('Topic tidak boleh kosong');
      return;
    }

    if (!apiKeys.gemini) {
      setError('API Key Gemini 2.0 Pro diperlukan');
      setShowApiSettings(true);
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedArticle(null);

    try {
      // Step 1: Generate article content with Gemini 2.0 Pro
      setGeneratingStep('Membuat konten artikel dengan Gemini 2.0 Pro...');
      const articleData = await generateArticleContent(
        params.topic,
        params.tone,
        params.length,
        params.keywords
      );

      // Step 2: Generate images with Imagen 3/4 (if requested and API key available)
      let images: string[] = [];
      if (params.includeImages) {
        if (apiKeys.gemini) {
          setGeneratingStep('Membuat gambar dengan Imagen via Gemini API...');
          try {
            images = await generateImagesAlternative(articleData.suggested_images || []);
          } catch (imgError) {
            console.warn('Imagen generation failed, using placeholders:', imgError);
            // Use placeholders if Imagen fails
            images = Array.from({ length: params.imageCount }, (_, i) => 
              `https://picsum.photos/800/450?random=${Math.random()}`
            );
          }
        } else {
          // Use placeholder images if no Gemini API key
          images = Array.from({ length: params.imageCount }, (_, i) => 
            `https://picsum.photos/800/450?random=${Math.random()}`
          );
        }
      }

      // Step 3: Compile final article
      setGeneratingStep('Menyelesaikan artikel...');
      const finalArticle: GeneratedArticle = {
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt,
        tags: articleData.tags,
        images,
        metadata: {
          topic: params.topic,
          tone: params.tone,
          length: params.length,
          generatedAt: new Date().toISOString()
        }
      };

      setGeneratedArticle(finalArticle);

      toast({
        title: "Artikel berhasil dibuat!",
        description: `Artikel "${finalArticle.title}" telah dibuat dengan ${images.length} gambar menggunakan Gemini 2.0 Pro dan Imagen`,
      });

      // Callback to parent component
      if (onArticleGenerated) {
        onArticleGenerated({
          title: finalArticle.title,
          content: finalArticle.content,
          excerpt: finalArticle.excerpt,
          tags: finalArticle.tags,
          images: finalArticle.images
        });
      }

    } catch (err: any) {
      console.error('Article generation error:', err);
      setError(`Gagal membuat artikel: ${err.message}`);
      toast({
        title: "Gagal membuat artikel",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setGeneratingStep('');
    }
  };

  // Copy content to clipboard
  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Disalin!",
        description: "Konten berhasil disalin ke clipboard",
      });
    } catch (err) {
      toast({
        title: "Gagal menyalin",
        description: "Tidak dapat menyalin ke clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Article Generator
          </h2>
          <p className="text-gray-600 mt-1">
            Buat artikel berkualitas dengan Gemini 2.0 Pro dan gambar dengan Imagen melalui satu API key
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowApiSettings(!showApiSettings)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          API Settings
        </Button>
      </div>

      {/* API Settings */}
      {showApiSettings && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Masukkan API key Gemini untuk menggunakan layanan AI terbaru (teks dan gambar)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="gemini-key">Gemini API Key *</Label>
              <Input
                id="gemini-key"
                type="password"
                placeholder="Masukkan Gemini API key"
                value={apiKeys.gemini}
                onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Dapatkan dari <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>. 
                Key ini akan digunakan untuk Gemini 2.0 Pro (teks) dan Imagen 3/4 (gambar).
              </p>
            </div>
            <Button onClick={saveApiKeys} className="w-full">
              Simpan API Key
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generation Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Parameter Generasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Topic Suggestions */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Topic Suggestions</h3>
                <span className="text-xs text-blue-600">Fokus Ketahanan Pangan Indonesia</span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateRandomTopic}
                  className="flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  <RefreshCw className="h-3 w-3" />
                  Random
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTopicSuggestions(!showTopicSuggestions)}
                  className="flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  {showTopicSuggestions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {showTopicSuggestions ? 'Sembunyikan' : 'Lihat Semua'}
                </Button>
              </div>
            </div>
            
            {showTopicSuggestions && (
              <div className="space-y-3">
                {/* Search Topics */}
                <div className="relative">
                  <Input
                    placeholder="Cari topic..."
                    value={topicSearchQuery}
                    onChange={(e) => setTopicSearchQuery(e.target.value)}
                    className="pl-8 text-sm"
                  />
                  <Sparkles className="absolute left-2.5 top-2.5 h-3 w-3 text-gray-400" />
                </div>
                
                {/* Filtered Topics */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {topicSuggestions
                    .filter(suggestion =>
                      suggestion.topic.toLowerCase().includes(topicSearchQuery.toLowerCase()) ||
                      suggestion.keywords.toLowerCase().includes(topicSearchQuery.toLowerCase())
                    )
                    .map((suggestion, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-3 border border-blue-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
                        onClick={() => selectTopicSuggestion(suggestion)}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-gray-900 flex-1">{suggestion.topic}</h4>
                          <div className="flex gap-1 ml-2">
                            {suggestion.trending && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                🔥 Trending
                              </span>
                            )}
                            {suggestion.popular && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                ⭐ Popular
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          <span className="font-medium">Keywords:</span> {suggestion.keywords}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1">
                            {suggestion.keywords.split(',').slice(0, 3).map((keyword, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                {keyword.trim()}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">
                            Klik untuk pilih →
                          </span>
                        </div>
                      </div>
                    ))
                  }
                  {topicSuggestions.filter(suggestion =>
                    suggestion.topic.toLowerCase().includes(topicSearchQuery.toLowerCase()) ||
                    suggestion.keywords.toLowerCase().includes(topicSearchQuery.toLowerCase())
                  ).length === 0 && topicSearchQuery && (
                    <div className="text-center py-4 text-gray-500">
                      <p>Tidak ada topic yang cocok dengan "{topicSearchQuery}"</p>
                      <p className="text-xs mt-1">Coba kata kunci lain atau gunakan topic custom</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!showTopicSuggestions && (
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-sm text-blue-700 mb-2">
                  💡 Tersedia {topicSuggestions.length} topic suggestion fokus ketahanan pangan Indonesia
                </p>
                <div className="flex flex-wrap gap-1">
                  {topicSuggestions.slice(0, 3).map((suggestion, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {suggestion.topic.split(' ').slice(0, 3).join(' ')}...
                    </span>
                  ))}
                  <span className="text-xs text-blue-600">+{topicSuggestions.length - 3} lainnya</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="topic">Topic Artikel *</Label>
                {params.topic && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setParams(prev => ({ ...prev, topic: '', keywords: '' }))}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Input
                id="topic"
                placeholder="e.g. Teknologi Hidroponik untuk Petani Milenial"
                value={params.topic}
                onChange={(e) => setParams(prev => ({ ...prev, topic: e.target.value }))}
                onBlur={() => params.topic && !params.keywords && suggestKeywordsForTopic(params.topic)}
                className={params.topic ? "border-green-300 bg-green-50" : ""}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="keywords">Keywords (Opsional)</Label>
                <div className="flex items-center gap-2">
                  {params.topic && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => suggestKeywordsForTopic(params.topic)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      <Lightbulb className="h-3 w-3 mr-1" />
                      Auto Keywords
                    </Button>
                  )}
                  {params.keywords && (
                    <span className="text-xs text-green-600 font-medium">
                      {params.keywords.split(',').length} keywords
                    </span>
                  )}
                </div>
              </div>
              <Input
                id="keywords"
                placeholder="e.g. hidroponik, urban farming, teknologi"
                value={params.keywords}
                onChange={(e) => setParams(prev => ({ ...prev, keywords: e.target.value }))}
                className={params.keywords ? "border-green-300 bg-green-50" : ""}
              />
            </div>
          </div>

          {/* Quick Topic Categories */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Categories
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Smart Farming", keywords: "smart farming, IoT, teknologi, digitalisasi" },
                { label: "Pertanian Organik", keywords: "pertanian organik, berkelanjutan, ramah lingkungan" },
                { label: "Hidroponik", keywords: "hidroponik, urban farming, teknologi pertanian" },
                { label: "Ketahanan Pangan", keywords: "ketahanan pangan, swasembada, diversifikasi" },
                { label: "Irigasi Modern", keywords: "irigasi modern, efisiensi air, teknologi irigasi" },
                { label: "Bibit Unggul", keywords: "bibit unggul, varietas lokal, produktivitas" }
              ].map((category, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setParams(prev => ({ 
                    ...prev, 
                    keywords: category.keywords,
                    topic: prev.topic || `Inovasi ${category.label} di Indonesia` 
                  }))}
                  className="text-xs hover:bg-blue-50 hover:border-blue-300"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="tone">Tone Artikel</Label>
              <select
                id="tone"
                value={params.tone}
                onChange={(e) => setParams(prev => ({ ...prev, tone: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="informative">Informatif</option>
                <option value="casual">Santai</option>
                <option value="professional">Profesional</option>
                <option value="educational">Edukatif</option>
                <option value="inspirational">Inspiratif</option>
              </select>
            </div>
            <div>
              <Label htmlFor="length">Panjang Artikel</Label>
              <select
                id="length"
                value={params.length}
                onChange={(e) => setParams(prev => ({ ...prev, length: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="short">Pendek (~300 kata)</option>
                <option value="medium">Sedang (~600 kata)</option>
                <option value="long">Panjang (~1000 kata)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="imageCount">Jumlah Gambar</Label>
              <select
                id="imageCount"
                value={params.imageCount}
                onChange={(e) => setParams(prev => ({ ...prev, imageCount: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded-md"
                disabled={!params.includeImages}
              >
                <option value={1}>1 Gambar</option>
                <option value={2}>2 Gambar</option>
                <option value={3}>3 Gambar</option>
                <option value={4}>4 Gambar</option>
              </select>
            </div>
            <div>
              <Label htmlFor="imageStyle">Style Gambar</Label>
              <select
                id="imageStyle"
                value={params.imageStyle}
                onChange={(e) => setParams(prev => ({ ...prev, imageStyle: e.target.value }))}
                className="w-full p-2 border rounded-md"
                disabled={!params.includeImages}
              >
                <option value="realistic">Realistis</option>
                <option value="illustration">Ilustrasi</option>
                <option value="infographic">Infografik</option>
                <option value="photography">Fotografi</option>
                <option value="artistic">Artistik</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeImages"
              checked={params.includeImages}
              onChange={(e) => setParams(prev => ({ ...prev, includeImages: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="includeImages">Sertakan generasi gambar dengan Imagen</Label>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !params.topic.trim() || !apiKeys.gemini}
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {generatingStep || 'Membuat artikel...'}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Artikel AI
            </>
          )}
        </Button>
      </div>

      {/* Generated Article Preview */}
      {generatedArticle && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Artikel yang Dibuat
              <Badge variant="secondary" className="ml-2">Gemini 2.0 Pro</Badge>
              <Badge variant="secondary">Imagen</Badge>
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{generatedArticle.metadata.tone}</Badge>
              <Badge variant="secondary">{generatedArticle.metadata.length}</Badge>
              <Badge variant="secondary">{generatedArticle.images.length} gambar</Badge>
              {generatedArticle.tags && generatedArticle.tags.length > 0 && (
                <Badge variant="outline">{generatedArticle.tags.length} tags</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{generatedArticle.title}</h3>
              {generatedArticle.excerpt && (
                <p className="text-gray-600 text-sm mb-2 italic">
                  "{generatedArticle.excerpt}"
                </p>
              )}
              {generatedArticle.tags && generatedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {generatedArticle.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedArticle.title)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Judul
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedArticle.content)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Konten
                </Button>
                {generatedArticle.excerpt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedArticle.excerpt)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Excerpt
                  </Button>
                )}
              </div>
            </div>

            {/* Content Preview */}
            <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: parseMarkdown(generatedArticle.content) }} />
            </div>

            {/* Generated Images */}
            {generatedArticle.images.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Gambar yang Dibuat
                  <Badge variant="outline" className="text-xs">Imagen</Badge>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedArticle.images.map((image, index) => (
                    <div key={index} className="border rounded-lg p-2 bg-white">
                      <img
                        src={image}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => copyToClipboard(image)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy URL
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIArticleGenerator;