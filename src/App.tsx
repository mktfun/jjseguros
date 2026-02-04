import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { CookieConsent } from "./components/CookieConsent";
import { AuthProvider } from "./hooks/useAuth";
import { useMetaPixelInit } from "./hooks/useMetaPixelInit";
import Index from "./pages/Index";
import Cotacao from "./pages/Cotacao";
import InsuranceHub from "./pages/InsuranceHub";
import Success from "./pages/Success";
import Links from "./pages/Links";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminConfig from "./pages/admin/AdminConfig";
import AdminLeadDetail from "./pages/admin/AdminLeadDetail";

const queryClient = new QueryClient();

// Componente interno que usa hooks
const AppContent = () => {
  // Inicializar Meta Pixel a partir das configurações do banco
  useMetaPixelInit();

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/seguros" element={<InsuranceHub />} />
          <Route path="/cotacao" element={<Cotacao />} />
          <Route path="/sucesso" element={<Success />} />
          <Route path="/links" element={<Links />} />
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/admin/leads/:id" element={<AdminLeadDetail />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/config" element={<AdminConfig />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsent />
      </AuthProvider>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
