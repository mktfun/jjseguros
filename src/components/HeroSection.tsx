import { Button } from "./ui/button";
import { Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { AnimatedHeadline } from "./AnimatedText";
import { AnimatedCounter } from "./AnimatedCounter";
import { FloatingParticles } from "./FloatingParticles";

export const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms for decorative elements
  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const blob3Y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const contentScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const trustPoints = [
    "Cotação em minutos",
    "Melhores seguradoras",
    "Atendimento personalizado",
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative overflow-hidden mesh-gradient-hero noise-overlay pt-28 sm:pt-32 pb-12 sm:pb-16 lg:pb-20 min-h-[100svh] flex flex-col"
    >
      {/* Floating particles */}
      <FloatingParticles count={6} />

      {/* Floating decorative shapes with parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y: blob1Y }}
          className="absolute top-20 left-[10%] w-64 h-64 bg-secondary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          style={{ y: blob2Y }}
          className="absolute bottom-20 right-[15%] w-80 h-80 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div 
          style={{ y: blob3Y }}
          className="absolute top-40 right-[25%] w-32 h-32 bg-secondary/8 rounded-full blur-2xl"
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>
      
      <motion.div 
        style={{ opacity: contentOpacity, scale: contentScale }}
        className="container relative z-10 flex-1 flex flex-col justify-center"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Text content */}
          <div className="text-center lg:text-left">
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.1,
                type: "spring",
                stiffness: 100,
              }}
              className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-foreground shadow-sm"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Shield size={16} className="text-secondary" />
              </motion.div>
              <span>+10 anos protegendo o que importa</span>
            </motion.div>

            {/* Main headline with staggered word animation */}
            <AnimatedHeadline
              line1="Seu seguro com"
              highlight="transparência"
              line2="e confiança"
              className="mb-6 text-4xl font-extrabold tracking-[-0.02em] text-foreground sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]"
            />

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-8 text-lg text-muted-foreground sm:text-xl lg:text-2xl max-w-xl mx-auto lg:mx-0"
            >
              Encontre a melhor proteção para você, sua família e seu patrimônio. 
              Cotação rápida e sem compromisso.
            </motion.p>

            {/* Trust points with stagger */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6"
            >
              {trustPoints.map((point, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.7 + index * 0.1,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.8 + index * 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                  </motion.div>
                  <span>{point}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button variant="cta" size="xl" className="w-full sm:w-auto group shadow-glow" asChild>
                  <Link to="/cotacao">
                    Fazer Cotação Agora
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button variant="outline-subtle" size="lg" className="w-full sm:w-auto glass hover:bg-white/90">
                  Falar com Consultor
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Right column - Real Photo with Fade */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 60, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.4, 
              type: "spring",
              stiffness: 60,
              damping: 20,
            }}
            className="relative hidden lg:flex items-center justify-center perspective-1000"
          >
            <div className="relative w-full max-w-lg">
              {/* Decorative glow behind image */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-secondary/10 to-transparent rounded-3xl blur-3xl scale-110"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1.1, 1.15, 1.1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
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
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.9, type: "spring" }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="absolute top-8 -right-4 glass-card rounded-xl px-4 py-3 shadow-elevated cursor-default"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Shield size={20} className="text-secondary" />
                  </motion.div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      <AnimatedCounter value={1000} prefix="+" />
                    </div>
                    <div className="text-xs text-muted-foreground">Clientes protegidos</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.1, type: "spring" }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="absolute bottom-24 -left-6 glass-card rounded-xl px-4 py-3 shadow-elevated cursor-default"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    <CheckCircle2 size={20} className="text-success" />
                  </motion.div>
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
      </motion.div>
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
      transition={{ duration: 0.6, delay: 1.0 }}
      className="mt-auto pt-8 lg:pt-12 w-full border-t border-foreground/5"
    >
      {/* Title */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-8 text-center"
      >
        Trabalhamos com as melhores seguradoras do país
      </motion.p>

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
            <motion.img
              key={`first-${insurer.name}-${index}`}
              src={insurer.logo}
              alt={insurer.name}
              className="h-8 sm:h-10 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.15 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          ))}
        </div>
        {/* Duplicate for seamless loop */}
        <div className="flex min-w-full shrink-0 items-center gap-16 animate-scroll hover:[animation-play-state:paused]">
          {insurers.map((insurer, index) => (
            <motion.img
              key={`second-${insurer.name}-${index}`}
              src={insurer.logo}
              alt={insurer.name}
              className="h-8 sm:h-10 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.15 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
