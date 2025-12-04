import { Button } from "./ui/button";
import { Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const HeroSection = () => {
  const trustPoints = [
    "Cotação em minutos",
    "Melhores seguradoras",
    "Atendimento personalizado",
  ];

  return (
    <section className="relative overflow-hidden mesh-gradient-hero noise-overlay pt-28 sm:pt-32 pb-20 sm:pb-28 lg:pb-32">
      {/* Floating decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-[15%] w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-40 right-[25%] w-32 h-32 bg-secondary/8 rounded-full blur-2xl animate-float-slow" />
      </div>
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Text content */}
          <div className="text-center lg:text-left">
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-foreground shadow-sm"
            >
              <Shield size={16} className="text-secondary" />
              <span>+10 anos protegendo o que importa</span>
            </motion.div>

            {/* Main headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6 text-4xl font-extrabold tracking-[-0.02em] text-foreground sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]"
            >
              Seu seguro com{" "}
              <span className="relative">
                <span className="text-secondary">transparência</span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary/30" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 4 150 4 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>{" "}
              e confiança
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8 text-lg text-muted-foreground sm:text-xl lg:text-2xl max-w-xl mx-auto lg:mx-0"
            >
              Encontre a melhor proteção para você, sua família e seu patrimônio. 
              Cotação rápida e sem compromisso.
            </motion.p>

            {/* Trust points */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6"
            >
              {trustPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button variant="cta" size="xl" className="w-full sm:w-auto group shadow-glow" asChild>
                <Link to="/cotacao">
                  Fazer Cotação Agora
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline-subtle" size="lg" className="w-full sm:w-auto glass hover:bg-white/90">
                Falar com Consultor
              </Button>
            </motion.div>
          </div>

          {/* Right column - Real Photo with Fade */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg">
              {/* Decorative glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-secondary/10 to-transparent rounded-3xl blur-3xl scale-110" />
              
              {/* Main image container with gradient mask */}
              <div 
                className="relative rounded-2xl overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&auto=format&fit=crop&q=80"
                  alt="Família feliz e protegida"
                  className="w-full h-auto object-cover rounded-2xl"
                />
              </div>

              {/* Stats overlay card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute top-8 -right-4 glass-card rounded-xl px-4 py-3 shadow-elevated"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Shield size={20} className="text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">+5.000</div>
                    <div className="text-xs text-muted-foreground">Clientes protegidos</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="absolute bottom-24 -left-6 glass-card rounded-xl px-4 py-3 shadow-elevated"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-success" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Cotação aprovada</div>
                    <div className="text-xs text-muted-foreground">há 2 minutos</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Partners Marquee Section */}
        <PartnersMarquee />
      </div>
    </section>
  );
};

// Insurer logos imports
import allianzLogo from "@/assets/insurers/allianz.png";
import azulSegurosLogo from "@/assets/insurers/azul-seguros.png";
import bradescoSegurosLogo from "@/assets/insurers/bradesco-seguros.png";
import hdiSegurosLogo from "@/assets/insurers/hdi-seguros.png";
import portoSeguroLogo from "@/assets/insurers/porto-seguro.png";
import tokioMarineLogo from "@/assets/insurers/tokio-marine.png";
import yelumLogo from "@/assets/insurers/yelum.png";
import zurichLogo from "@/assets/insurers/zurich.png";
import suhaiLogo from "@/assets/insurers/suhai.png";

const insurers = [
  { name: "Allianz", logo: allianzLogo },
  { name: "Azul Seguros", logo: azulSegurosLogo },
  { name: "Bradesco Seguros", logo: bradescoSegurosLogo },
  { name: "HDI Seguros", logo: hdiSegurosLogo },
  { name: "Porto Seguro", logo: portoSeguroLogo },
  { name: "Tokio Marine", logo: tokioMarineLogo },
  { name: "Yelum", logo: yelumLogo },
  { name: "Zurich", logo: zurichLogo },
  { name: "Suhai", logo: suhaiLogo },
];

const PartnersMarquee = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="mt-16 lg:mt-24 w-full border-t border-foreground/5 pt-10"
    >
      {/* Title */}
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-8 text-center">
        Trabalhamos com as melhores seguradoras do país
      </p>

      {/* Marquee Container with CSS mask */}
      <div
        className="relative flex w-full overflow-hidden py-6"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
        }}
      >
        {/* Animated Track - duplicated content for seamless loop */}
        <div className="flex min-w-full shrink-0 items-center gap-16 animate-scroll hover:[animation-play-state:paused]">
          {insurers.map((insurer, index) => (
            <img
              key={`first-${insurer.name}-${index}`}
              src={insurer.logo}
              alt={insurer.name}
              className="h-8 sm:h-10 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer"
            />
          ))}
        </div>
        {/* Duplicate for seamless loop */}
        <div className="flex min-w-full shrink-0 items-center gap-16 animate-scroll hover:[animation-play-state:paused]">
          {insurers.map((insurer, index) => (
            <img
              key={`second-${insurer.name}-${index}`}
              src={insurer.logo}
              alt={insurer.name}
              className="h-8 sm:h-10 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};