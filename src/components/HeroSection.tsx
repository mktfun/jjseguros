import { ArrowRight, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  // Dados duplicados para o loop infinito perfeito
  const insurers = [
    { name: "Allianz", logo: "/src/assets/insurers/allianz.png" },
    { name: "Azul Seguros", logo: "/src/assets/insurers/azul-seguros.png" },
    { name: "Bradesco Seguros", logo: "/src/assets/insurers/bradesco-seguros.png" },
    { name: "HDI Seguros", logo: "/src/assets/insurers/hdi-seguros.png" },
    { name: "Porto Seguro", logo: "/src/assets/insurers/porto-seguro.png" },
    { name: "Itaú Seguros", logo: "/src/assets/insurers/itau-seguros.png" }, // Placeholder se não tiver imagem
    { name: "Tokio Marine", logo: "/src/assets/insurers/tokio-marine.png" },
    { name: "Yelum", logo: "/src/assets/insurers/yelum.png" },
    { name: "Zurich", logo: "/src/assets/insurers/zurich.png" },
    { name: "Suhai", logo: "/src/assets/insurers/suhai.png" },
  ];

  return (
    <section className="relative min-h-[100dvh] flex flex-col overflow-hidden bg-background">
      {/* Background Decorativo (Mesh Gradient) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[120px] animate-float-slow" />
      </div>

      {/* Conteúdo Principal (Flex-1 para ocupar o espaço disponível e centralizar) */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 flex-1 flex flex-col justify-center py-24 md:py-20 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Texto Hero */}
          <div className="flex flex-col gap-6 text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center justify-center lg:justify-start gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary w-fit mx-auto lg:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium">+10 anos protegendo o que importa</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Seu seguro com <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary animate-pulse-glow">
                transparência
              </span>{" "}
              e confiança
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mx-auto lg:mx-0 leading-relaxed">
              Encontre a melhor proteção para você, sua família e seu patrimônio. Cotação rápida, atendimento humanizado
              e as melhores seguradoras do mercado.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
              <Link to="/seguros" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-primary to-blue-600 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Fazer Cotação Agora{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full text-base font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                onClick={() => window.open("https://wa.me/5511979699832", "_blank")}
              >
                <Phone className="w-4 h-4 mr-2" />
                Falar com Consultor
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <span>Cotação em minutos</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <span>Melhores seguradoras</span>
              </div>
            </div>
          </div>

          {/* Imagem Hero */}
          <div className="relative animate-fade-in-up delay-200 hidden lg:block">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-white/20 bg-white/5 backdrop-blur-sm group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80"
                alt="Família feliz protegida"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />

              {/* Card Flutuante - Estatística */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 animate-float flex items-center gap-3 max-w-[200px]">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-shield-check"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Clientes Protegidos</p>
                  <p className="text-lg font-bold text-foreground">+1.000</p>
                </div>
              </div>
            </div>

            {/* Elementos Decorativos de Fundo */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl animate-pulse-glow" />
            <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse-glow delay-700" />
          </div>
        </div>
      </div>

      {/* Marquee de Seguradoras (Rodapé do Hero) */}
      <div className="relative z-10 w-full mt-auto border-t border-border/40 bg-background/50 backdrop-blur-sm overflow-hidden py-6">
        <div className="max-w-[1400px] mx-auto px-4">
          <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-muted-foreground/70 uppercase text-center mb-6">
            Trabalhamos com as melhores seguradoras do país
          </p>

          <div className="relative flex w-full overflow-hidden mask-linear-fade">
            <div className="flex min-w-full shrink-0 gap-12 md:gap-20 animate-scroll hover:[animation-play-state:paused] items-center">
              {[...insurers, ...insurers].map((insurer, index) => (
                <div
                  key={`${insurer.name}-${index}`}
                  className="relative group flex items-center justify-center h-8 md:h-10 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-110"
                >
                  {/* Se tiver imagem, mostra imagem, senão texto */}
                  {insurer.logo.includes("placeholder") ? (
                    <span className="text-lg font-bold text-foreground whitespace-nowrap">{insurer.name}</span>
                  ) : (
                    <img
                      src={insurer.logo}
                      alt={insurer.name}
                      className="h-full w-auto object-contain max-w-[120px]"
                      onError={(e) => {
                        // Fallback para texto se a imagem falhar
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerText = insurer.name;
                        e.currentTarget.parentElement!.className =
                          "text-lg font-bold text-foreground whitespace-nowrap";
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
