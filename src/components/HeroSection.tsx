import { Button } from "./ui/button";
import { Shield, CheckCircle2, ArrowRight, Car, Home, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const HeroSection = () => {
  const trustPoints = [
    "Cotação em minutos",
    "Melhores seguradoras",
    "Atendimento personalizado",
  ];

  return (
    <section className="relative overflow-hidden mesh-gradient-hero noise-overlay py-20 sm:py-28 lg:py-32">
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

          {/* Right column - Visual element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main visual card */}
              <div className="relative glass-card rounded-2xl p-8 shadow-premium">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-secondary/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                
                <div className="relative space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-secondary">+5.000</div>
                      <div className="text-xs text-muted-foreground mt-1">Clientes protegidos</div>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-success">98%</div>
                      <div className="text-xs text-muted-foreground mt-1">Satisfação</div>
                    </div>
                  </div>

                  {/* Abstract geometric element */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/30 to-secondary/10 rotate-6 animate-float" />
                      <div className="absolute inset-2 rounded-xl bg-gradient-to-tr from-secondary/20 to-primary/10 -rotate-3 animate-float-slow" />
                      <div className="absolute inset-4 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <Shield className="w-10 h-10 text-secondary" />
                      </div>
                    </div>
                  </div>

                  {/* Trust message */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield size={16} className="text-secondary" />
                      <span>Parceiro das maiores seguradoras</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -bottom-6 -left-6 glass-card rounded-xl px-4 py-3 shadow-elevated"
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
      </div>
    </section>
  );
};
