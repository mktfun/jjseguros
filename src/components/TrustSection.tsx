import { Shield, Clock, Award, Headphones } from "lucide-react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useRef } from "react";
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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const sectionY = useTransform(scrollYProgress, [0, 0.3], [80, 0]);
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.6]);
  const decorativeY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const decorativeRotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

  // Card animation variants with 3D rotation
  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      rotateX: -15,
      scale: 0.9,
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
        delay: index * 0.15,
      },
    }),
  };

  return (
    <motion.section 
      ref={sectionRef}
      style={{ opacity: sectionOpacity }}
      className="relative bg-background py-20 sm:py-28 overflow-hidden"
    >
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
        <motion.div 
          style={{ y: decorativeY }}
          className="absolute -left-40 top-20 w-[500px] h-[500px] bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Large gradient blob - right */}
        <motion.div 
          style={{ y: decorativeY, rotate: decorativeRotate }}
          className="absolute -right-40 bottom-20 w-[600px] h-[600px] bg-gradient-to-bl from-blue-500/8 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-40 right-[20%] w-20 h-20 border border-secondary/20 rounded-2xl"
          style={{ rotate: decorativeRotate }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 left-[15%] w-16 h-16 bg-gradient-to-br from-secondary/10 to-transparent rounded-full"
          animate={{ y: [0, 15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <motion.div 
        style={{ y: sectionY }}
        className="container relative z-10"
      >
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: 0.6,
            type: "spring",
            stiffness: 80,
          }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <motion.span
            className="inline-block mb-4 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Por que nos escolher
          </motion.span>
          
          <motion.h2 
            className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            A{" "}
            <motion.span 
              className="text-secondary inline-block"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            >
              Corretora JJ
            </motion.span>
            {" "}em números
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
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
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ 
                y: -12,
                rotateX: 5,
                rotateY: -5,
                scale: 1.03,
                transition: { 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }
              }}
              className="group relative rounded-2xl bg-white border border-border p-8 overflow-hidden cursor-default"
              style={{
                transformStyle: "preserve-3d",
                boxShadow: "0 4px 20px -4px rgba(0,0,0,0.08)",
              }}
            >
              {/* Background gradient that fills on hover */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient}`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />

              {/* Gradient accent on top */}
              <motion.div 
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${feature.gradient}`}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                style={{ transformOrigin: "left" }}
              />
              
              {/* Icon with gradient background */}
              <div className="mb-6 relative">
                <motion.div 
                  className={`absolute -inset-4 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                />
                <motion.div 
                  className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Breathing icon */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: index * 0.3,
                    }}
                  >
                    <feature.icon size={28} className="text-white" />
                  </motion.div>
                </motion.div>
              </div>

              <h3 className="relative mb-3 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="relative text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow effect */}
              <motion.div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: `0 0 40px -10px hsl(var(--secondary) / 0.3)`,
                }}
              />

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
