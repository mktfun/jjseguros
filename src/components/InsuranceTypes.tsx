import { Car, Home, Heart, Building2, Plane, Users, ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const insuranceTypes = [
  {
    icon: Car,
    title: "Auto",
    description: "Cobertura contra roubo, colisão e terceiros",
    color: "from-blue-500/20 to-blue-600/10",
    featured: true,
    type: "auto",
  },
  {
    icon: Home,
    title: "Residencial",
    description: "Proteção contra incêndio, roubo e danos",
    color: "from-amber-500/20 to-amber-600/10",
    featured: false,
    type: "residencial",
  },
  {
    icon: Heart,
    title: "Vida",
    description: "Segurança financeira para quem você ama",
    color: "from-rose-500/20 to-rose-600/10",
    featured: false,
    type: "vida",
  },
  {
    icon: Building2,
    title: "Empresarial",
    description: "Riscos operacionais e responsabilidade civil",
    color: "from-slate-500/20 to-slate-600/10",
    featured: false,
    type: "empresarial",
  },
  {
    icon: Plane,
    title: "Viagem",
    description: "Assistência médica e bagagem internacional",
    color: "from-sky-500/20 to-sky-600/10",
    featured: false,
    type: "viagem",
  },
  {
    icon: Users,
    title: "Saúde",
    description: "Consultas, exames e emergências cobertas",
    color: "from-emerald-500/20 to-emerald-600/10",
    featured: false,
    type: "saude",
  },
];

export const InsuranceTypes = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      
      // Calculate active index for dots
      const cardWidth = 240;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(newIndex, insuranceTypes.length - 1));
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        ref.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 260;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative noise-overlay py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-slate-50 via-slate-100/80 to-slate-50">
      {/* Dot pattern background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 right-[10%] w-60 sm:w-80 h-60 sm:h-80 bg-secondary/8 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 left-[5%] w-72 sm:w-96 h-72 sm:h-96 bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="container mx-auto mb-8 sm:mb-12 max-w-2xl text-center px-4 sm:px-6"
        >
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-secondary mb-3 sm:mb-4 bg-secondary/10 px-3 sm:px-4 py-1.5 rounded-full">
            <Sparkles size={14} />
            +6 tipos de seguro
          </span>
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-foreground">
            Proteção para o que{" "}
            <span className="text-secondary">importa</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Escolha a cobertura ideal para cada momento da sua vida
          </p>
        </motion.div>

        {/* Carousel container */}
        <div className="relative overflow-hidden">
          {/* Navigation arrows - Desktop only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 hover:shadow-lg transition-all duration-300 ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronLeft size={24} className="text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 hover:shadow-lg transition-all duration-300 ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronRight size={24} className="text-foreground" />
          </Button>

          {/* Gradient masks */}
          <div className={`absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-slate-100 via-slate-100/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-slate-100 via-slate-100/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 sm:px-8 lg:px-16 py-4 scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {insuranceTypes.map((insurance, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`group relative flex-shrink-0 snap-center flex flex-col items-center rounded-2xl bg-white border shadow-sm p-5 sm:p-6 cursor-pointer overflow-hidden min-w-[200px] sm:min-w-[220px] lg:min-w-[240px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                  insurance.featured 
                    ? 'border-secondary/30 ring-1 ring-secondary/10' 
                    : 'border-slate-200'
                }`}
              >
                {/* Featured badge */}
                {insurance.featured && (
                  <div className="absolute -top-0 -right-0 bg-secondary text-white text-[10px] font-semibold px-2.5 py-1 rounded-bl-lg rounded-tr-2xl">
                    Mais cotado
                  </div>
                )}

                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${insurance.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative z-10 w-full">
                  <div className={`mb-4 sm:mb-5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl mx-auto ${
                    insurance.featured ? 'bg-secondary/15' : 'bg-secondary/10'
                  } group-hover:bg-secondary/20 transition-colors duration-300`}>
                    <insurance.icon size={28} className="text-secondary" />
                  </div>
                  <h3 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-semibold text-foreground text-center">
                    {insurance.title}
                  </h3>
                  <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5 leading-relaxed min-h-[36px] sm:min-h-[40px]">
                    {insurance.description}
                  </p>
                  
                  {/* CTA button */}
                  <Link 
                    to={`/cotacao?type=${insurance.type}`}
                    className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-secondary bg-secondary/10 hover:bg-secondary hover:text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl transition-colors duration-200"
                  >
                    <span>Fazer cotação</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile scroll indicator */}
          <div className="flex md:hidden justify-center items-center gap-3 mt-4 sm:mt-6 px-4">
            <div className="flex gap-1.5">
              {insuranceTypes.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === activeIndex 
                      ? 'w-5 sm:w-6 bg-secondary' 
                      : 'w-1.5 bg-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground ml-2">
              Deslize para ver mais
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
