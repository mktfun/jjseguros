import { Car, Home, Heart, Building2, Plane, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";

const insuranceTypes = [
  {
    icon: Car,
    title: "Auto",
    description: "Proteção completa para seu veículo",
    color: "from-blue-500/20 to-blue-600/10",
  },
  {
    icon: Home,
    title: "Residencial",
    description: "Segurança para sua casa e bens",
    color: "from-amber-500/20 to-amber-600/10",
  },
  {
    icon: Heart,
    title: "Vida",
    description: "Tranquilidade para sua família",
    color: "from-rose-500/20 to-rose-600/10",
  },
  {
    icon: Building2,
    title: "Empresarial",
    description: "Proteja seu negócio",
    color: "from-slate-500/20 to-slate-600/10",
  },
  {
    icon: Plane,
    title: "Viagem",
    description: "Viaje com segurança",
    color: "from-sky-500/20 to-sky-600/10",
  },
  {
    icon: Users,
    title: "Saúde",
    description: "Cuidado quando precisar",
    color: "from-emerald-500/20 to-emerald-600/10",
  },
];

export const InsuranceTypes = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
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
      const scrollAmount = 220;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative bg-slate-50/80 noise-overlay py-20 sm:py-24">
      {/* Subtle floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-[20%] w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="container mx-auto mb-10 max-w-2xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Nossos Seguros
          </h2>
          <p className="text-lg text-muted-foreground">
            Soluções completas para todas as suas necessidades de proteção
          </p>
        </motion.div>

        {/* Carousel container */}
        <div className="relative">
          {/* Navigation arrows - Desktop only */}
          <div className="hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full glass-card shadow-elevated hover:bg-background/90 transition-all duration-300 ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <ChevronLeft size={24} className="text-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full glass-card shadow-elevated hover:bg-background/90 transition-all duration-300 ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <ChevronRight size={24} className="text-foreground" />
            </Button>
          </div>

          {/* Gradient masks for scroll indication */}
          <div className={`absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-background/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-background/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

          {/* Scrollable container */}
          <motion.div
            ref={scrollRef}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 sm:px-12 lg:px-20 pb-4 scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {insuranceTypes.map((insurance, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="group relative flex-shrink-0 snap-center flex flex-col items-center rounded-xl bg-white border border-border/50 shadow-sm p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-md hover:border-secondary/30 min-w-[180px] sm:min-w-[200px]"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${insurance.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 transition-all duration-300 group-hover:bg-secondary/20 group-hover:scale-110">
                    <insurance.icon 
                      size={28} 
                      className="text-secondary transition-all duration-300 group-hover:scale-110" 
                    />
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-foreground text-center">
                    {insurance.title}
                  </h3>
                  <p className="text-center text-xs text-muted-foreground">
                    {insurance.description}
                  </p>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-secondary/0 group-hover:ring-secondary/20 transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
