import { Header } from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { InsuranceTypes } from "@/components/InsuranceTypes";
import { TrustSection } from "@/components/TrustSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="relative flex-1">
        {/* Hero Section - Curtain scroll global */}
        <section className="relative z-0 sticky top-0 min-h-[100svh]">
          <HeroSection />
        </section>

        {/* Insurance Types Section - Curtain effect */}
        <section className="relative z-10 sticky top-0 min-h-[100svh] bg-[#F1F5F9] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15)]">
          <InsuranceTypes />
        </section>

        {/* Trust Section - Curtain effect */}
        <section className="relative z-20 sticky top-0 min-h-[100svh] bg-background shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15)]">
          <TrustSection />
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;