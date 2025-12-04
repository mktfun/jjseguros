import { Button } from "./ui/button";
import { Shield, CheckCircle2, ArrowRight } from "lucide-react";

export const HeroSection = () => {
  const trustPoints = [
    "Cotação em minutos",
    "Melhores seguradoras",
    "Atendimento personalizado",
  ];

  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-24">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--secondary)/0.08)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(var(--primary)/0.04)_0%,_transparent_50%)]" />
      
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          {/* Trust badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground animate-fade-in">
            <Shield size={16} className="text-secondary" />
            <span>+10 anos protegendo o que importa</span>
          </div>

          {/* Main headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Seu seguro com{" "}
            <span className="text-secondary">transparência</span>{" "}
            e confiança
          </h1>

          {/* Subheadline */}
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Encontre a melhor proteção para você, sua família e seu patrimônio. 
            Cotação rápida e sem compromisso.
          </p>

          {/* Trust points */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {trustPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 size={18} className="text-success" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button variant="cta" size="xl" className="w-full sm:w-auto group">
              Fazer Cotação Agora
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline-subtle" size="lg" className="w-full sm:w-auto">
              Falar com Consultor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
