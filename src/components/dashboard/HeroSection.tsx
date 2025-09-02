import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Membangun Ketahanan Pangan Indonesia",
      subtitle: "Platform digital terintegrasi untuk mendukung kedaulatan pangan nasional",
      image: "/api/placeholder/1920/600",
      stats: [
        { label: "Provinsi Terjangkau", value: "34" },
        { label: "Petani Terdaftar", value: "2.5M+" },
        { label: "Data Real-time", value: "24/7" }
      ]
    },
    {
      title: "Data & Analitik Real-time",
      subtitle: "Monitoring produksi, distribusi, dan konsumsi pangan secara komprehensif",
      image: "/api/placeholder/1920/600",
      stats: [
        { label: "Komoditas Dipantau", value: "150+" },
        { label: "Update Data", value: "Real-time" },
        { label: "Akurasi", value: "99.9%" }
      ]
    },
    {
      title: "Inovasi untuk Pertanian Modern",
      subtitle: "Teknologi terdepan untuk meningkatkan produktivitas dan efisiensi",
      image: "/api/placeholder/1920/600",
      stats: [
        { label: "Startup Terdaftar", value: "500+" },
        { label: "Investasi", value: "Rp 2.3T" },
        { label: "Inovasi", value: "1000+" }
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-gradient-earth">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Slides */}
      <div className="relative h-full flex transition-transform duration-500 ease-out"
           style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((slide, index) => (
          <div key={index} className="min-w-full h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="text-primary-foreground">
                  <h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-in slide-in-from-left duration-700">
                    {slide.title}
                  </h1>
                  <p className="text-xl lg:text-2xl mb-8 text-primary-foreground/90 animate-in slide-in-from-left duration-700 delay-100">
                    {slide.subtitle}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mb-8 animate-in slide-in-from-left duration-700 delay-200">
                    <Button 
                      size="lg"
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
                    >
                      Mulai Sekarang
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      Pelajari Lebih Lanjut
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 animate-in slide-in-from-bottom duration-700 delay-300">
                    {slide.stats.map((stat, idx) => (
                      <div key={idx} className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="text-3xl font-bold text-secondary mb-1">{stat.value}</div>
                        <div className="text-sm text-primary-foreground/80">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="hidden lg:block">
                  {/* Space for future image/visualization */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary-foreground/20 backdrop-blur-sm hover:bg-primary-foreground/30 transition-colors"
      >
        <ChevronLeft className="text-primary-foreground" size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary-foreground/20 backdrop-blur-sm hover:bg-primary-foreground/30 transition-colors"
      >
        <ChevronRight className="text-primary-foreground" size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentSlide === index 
                ? "w-8 bg-secondary" 
                : "bg-primary-foreground/50 hover:bg-primary-foreground/70"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;