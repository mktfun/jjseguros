import { Shield, Clock, Award, Headphones } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { StatsCounter } from "./StatsCounter";
import { SocialProof } from "./SocialProof";

const features = [
  {
    icon: Shield,
    title: "Segurança Garantida",
    description: "Seus dados protegidos com criptografia de ponta a ponta",
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-500/10 to-blue-600/5",
  },
  {
    icon: Clock,
    title: "Resposta Rápida",
    description: "Cotações em até 24 horas úteis",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/10 to-orange-500/5",
  },
  {
    icon: Award,
    title: "Parceiros Premium",
    description: "Trabalhamos com as melhores seguradoras do mercado",
    gradient: "from-purple-500 to-violet-600",
    bgGradient: "from-purple-500/10 to-violet-600/5",
  },
  {
    icon: Headphones,
    title: "Suporte Dedicado",
    description: "Atendimento humanizado do início ao fim",
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-500/10 to-teal-600/5",
  },
];

export const TrustSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if desktop on mount and resize
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Only apply parallax transforms on desktop
  const sectionY = useTransform(scrollYProgress, [0, 0.3], isDesktop ? [60, 0] : [0, 0]);
  const sectionOpacity = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    isDesktop ? [0.3, 1, 1, 0.8] : [1, 1, 1, 1]
  );

  return (
    <motion.section 
      ref={sectionRef}
      style={{ opacity: sectionOpacity }}
      className="relative mesh-gradient-section py-20 sm:py-28 overflow-hidden"
    >
      {/* Light edge effect at top - visual separator */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none z-[1]" />
      
      {/* Noise overlay for texture */}
      <div className="noise-overlay absolute inset-0 pointer-events-none" />

      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
        
        {/* Large gradient blob - left */}
        <div 
          className="absolute -left-40 top-20 w-[500px] h-[500px] bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-3xl opacity-50"
        />
        
        {/* Large gradient blob - right */}
        <div 
          className="absolute -right-40 bottom-20 w-[600px] h-[600px] bg-gradient-to-bl from-blue-500/8 to-transparent rounded-full blur-3xl opacity-40"
        />

        {/* Floating geometric shapes - desktop only */}
        <div className="hidden lg:block absolute top-40 right-[20%] w-20 h-20 border border-secondary/20 rounded-2xl" />
        <div className="hidden lg:block absolute bottom-40 left-[15%] w-16 h-16 bg-gradient-to-br from-secondary/10 to-transparent rounded-full" />
      </div>

      <motion.div 
        style={{ y: sectionY }}
        className="container relative z-10"
      >
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <motion.span
            className="inline-block mb-4 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
          >
            Por que nos escolher
          </motion.span>
          
          <motion.h2 
            className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
          >
            A{" "}
            <span className="text-secondary">JJ & Amorim</span>
            {" "}em números
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
          >
            Mais de uma década de experiência protegendo famílias e empresas
          </motion.p>
        </motion.div>

        {/* Stats Counter Section */}
        <StatsCounter />

        {/* Feature Cards */}
        <div 
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          style={{ perspective: "1000px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.08,
                ease: "easeOut"
              }}
              className="group relative rounded-2xl bg-card border border-border border-t-secondary/20 p-6 sm:p-8 overflow-hidden cursor-default hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {/* Background gradient that fills on hover */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {/* Gradient accent on top */}
              <div 
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${feature.gradient}`}
              />
              
              {/* Icon with gradient background */}
              <div className="mb-5 sm:mb-6 relative">
                <div 
                  className={`absolute -inset-4 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                />
                <div 
                  className={`relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                >
                  <feature.icon size={26} className="text-white" />
                </div>
              </div>

              <h3 className="relative mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="relative text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Subtle border glow on hover */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-border group-hover:ring-secondary/30 transition-all duration-300" />
            </motion.div>
          ))}
        </div>

        {/* Social Proof Section */}
        <SocialProof />
      </motion.div>
    </motion.section>
  );
};