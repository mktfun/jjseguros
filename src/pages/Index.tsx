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
        {/* Hero Section - sticky only on desktop */}
        <section className="relative z-0 lg:sticky lg:top-0 min-h-[100svh]">
          <HeroSection />
        </section>

        {/* Insurance Types Section - curtain effect on desktop */}
        <section className="relative z-10 lg:sticky lg:top-0 bg-[#F1F5F9] shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
          <InsuranceTypes />
        </section>

        {/* Trust Section - curtain effect on desktop */}
        <section className="relative z-20 lg:sticky lg:top-0 bg-background shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <TrustSection />
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
