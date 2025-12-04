import { useRef, useState, MouseEvent } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Car, 
  Home, 
  Heart, 
  Building2, 
  Plane, 
  HeartPulse,
  ChevronRight,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface InsuranceProduct {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
  type: string;
  colSpan?: number;
  rowSpan?: number;
}

const insuranceProducts: InsuranceProduct[] = [
  {
    icon: Car,
    title: "Seguro Auto",
    description: "Proteção completa para seu veículo contra roubo, colisão e danos a terceiros.",
    gradient: "from-blue-500/20 via-blue-400/10 to-sky-300/5",
    iconColor: "text-blue-600",
    type: "auto",
    colSpan: 2,
    rowSpan: 1,
  },
  {
    icon: Heart,
    title: "Seguro de Vida",
    description: "Segurança financeira para quem você ama. Coberturas para morte, invalidez e doenças graves.",
    gradient: "from-rose-500/20 via-rose-400/10 to-pink-300/5",
    iconColor: "text-rose-600",
    type: "vida",
    colSpan: 1,
    rowSpan: 2,
  },
  {
    icon: Home,
    title: "Residencial",
    description: "Proteja seu lar contra incêndio, roubo e danos elétricos.",
    gradient: "from-amber-500/20 via-amber-400/10 to-orange-300/5",
    iconColor: "text-amber-600",
    type: "residencial",
  },
  {
    icon: Building2,
    title: "Empresarial",
    description: "Soluções completas para proteger seu negócio e patrimônio.",
    gradient: "from-slate-500/20 via-slate-400/10 to-gray-300/5",
    iconColor: "text-slate-600",
    type: "empresarial",
  },
  {
    icon: HeartPulse,
    title: "Saúde",
    description: "Planos de saúde com a melhor cobertura para você e sua família.",
    gradient: "from-emerald-500/20 via-emerald-400/10 to-green-300/5",
    iconColor: "text-emerald-600",
    type: "saude",
  },
  {
    icon: Plane,
    title: "Viagem",
    description: "Viaje tranquilo com cobertura médica e proteção de bagagem.",
    gradient: "from-violet-500/20 via-violet-400/10 to-purple-300/5",
    iconColor: "text-violet-600",
    type: "viagem",
  },
];

interface InsuranceTileProps extends InsuranceProduct {
  index: number;
}

const InsuranceTile = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  iconColor, 
  type,
  colSpan = 1,
  rowSpan = 1,
  index
}: InsuranceTileProps) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const newRotateX = ((y - centerY) / centerY) * -6;
    const newRotateY = ((x - centerX) / centerX) * 6;
    
    setRotateX(newRotateX);
    setRotateY(newRotateY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const handleClick = () => {
    navigate(`/cotacao?type=${type}`);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "relative overflow-hidden cursor-pointer group",
        "bg-white rounded-3xl border border-slate-200/60",
        "shadow-lg transition-shadow duration-300",
        colSpan === 2 && "md:col-span-2",
        rowSpan === 2 && "md:row-span-2"
      )}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.15s ease-out',
        minHeight: rowSpan === 2 ? '420px' : '220px',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Gradient background overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
          gradient,
          isHovered && "opacity-100"
        )}
      />

      {/* Border glow on hover */}
      <div 
        className={cn(
          "absolute inset-0 rounded-3xl ring-2 ring-transparent transition-all duration-300",
          isHovered && "ring-secondary/20"
        )}
      />

      {/* Large decorative icon */}
      <Icon 
        className={cn(
          "absolute -right-6 -bottom-6 w-36 h-36 transition-all duration-500",
          iconColor,
          "opacity-[0.06]",
          isHovered && "opacity-[0.12] scale-110"
        )}
        strokeWidth={1}
      />

      {/* Content */}
      <div className="relative z-10 h-full p-7 sm:p-8 flex flex-col justify-between">
        <div>
          {/* Icon badge */}
          <div 
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-5",
              "bg-gradient-to-br shadow-sm transition-transform duration-300",
              gradient.replace('/20', '/30').replace('/10', '/20').replace('/5', '/10'),
              isHovered && "scale-105"
            )}
          >
            <Icon className={cn("w-6 h-6", iconColor)} strokeWidth={2} />
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {description}
          </p>
        </div>

        {/* CTA Button */}
        <div 
          className={cn(
            "flex items-center gap-2 text-secondary font-semibold mt-6",
            "transition-all duration-300",
            "opacity-70 translate-y-1",
            isHovered && "opacity-100 translate-y-0"
          )}
        >
          <span>Cotar agora</span>
          <ChevronRight 
            className={cn(
              "w-5 h-5 transition-transform duration-300",
              isHovered && "translate-x-1"
            )} 
          />
        </div>
      </div>

      {/* Subtle hover shadow increase */}
      <div 
        className={cn(
          "absolute inset-0 rounded-3xl transition-shadow duration-300 pointer-events-none",
          isHovered && "shadow-2xl"
        )}
      />
    </motion.div>
  );
};

const InsuranceHub = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Header />
      
      <main className="flex-1 pt-28 sm:pt-32 pb-16 sm:pb-24">
        {/* Hero Section */}
        <div className="container text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary mb-5"
          >
            <Shield size={16} />
            <span>Encontre o seguro ideal</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            Qual proteção você busca hoje?
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto"
          >
            Selecione uma categoria para iniciar sua cotação personalizada
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {insuranceProducts.map((product, index) => (
              <InsuranceTile 
                key={product.type} 
                {...product} 
                index={index}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InsuranceHub;
