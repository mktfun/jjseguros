import { Shield, Clock, Award, Headphones } from "lucide-react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useRef } from "react";
import { AnimatedCounter } from "./AnimatedCounter";

const features = [
  {
    icon: Shield,
    title: "Segurança Garantida",
    description: "Seus dados protegidos com criptografia de ponta a ponta",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Clock,
    title: "Resposta Rápida",
    description: "Cotações em até 24 horas úteis",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Award,
    title: "Parceiros Premium",
    description: "Trabalhamos com as melhores seguradoras do mercado",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    icon: Headphones,
    title: "Suporte Dedicado",
    description: "Atendimento humanizado do início ao fim",
    gradient: "from-emerald-500 to-teal-600",
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
      className="relative bg-background py-20 sm:py-24 overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-secondary/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div 
        style={{ y: sectionY }}
        className="container relative z-10"
      >
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
          <motion.h2 
            className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Por que escolher a{" "}
            <motion.span 
              className="text-secondary inline-block"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            >
              Corretora JJ
            </motion.span>
            ?
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
                y: -8,
                rotateX: 5,
                rotateY: -5,
                scale: 1.02,
                transition: { 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }
              }}
              className="group relative rounded-2xl glass-card p-8 overflow-hidden cursor-default"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {/* Gradient accent on top */}
              <motion.div 
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                style={{ transformOrigin: "left" }}
              />
              
              {/* Icon with gradient background */}
              <div className="mb-5 relative">
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-xl blur-xl`}
                  initial={{ opacity: 0.2 }}
                  whileHover={{ opacity: 0.4 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div 
                  className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10"
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: "rgba(99,102,241,0.15)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Breathing icon */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.15, 1],
                    }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: index * 0.3,
                    }}
                  >
                    <feature.icon size={26} className="text-secondary" />
                  </motion.div>
                </motion.div>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover border glow */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-border group-hover:ring-secondary/30 transition-all duration-300 group-hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)]" />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA with animated counter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 text-center"
        >
          <p className="text-muted-foreground mb-2">
            Junte-se a milhares de clientes satisfeitos
          </p>
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.span 
                key={i} 
                className="text-2xl"
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: 0.6 + i * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
              >
                ⭐
              </motion.span>
            ))}
            <motion.span 
              className="ml-2 text-sm text-muted-foreground"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.1 }}
            >
              (4.9/5 baseado em <AnimatedCounter value={500} suffix="+" /> avaliações)
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};
