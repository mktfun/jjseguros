import { Car, Home, Heart, Building2, Plane, Users, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
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
  const sectionRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
      className="relative noise-overlay py-20 sm:py-24"
    >
      {/* Subtle floating shapes with parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 right-[20%] w-40 h-40 bg-secondary/5 rounded-full blur-3xl"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-10 left-[10%] w-60 h-60 bg-primary/3 rounded-full blur-3xl"
          animate={{ 
            y: [0, 15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
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
          className="container mx-auto mb-10 max-w-2xl text-center"
        >
          <motion.h2 
            className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Nossos Seguros
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Soluções completas para todas as suas necessidades de proteção
          </motion.p>
        </motion.div>

        {/* Carousel container */}
        <div className="relative overflow-visible">
          {/* Navigation arrows - Desktop only */}
          <div className="hidden md:block">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all duration-300 ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                <ChevronLeft size={24} className="text-foreground" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all duration-300 ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                <ChevronRight size={24} className="text-foreground" />
              </Button>
            </motion.div>
          </div>

          {/* Gradient masks for scroll indication */}
          <div className={`absolute left-0 top-6 bottom-6 w-12 sm:w-20 bg-gradient-to-r from-[#F1F5F9] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute right-0 top-6 bottom-6 w-12 sm:w-20 bg-gradient-to-l from-[#F1F5F9] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory px-6 sm:px-12 lg:px-20 py-6 scrollbar-hide"
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
                  y: -8,
                  scale: 1.02,
                  transition: { 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20 
                  }
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex-shrink-0 snap-center flex flex-col items-center rounded-xl bg-white border border-slate-200 shadow-sm p-6 cursor-pointer overflow-hidden min-w-[180px] sm:min-w-[200px]"
                style={{
                  boxShadow: "0 4px 20px -4px rgba(0,0,0,0.08)",
                }}
              >
                {/* Gradient background on hover */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${insurance.color}`}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  initial={{ boxShadow: "0 0 0 0 rgba(99,102,241,0)" }}
                  whileHover={{ 
                    boxShadow: "0 0 30px -5px rgba(99,102,241,0.3)",
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="relative z-10 w-full">
                  <motion.div 
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 mx-auto"
                    whileHover={{ 
                      scale: 1.1,
                      backgroundColor: "rgba(99,102,241,0.2)",
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
                        size={28} 
                        className="text-secondary" 
                      />
                    </motion.div>
                  </motion.div>
                  <h3 className="mb-1 text-base font-semibold text-foreground text-center">
                    {insurance.title}
                  </h3>
                  <p className="text-center text-xs text-muted-foreground mb-3">
                    {insurance.description}
                  </p>
                  
                  {/* Action indicator */}
                  <motion.div 
                    className="flex items-center justify-center gap-1 text-xs text-muted-foreground/60"
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ 
                      opacity: 1, 
                      x: 0,
                      color: "hsl(var(--secondary))",
                    }}
                  >
                    <span>Cotar</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight size={12} />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Border glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-transparent"
                  whileHover={{ 
                    borderColor: "rgba(99,102,241,0.3)",
                  }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};
