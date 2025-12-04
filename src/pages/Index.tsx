import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { InsuranceTypes } from "@/components/InsuranceTypes";
import { TrustSection } from "@/components/TrustSection";
import { Footer } from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const Index = () => {
  const mainRef = useRef<HTMLElement>(null);
  
  // Track overall page scroll for dynamic shadow intensity
  const { scrollYProgress } = useScroll();
  
  // Dynamic shadow intensity based on scroll
  const shadowOpacity = useTransform(scrollYProgress, [0, 0.3], [0.05, 0.15]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main ref={mainRef} className="relative flex-1">
        {/* Camada 1 - Hero fica parado no fundo */}
        <div className="sticky top-0 z-0 min-h-[100svh] flex flex-col">
          <HeroSection />
        </div>

        {/* Camada 2 - Cobre o Hero */}
        <motion.div 
          className="sticky top-0 z-10 min-h-[80svh] sm:min-h-[90svh] flex flex-col justify-center bg-[#F1F5F9]"
          style={{
            boxShadow: useTransform(
              shadowOpacity,
              (opacity) => `0 -10px 40px -15px rgba(0,0,0,${opacity})`
            ),
          }}
        >
          <InsuranceTypes />
        </motion.div>

        {/* Camada 3 - Cobre o Insurance */}
        <motion.div 
          className="sticky top-0 z-20 min-h-[80svh] sm:min-h-[90svh] flex flex-col justify-center bg-background"
          style={{
            boxShadow: useTransform(
              shadowOpacity,
              (opacity) => `0 -10px 40px -15px rgba(0,0,0,${opacity * 1.2})`
            ),
          }}
        >
          <TrustSection />
        </motion.div>
      </main>
      
      {/* Footer - Camada final */}
      <motion.div 
        className="relative z-30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{
          boxShadow: "0 -10px 40px -15px rgba(0,0,0,0.1)",
        }}
      >
        <Footer />
      </motion.div>
    </div>
  );
};

export default Index;
