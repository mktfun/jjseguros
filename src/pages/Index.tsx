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
        {/* Hero Section */}
        <section className="relative z-0">
          <HeroSection />
        </section>

        {/* Insurance Types Section */}
        <section className="relative z-10 bg-[#F1F5F9]">
          <InsuranceTypes />
        </section>

        {/* Trust Section */}
        <section className="relative z-20 bg-background">
          <TrustSection />
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
