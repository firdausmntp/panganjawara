import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HealthCheckProvider } from "@/components/providers/HealthCheckProvider";
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";
import AuthRedirect from "./components/auth/AuthRedirect";
import Dashboard from "./pages/Dashboard";
import Edukasi from "./pages/Edukasi";
import ArtikelDetail from "./pages/ArtikelDetail";
import Data from "./pages/Data";
import Komunitas from "./pages/Komunitas";
import KomunitasDetail from "./pages/KomunitasDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import AdminNotFound from "./pages/AdminNotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <HealthCheckProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="edukasi" element={<Edukasi />} />
              <Route path="edukasi/artikel/:id" element={<ArtikelDetail />} />
              <Route path="data" element={<Data />} />
              <Route path="komunitas" element={<Komunitas />} />
              <Route path="komunitas/:id/detail" element={<KomunitasDetail />} />
            </Route>
            
            {/* Admin Authentication */}
            <Route path="/admon" element={<AdminLogin />} />
            
            {/* Admin Routes - Protected */}
            <Route path="/admin" element={<AuthRedirect />} />
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="*" element={<AdminNotFound />} />
            </Route>
            
            {/* Catch all other routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HealthCheckProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
