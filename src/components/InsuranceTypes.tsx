import { Car, Home, Heart, Building2, Plane, Users } from "lucide-react";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "./AnimatedSection";

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
  return (
    <section className="relative mesh-gradient-section noise-overlay py-20 sm:py-24">
      {/* Subtle floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-[20%] w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-[10%] w-60 h-60 bg-primary/3 rounded-full blur-3xl" />
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
            Nossos Seguros
          </h2>
          <p className="text-lg text-muted-foreground">
            Soluções completas para todas as suas necessidades de proteção
          </p>
        </motion.div>

        <StaggerContainer 
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6"
          staggerDelay={0.08}
        >
          {insuranceTypes.map((insurance, index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="group relative flex flex-col items-center rounded-xl glass-card p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-premium hover:border-secondary/30"
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
                  <h3 className="mb-1 text-base font-semibold text-foreground">
                    {insurance.title}
                  </h3>
                  <p className="text-center text-xs text-muted-foreground">
                    {insurance.description}
                  </p>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-secondary/0 group-hover:ring-secondary/20 transition-all duration-300" />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
