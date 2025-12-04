import { Shield, Clock, Award, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "./AnimatedSection";

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
  return (
    <section className="relative bg-background py-20 sm:py-24 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-secondary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Por que escolher a{" "}
            <span className="text-secondary">Corretora JJ</span>?
          </h2>
          <p className="text-lg text-muted-foreground">
            Mais de uma década de experiência protegendo famílias e empresas
          </p>
        </motion.div>

        <StaggerContainer 
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          staggerDelay={0.1}
        >
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ 
                  y: -6,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="group relative rounded-2xl glass-card p-8 transition-all duration-300 hover:shadow-premium overflow-hidden"
              >
                {/* Gradient accent on top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Icon with gradient background */}
                <div className="mb-5 relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 group-hover:bg-secondary/15 transition-colors duration-300">
                    <feature.icon size={26} className="text-secondary" />
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover border glow */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-border group-hover:ring-secondary/30 transition-all duration-300" />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 text-center"
        >
          <p className="text-muted-foreground mb-2">
            Junte-se a milhares de clientes satisfeitos
          </p>
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-2xl">⭐</span>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">(4.9/5 baseado em 500+ avaliações)</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
