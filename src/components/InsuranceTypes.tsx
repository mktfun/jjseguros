import { Car, Home, Heart, Building2, Plane, Users, ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";

const insuranceTypes = [
  {
    icon: Car,
    title: "Auto",
    description: "Cobertura contra roubo, colisão e terceiros",
    color: "from-blue-500/20 to-blue-600/10",
    featured: true,
  },
  {
    icon: Home,
    title: "Residencial",
    description: "Proteção contra incêndio, roubo e danos",
    color: "from-amber-500/20 to-amber-600/10",
    featured: false,
  },
  {
    icon: Heart,
    title: "Vida",
    description: "Segurança financeira para quem você ama",
    color: "from-rose-500/20 to-rose-600/10",
    featured: false,
  },
  {
    icon: Building2,
    title: "Empresarial",
    description: "Riscos operacionais e responsabilidade civil",
    color: "from-slate-500/20 to-slate-600/10",
    featured: false,
  },
  {
    icon: Plane,
    title: "Viagem",
    description: "Assistência médica e bagagem internacional",
    color: "from-sky-500/20 to-sky-600/10",
    featured: false,
  },
  {
    icon: Users,
    title: "Saúde",
    description: "Consultas, exames e emergências cobertas",
    color: "from-emerald-500/20 to-emerald-600/10",
    featured: false,
  },
];

export const InsuranceTypes = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Section reveal animation
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.5]);
  const sectionY = useTransform(scrollYProgress, [0, 0.2], [60, 0]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      
      // Calculate active index for dots
      const cardWidth = 260; // approximate card width + gap
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

  // Card animation variants
  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.9,
      filter: "blur(10px)",
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        delay: index * 0.1,
      },
    }),
  };

  return (
    <motion.section 
      ref={sectionRef}
      style={{ opacity: sectionOpacity }}
      className="relative noise-overlay py-20 sm:py-28 bg-gradient-to-b from-slate-50 via-slate-100/80 to-slate-50"
    >
      {/* Dot pattern background */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Decorative shapes with parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-20 right-[10%] w-80 h-80 bg-secondary/8 rounded-full blur-[100px]"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-20 left-[5%] w-96 h-96 bg-primary/5 rounded-full blur-[120px]"
          animate={{ 
            y: [0, 15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/3 rounded-full blur-[150px]"
        />
      </div>

      <motion.div 
        style={{ y: sectionY }}
        className="relative z-10"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: 0.6,
            type: "spring",
            stiffness: 80,
          }}
          className="container mx-auto mb-12 max-w-2xl text-center px-6"
        >
          <motion.span
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary mb-4 bg-secondary/10 px-4 py-1.5 rounded-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            <Sparkles size={14} />
            +6 tipos de seguro
          </motion.span>
          <motion.h2 
            className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Proteção para o que{" "}
            <span className="text-secondary">importa</span>
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Escolha a cobertura ideal para cada momento da sua vida
          </motion.p>
        </motion.div>

        {/* Carousel container */}
        <div className="relative overflow-hidden">
          {/* Navigation arrows - Desktop only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronLeft size={24} className="text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronRight size={24} className="text-foreground" />
          </Button>

          {/* Gradient masks for scroll indication */}
          <div className={`absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-slate-100 via-slate-100/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-slate-100 via-slate-100/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 sm:px-12 lg:px-20 py-6 scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {insuranceTypes.map((insurance, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ 
                  y: -10,
                  scale: 1.03,
                  transition: { 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20 
                  }
                }}
                whileTap={{ scale: 0.98 }}
                className={`group relative flex-shrink-0 snap-center flex flex-col items-center rounded-2xl bg-white border shadow-sm p-7 cursor-pointer overflow-hidden min-w-[220px] sm:min-w-[240px] ${
                  insurance.featured 
                    ? 'border-secondary/30 ring-1 ring-secondary/10' 
                    : 'border-slate-200'
                }`}
                style={{
                  boxShadow: insurance.featured 
                    ? "0 8px 30px -8px rgba(99,102,241,0.2), 0 4px 20px -4px rgba(0,0,0,0.08)"
                    : "0 4px 20px -4px rgba(0,0,0,0.08)",
                }}
              >
                {/* Featured badge */}
                {insurance.featured && (
                  <motion.div 
                    className="absolute -top-0 -right-0 bg-secondary text-white text-[10px] font-semibold px-3 py-1 rounded-bl-lg rounded-tr-2xl"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Mais cotado
                  </motion.div>
                )}

                {/* Gradient background on hover */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${insurance.color}`}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  initial={{ boxShadow: "0 0 0 0 rgba(99,102,241,0)" }}
                  whileHover={{ 
                    boxShadow: "0 0 40px -5px rgba(99,102,241,0.35)",
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="relative z-10 w-full">
                  <motion.div 
                    className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl mx-auto ${
                      insurance.featured ? 'bg-secondary/15' : 'bg-secondary/10'
                    }`}
                    whileHover={{ 
                      scale: 1.1,
                      backgroundColor: "rgba(99,102,241,0.25)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Breathing icon animation */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: index * 0.2,
                      }}
                    >
                      <insurance.icon 
                        size={32} 
                        className="text-secondary" 
                      />
                    </motion.div>
                  </motion.div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground text-center">
                    {insurance.title}
                  </h3>
                  <p className="text-center text-sm text-muted-foreground mb-5 leading-relaxed min-h-[40px]">
                    {insurance.description}
                  </p>
                  
                  {/* Always visible CTA button */}
                  <motion.button
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-secondary bg-secondary/10 hover:bg-secondary hover:text-white py-2.5 px-4 rounded-xl transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Fazer cotação</span>
                    <ArrowRight size={16} />
                  </motion.button>
                </div>

                {/* Border glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent"
                  whileHover={{ 
                    borderColor: "rgba(99,102,241,0.3)",
                  }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>
            ))}
          </div>

          {/* Mobile scroll indicator */}
          <div className="flex md:hidden justify-center items-center gap-3 mt-6 px-6">
            <div className="flex gap-1.5">
              {insuranceTypes.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === activeIndex 
                      ? 'w-6 bg-secondary' 
                      : 'w-1.5 bg-slate-300'
                  }`}
                  animate={{
                    scale: index === activeIndex ? 1 : 0.8,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-2">
              Deslize para ver mais
            </span>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};
