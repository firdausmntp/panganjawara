import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, X, ArrowUp, Mail, Phone, MessageCircle } from "lucide-react";
import Navigation from "./Navigation";
import PrivacyModal from "../modals/PrivacyModal";
import TermsModal from "../modals/TermsModal";
import AIAssistant from "../ai/AIAssistant";
import { cn } from "@/lib/utils";

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // AI Assistant API integration
  const callAI = async (prompt: string): Promise<string> => {
    try {
      const apiKey = (import.meta as any).env?.VITE_AI_API_KEY || "key-veng";
      const res = await fetch("https://api.ferdev.my.id/ai/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      return (data?.message || "(tidak ada jawaban)").trim();
    } catch (e) {
      // console.error("AI API error", e);
      return "Terjadi kesalahan mengambil jawaban dari AI. Coba lagi nanti.";
    }
  };

  // Track scroll for navbar effects
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 20);
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out",
          "border-b border-white/20",
          isScrolled 
            ? "bg-white/30 backdrop-blur-3xl shadow-2xl shadow-white/10" 
            : "bg-white/20 backdrop-blur-2xl"
        )}
        style={{
          background: isScrolled 
            ? `
              linear-gradient(135deg, 
                rgba(255,255,255,0.25) 0%, 
                rgba(255,255,255,0.15) 25%,
                rgba(255,255,255,0.35) 50%,
                rgba(255,255,255,0.20) 75%,
                rgba(255,255,255,0.30) 100%
              ),
              radial-gradient(circle at 20% 80%, rgba(120,200,120,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(60,180,60,0.08) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)
            `
            : `
              linear-gradient(135deg, 
                rgba(255,255,255,0.20) 0%, 
                rgba(255,255,255,0.10) 25%,
                rgba(255,255,255,0.25) 50%,
                rgba(255,255,255,0.15) 75%,
                rgba(255,255,255,0.22) 100%
              ),
              radial-gradient(circle at 30% 70%, rgba(100,200,100,0.08) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(80,180,80,0.06) 0%, transparent 50%)
            `,
          borderImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent) 1'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div 
                onClick={() => navigate('/')}
                className="cursor-pointer hover:opacity-80 transition-opacity duration-300"
              >
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-400 bg-clip-text text-transparent tracking-tight">
                  Pangan Jawara
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <Navigation />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 hover:bg-white/30 hover:border-white/40 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-white/40 hover:scale-105 shadow-xl shadow-white/10 hover:shadow-2xl hover:shadow-white/20"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(255,255,255,0.25) 0%, 
                    rgba(255,255,255,0.15) 50%,
                    rgba(255,255,255,0.30) 100%
                  )
                `
              }}
            >
              {isMobileMenuOpen ? 
                <X size={20} className="text-foreground sm:w-6 sm:h-6" /> : 
                <Menu size={20} className="text-foreground sm:w-6 sm:h-6" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 backdrop-blur-3xl max-h-screen overflow-y-auto"
               style={{
                 background: `
                   linear-gradient(180deg, 
                     rgba(255,255,255,0.30) 0%, 
                     rgba(255,255,255,0.25) 50%,
                     rgba(255,255,255,0.35) 100%
                   ),
                   radial-gradient(circle at 50% 0%, rgba(120,200,120,0.05) 0%, transparent 70%)
                 `
               }}>
            <div className="container mx-auto px-4 sm:px-6 py-4">
              <div className="backdrop-blur-2xl rounded-2xl p-3 sm:p-4 border border-white/30 shadow-2xl shadow-white/10"
                   style={{
                     background: `
                       linear-gradient(135deg, 
                         rgba(255,255,255,0.25) 0%, 
                         rgba(255,255,255,0.15) 25%,
                         rgba(255,255,255,0.30) 75%,
                         rgba(255,255,255,0.20) 100%
                       ),
                       radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)
                     `
                   }}>
                <Navigation mobile onItemClick={() => setIsMobileMenuOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16 sm:pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-white mt-24 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-6 py-16 relative">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12 mb-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                    Pangan Jawara
                  </h3>
                  <p className="text-gray-300 text-sm">Platform Ketahanan Pangan Untirta</p>
                </div>
              </div>
              <p className="text-gray-100 leading-relaxed mb-6 max-w-md">
                Platform digital untuk mendukung ketahanan pangan Indonesia melalui data terpercaya, 
                edukasi berkualitas, dan teknologi modern.
              </p>
              
              
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Navigasi</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-200 hover:text-green-400 transition-colors">Beranda</a></li>
                <li><a href="/edukasi" className="text-gray-200 hover:text-green-400 transition-colors">Edukasi</a></li>
                <li><a href="/data" className="text-gray-200 hover:text-green-400 transition-colors">Data & Analytics</a></li>
                <li><a href="/komunitas" className="text-gray-200 hover:text-green-400 transition-colors">Komunitas</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="relative">
              <h4 className="font-semibold text-white mb-4">Kontak</h4>
              <div className="space-y-3 text-sm">
                <a 
                  href="mailto:support@panganjawara.id" 
                  className="flex items-center space-x-3 text-gray-200 hover:text-green-400 transition-colors cursor-pointer group"
                >
                  <Mail className="h-4 w-4 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>fsumyid@fsu.my.id</span>
                </a>
                <a 
                  href="tel:0800-JAWARA" 
                  className="flex items-center space-x-3 text-gray-200 hover:text-green-400 transition-colors cursor-pointer group"
                >
                  <Phone className="h-4 w-4 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>0800-JAWARA</span>
                </a>
                <a 
                  href="https://wa.me/6281212571925?text=Halo%20Pangan%20Jawara%2C%20saya%20ingin%20bertanya%20mengenai%20platform%20ini" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-200 hover:text-green-400 transition-colors cursor-pointer group"
                >
                  <MessageCircle className="h-4 w-4 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>+62 812-JAWARA</span>
                </a>
              </div>
              
              {/* Back to Top Button */}
              <button
                onClick={scrollToTop}
                className="absolute -top-2 -right-2 p-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Kembali ke atas"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col items-center space-y-4 text-center">
              <p className="text-gray-200 text-sm max-w-xl">
                &copy; {new Date().getFullYear()} <span className="text-green-400 font-medium">Pangan Jawara</span> - Platform Ketahanan Pangan Untirta
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-gray-200 hover:text-green-400 transition-colors cursor-pointer"
                >
                  Kebijakan Privasi
                </button>
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="text-gray-200 hover:text-green-400 transition-colors cursor-pointer"
                >
                  Syarat & Ketentuan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-green-500/10 to-transparent rounded-full blur-2xl"></div>
      </footer>

      {/* Modal Components */}
      {showPrivacyModal && <PrivacyModal onClose={() => setShowPrivacyModal(false)} />}
      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}

      {/* AI Assistant */}
  <AIAssistant onApiCall={callAI} />
    </div>
  );
};

export default MainLayout;