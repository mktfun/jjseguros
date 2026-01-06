import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Car, Home, Heart, Building2, Plane, HeartPulse, Shield, Smartphone, RefreshCw, PlusCircle, FileEdit } from "lucide-react";
import { AutoWizard, ResidentialWizard, LifeWizard, BusinessWizard, TravelWizard, HealthWizard, EndorsementWizard } from "@/components/wizards";
import { FormCard } from "@/components/ui/form-card";

type InsuranceType = "auto" | "residencial" | "vida" | "empresarial" | "viagem" | "saude" | "uber";
type DealType = "renovacao" | "novo" | "endosso" | null;

const insuranceConfig: Record<InsuranceType, {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  component: React.ComponentType<{ dealType?: DealType; isUber?: boolean }>;
  requiresDealType: boolean;
}> = {
  auto: {
    title: "Seguro Auto",
    icon: Car,
    iconColor: "text-blue-600",
    component: AutoWizard,
    requiresDealType: true
  },
  uber: {
    title: "Seguro Uber/Similares",
    icon: Smartphone,
    iconColor: "text-violet-600",
    component: AutoWizard,
    requiresDealType: true
  },
  residencial: {
    title: "Seguro Residencial",
    icon: Home,
    iconColor: "text-amber-600",
    component: ResidentialWizard,
    requiresDealType: false
  },
  vida: {
    title: "Seguro de Vida",
    icon: Heart,
    iconColor: "text-rose-600",
    component: LifeWizard,
    requiresDealType: false
  },
  empresarial: {
    title: "Seguro Empresarial",
    icon: Building2,
    iconColor: "text-slate-600",
    component: BusinessWizard,
    requiresDealType: false
  },
  viagem: {
    title: "Seguro Viagem",
    icon: Plane,
    iconColor: "text-sky-600",
    component: TravelWizard,
    requiresDealType: false
  },
  saude: {
    title: "Plano de Saúde",
    icon: HeartPulse,
    iconColor: "text-emerald-600",
    component: HealthWizard,
    requiresDealType: false
  }
};

const validTypes: InsuranceType[] = ["auto", "uber", "residencial", "vida", "empresarial", "viagem", "saude"];

// Componente de seleção de Deal Type
interface DealTypeSelectorProps {
  onSelect: (type: DealType) => void;
  insuranceType: InsuranceType;
}

const DealTypeSelector: React.FC<DealTypeSelectorProps> = ({ onSelect, insuranceType }) => {
  const config = insuranceConfig[insuranceType];
  const Icon = config.icon;

  return (
    <FormCard 
      title="Qual o tipo de solicitação?" 
      description="Selecione uma opção para continuar"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 mb-6 pb-4 border-b border-border">
          <Icon className={config.iconColor} size={28} />
          <span className="font-semibold text-foreground">{config.title}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Renovação JJ Seguros */}
          <button
            type="button"
            onClick={() => onSelect("renovacao")}
            className="group relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 gap-3 h-40 border-muted bg-background text-muted-foreground hover:bg-primary/5 hover:border-primary hover:text-primary"
          >
            <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <RefreshCw size={28} className="text-primary" />
            </div>
            <div className="text-center">
              <span className="font-bold text-base block mb-1">Renovação JJ Seguros</span>
              <span className="text-xs text-muted-foreground">Já sou cliente da corretora</span>
            </div>
          </button>

          {/* Seguro Novo */}
          <button
            type="button"
            onClick={() => onSelect("novo")}
            className="group relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 gap-3 h-40 border-muted bg-background text-muted-foreground hover:bg-secondary/5 hover:border-secondary hover:text-secondary"
          >
            <div className="p-3 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <PlusCircle size={28} className="text-secondary" />
            </div>
            <div className="text-center">
              <span className="font-bold text-base block mb-1">Seguro Novo</span>
              <span className="text-xs text-muted-foreground">Primeira vez ou outra corretora</span>
            </div>
          </button>

          {/* Solicitação de Endosso */}
          <button
            type="button"
            onClick={() => onSelect("endosso")}
            className="group relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 gap-3 h-40 border-muted bg-background text-muted-foreground hover:bg-amber-500/5 hover:border-amber-500 hover:text-amber-600"
          >
            <div className="p-3 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
              <FileEdit size={28} className="text-amber-500" />
            </div>
            <div className="text-center">
              <span className="font-bold text-base block mb-1">Solicitação de Endosso</span>
              <span className="text-xs text-muted-foreground">Alterações na apólice vigente</span>
            </div>
          </button>
        </div>
      </div>
    </FormCard>
  );
};

const Cotacao = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeParam = searchParams.get("type") as InsuranceType | null;
  const dealParam = searchParams.get("deal") as DealType | null;
  const insuranceType: InsuranceType = typeParam && validTypes.includes(typeParam) ? typeParam : "auto";
  
  const config = insuranceConfig[insuranceType];
  
  // Inicializa dealType baseado no parâmetro da URL (se válido)
  const [dealType, setDealType] = useState<DealType>(() => {
    if (config.requiresDealType && dealParam && ['renovacao', 'novo', 'endosso'].includes(dealParam)) {
      return dealParam as DealType;
    }
    return null;
  });
  
  const Icon = config.icon;
  const WizardComponent = config.component;
  
  // Determina se precisa mostrar o seletor de deal type
  const showDealTypeSelector = config.requiresDealType && dealType === null;

  // Gerar título dinâmico baseado no dealType
  const getPageTitle = () => {
    if (dealType === 'renovacao') {
      return `QAR - Renovação ${config.title}`;
    } else if (dealType === 'novo') {
      return `QAR - ${config.title} Novo`;
    } else if (dealType === 'endosso') {
      return `Endosso - ${config.title}`;
    }
    return `Cotação de ${config.title}`;
  };

  // Redirect to hub if no type specified
  useEffect(() => {
    if (!typeParam) {
      navigate("/seguros", { replace: true });
    }
  }, [typeParam, navigate]);

  // Reset dealType when insurance type changes (only if no deal param in URL)
  useEffect(() => {
    const dealFromUrl = searchParams.get("deal") as DealType | null;
    if (config.requiresDealType && dealFromUrl && ['renovacao', 'novo', 'endosso'].includes(dealFromUrl)) {
      setDealType(dealFromUrl as DealType);
    } else if (!dealFromUrl) {
      setDealType(null);
    }
  }, [insuranceType, searchParams, config.requiresDealType]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-28 sm:pt-32 pb-12 bg-gradient-to-b from-slate-100 via-slate-50 to-white">
        <div className="container">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary mb-4">
              <Shield size={16} />
              <span>Cotação Rápida e Segura</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 flex items-center justify-center gap-3">
              <Icon className={`${config.iconColor}`} size={36} />
              {getPageTitle()}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {showDealTypeSelector 
                ? "Primeiro, nos conte: é uma renovação ou seguro novo?"
                : "Preencha o formulário abaixo e receba as melhores ofertas de seguro para você."
              }
            </p>
          </div>

          {/* Deal Type Selector OR Wizard */}
          <div className="w-full max-w-2xl mx-auto">
            {showDealTypeSelector ? (
              <DealTypeSelector 
                onSelect={setDealType} 
                insuranceType={insuranceType}
              />
            ) : dealType === "endosso" ? (
              <EndorsementWizard isUber={insuranceType === "uber"} />
            ) : (
              <WizardComponent 
                dealType={dealType} 
                isUber={insuranceType === "uber"}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cotacao;
