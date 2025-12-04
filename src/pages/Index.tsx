import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { InsuranceTypes } from "@/components/InsuranceTypes";
import { TrustSection } from "@/components/TrustSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="relative flex-1">
        {/* Camada 1 - Hero fica parado no fundo */}
        <div className="sticky top-0 z-0 min-h-screen flex flex-col">
          <HeroSection />
        </div>

        {/* Camada 2 - Cobre o Hero */}
        <div className="sticky top-0 z-10 min-h-screen flex flex-col bg-[#F1F5F9] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <InsuranceTypes />
        </div>

        {/* Camada 3 - Cobre o Insurance */}
        <div className="sticky top-0 z-20 min-h-screen flex flex-col bg-background shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <TrustSection />
        </div>
      </main>
      
      {/* Footer - Camada final */}
      <div className="relative z-30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
