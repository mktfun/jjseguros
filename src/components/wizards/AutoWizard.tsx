import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Stepper, type Step } from "@/components/ui/stepper";
import { FormCard } from "@/components/ui/form-card";
import { FormInput } from "@/components/ui/form-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight, 
  Loader2,
  Home,
  Building2,
  Warehouse,
  Zap,
  KeyRound,
  ParkingCircle,
  Car,
  Briefcase,
  GraduationCap,
  Users,
  PlusCircle,
  RefreshCw,
  Smartphone,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { sendToRDStation, buildAutoPayload } from "@/utils/dataProcessor";
import { Label } from "@/components/ui/label";

const steps: Step[] = [
  { id: "personal", title: "Dados Condutor", description: "Quem vai dirigir?" },
  { id: "vehicle", title: "Veículo", description: "Dados do carro" },
  { id: "address", title: "Endereço", description: "Residência & Garagem" },
  { id: "risk", title: "Perfil de Risco", description: "Rotina de uso" },
];

const formatCPF = (value: string) => value.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})/, "$1-$2").replace(/(-\d{2})\d+?$/, "$1");
const formatCNPJ = (value: string) => value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})/, "$1-$2").replace(/(-\d{2})\d+?$/, "$1");
const formatPhone = (value: string) => value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{4})\d+?$/, "$1");
const formatCEP = (value: string) => value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{3})\d+?$/, "$1");
const formatPlate = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^([A-Z]{3})([0-9A-Z])/, "$1-$2").slice(0, 8);

// Componente OptionCard interno para seleção visual
interface OptionCardProps {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ icon, label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 gap-2 h-24 ${
      selected
        ? "border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]"
        : "border-muted bg-background text-muted-foreground hover:bg-muted/50 hover:border-muted-foreground/30"
    }`}
  >
    <span className={selected ? "text-primary" : "text-muted-foreground"}>{icon}</span>
    <span className="font-bold text-sm text-center leading-tight">{label}</span>
  </button>
);

// NOVO: Componente YesNoToggle com visual refinado
interface YesNoToggleProps {
  label: string;
  value: "sim" | "nao";
  onChange: (value: "sim" | "nao") => void;
}

const YesNoToggle: React.FC<YesNoToggleProps> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{label}</Label>
    <div className="grid grid-cols-2 gap-3 w-full">
      <button
        type="button"
        onClick={() => onChange("sim")}
        className={`h-12 flex items-center justify-center rounded-lg border text-sm font-medium transition-all duration-200 ${
          value === "sim"
            ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
            : "bg-background text-muted-foreground border-input hover:bg-muted/50"
        }`}
      >
        Sim
      </button>
      <button
        type="button"
        onClick={() => onChange("nao")}
        className={`h-12 flex items-center justify-center rounded-lg border text-sm font-medium transition-all duration-200 ${
          value === "nao"
            ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
            : "bg-background text-muted-foreground border-input hover:bg-muted/50"
        }`}
      >
        Não
      </button>
    </div>
  </div>
);

// ============================================
// NOVO: FOCUS QUESTION - Acordeão Dinâmico
// ============================================
interface FocusQuestionProps {
  isActive: boolean;
  isCompleted: boolean;
  label: string;
  valueLabel?: string;
  children: React.ReactNode;
  stepNumber: number;
}

const FocusQuestion: React.FC<FocusQuestionProps> = ({ 
  isActive, 
  isCompleted, 
  label, 
  valueLabel, 
  children,
  stepNumber 
}) => {
  const getStyles = () => {
    if (isActive) {
      return "border-2 border-emerald-500 bg-white shadow-lg shadow-emerald-100 ring-1 ring-emerald-500 scale-100 opacity-100 z-10";
    }
    if (isCompleted) {
      return "border border-rose-200 bg-rose-50/50 opacity-80 scale-[0.98]";
    }
    return "border border-muted opacity-40 scale-[0.95] pointer-events-none";
  };

  return (
    <motion.div
      layout
      className={`rounded-xl p-4 transition-all duration-300 ${getStyles()}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
            isActive 
              ? "bg-emerald-500 text-white" 
              : isCompleted 
                ? "bg-rose-200 text-rose-700" 
                : "bg-muted text-muted-foreground"
          }`}>
            {isCompleted ? <Check size={14} /> : stepNumber}
          </span>
          <span className={`font-semibold ${isActive ? "text-emerald-700" : isCompleted ? "text-rose-700" : "text-muted-foreground"}`}>
            {label}
          </span>
        </div>
        {isCompleted && valueLabel && (
          <span className="text-sm font-medium text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
            {valueLabel}
          </span>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// NOVO: TELA DE SELEÇÃO INICIAL
// ============================================
interface QuoteTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  variant: 'new' | 'renewal';
}

const QuoteTypeCard: React.FC<QuoteTypeCardProps> = ({ icon, title, description, onClick, variant }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    className={`flex flex-col items-center justify-center p-8 border-2 rounded-2xl cursor-pointer transition-all duration-300 gap-4 min-h-[200px] shadow-lg hover:shadow-xl ${
      variant === 'new'
        ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:border-emerald-500 hover:shadow-emerald-200"
        : "border-primary bg-gradient-to-br from-primary/5 to-primary/15 hover:border-primary hover:shadow-primary/20"
    }`}
  >
    <span className={`p-4 rounded-full ${
      variant === 'new' ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
    }`}>
      {icon}
    </span>
    <div className="text-center">
      <h3 className={`font-bold text-xl ${variant === 'new' ? "text-emerald-700" : "text-primary"}`}>
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  </motion.button>
);

export const AutoWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // NOVO: Estado de tipo de cotação (null = tela de seleção)
  const [quoteType, setQuoteType] = React.useState<'new' | 'renewal' | null>(null);

  // Form state - Step 1
  const [personType, setPersonType] = React.useState("pf");
  const [cpfCnpj, setCpfCnpj] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [maritalStatus, setMaritalStatus] = React.useState("");
  const [profession, setProfession] = React.useState("");

  // Form state - Step 2 (Veículo + CEP)
  const [plate, setPlate] = React.useState("");
  const [model, setModel] = React.useState("");
  const [yearModel, setYearModel] = React.useState("");
  const [isZeroKm, setIsZeroKm] = React.useState<"sim" | "nao">("nao");
  const [isFinanced, setIsFinanced] = React.useState<"sim" | "nao">("nao");
  const [vehicleUseType, setVehicleUseType] = React.useState<"pessoal" | "comercial">("pessoal");
  const [cep, setCep] = React.useState("");

  // NOVO: Estado de campo ativo para Focus Mode (Step 2)
  const [activeVehicleField, setActiveVehicleField] = React.useState<
    'model' | 'year' | 'zeroKm' | 'plate' | 'financed' | 'usage' | 'cep'
  >('model');

  // Form state - Step 3 (Endereço + Residência)
  const [street, setStreet] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [neighborhood, setNeighborhood] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [residenceType, setResidenceType] = React.useState("casa");
  const [garageType, setGarageType] = React.useState("automatico");

  // Form state - Step 4 (Perfil de Risco)
  const [usesForWork, setUsesForWork] = React.useState<"sim" | "nao">("nao");
  const [workParking, setWorkParking] = React.useState("fechada");
  const [usesForSchool, setUsesForSchool] = React.useState<"sim" | "nao">("nao");
  const [schoolParking, setSchoolParking] = React.useState("fechada");
  
  // Condutor Jovem - Lógica Condicional
  const [livesWithYoungPerson, setLivesWithYoungPerson] = React.useState<"sim" | "nao">("nao");
  const [youngPersonDrives, setYoungPersonDrives] = React.useState<"sim" | "nao">("nao");
  const [youngDriverAge, setYoungDriverAge] = React.useState("");
  const [youngDriverGender, setYoungDriverGender] = React.useState("");

  // Validation state
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isLoadingCep, setIsLoadingCep] = React.useState(false);

  // Busca automática de CEP via BrasilAPI
  const fetchAddressByCep = React.useCallback(async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
      const data = await response.json();

      if (data.errors || !response.ok) {
        toast.error("CEP não encontrado. Preencha o endereço manualmente.");
        return;
      }

      // Auto-preenche os campos de endereço
      setStreet(data.street || "");
      setNeighborhood(data.neighborhood || "");
      setCity(data.city || "");
      setState(data.state || "");
      
      toast.success("Endereço encontrado!");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Preencha manualmente.");
    } finally {
      setIsLoadingCep(false);
    }
  }, []);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "cpfCnpj":
        if (personType === "pf" && value.replace(/\D/g, "").length !== 11) newErrors.cpfCnpj = "CPF incompleto";
        else if (personType === "pj" && value.replace(/\D/g, "").length !== 14) newErrors.cpfCnpj = "CNPJ incompleto";
        else delete newErrors.cpfCnpj;
        break;
      case "name":
        if (value.trim().length < 3) newErrors.name = "Nome inválido";
        else delete newErrors.name;
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = "E-mail inválido";
        else delete newErrors.email;
        break;
      case "phone":
        if (value.replace(/\D/g, "").length < 11) newErrors.phone = "Telefone incompleto";
        else delete newErrors.phone;
        break;
      case "plate":
        if (isZeroKm === "nao" && value.replace(/[^A-Z0-9]/g, "").length < 7) {
          newErrors.plate = "Placa inválida";
        } else {
          delete newErrors.plate;
        }
        break;
      case "model":
        if (value.trim().length < 2) newErrors.model = "Modelo obrigatório";
        else delete newErrors.model;
        break;
      case "yearModel":
        if (value.trim().length < 4) newErrors.yearModel = "Ano obrigatório";
        else delete newErrors.yearModel;
        break;
      case "cep":
        if (value.replace(/\D/g, "").length !== 8) newErrors.cep = "CEP incompleto";
        else delete newErrors.cep;
        break;
    }

    setErrors(newErrors);
    return !newErrors[field];
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  // Helpers para Focus Mode
  const isFieldCompleted = (field: typeof activeVehicleField): boolean => {
    switch (field) {
      case 'model': return model.trim().length >= 2;
      case 'year': return yearModel.trim().length >= 4;
      case 'zeroKm': return true; // Always has a value
      case 'plate': return isZeroKm === "sim" || plate.replace(/[^A-Z0-9]/g, "").length >= 7;
      case 'financed': return true; // Always has a value
      case 'usage': return true; // Always has a value
      case 'cep': return cep.replace(/\D/g, "").length === 8;
      default: return false;
    }
  };

  const getFieldValueLabel = (field: typeof activeVehicleField): string => {
    switch (field) {
      case 'model': return model || '';
      case 'year': return yearModel || '';
      case 'zeroKm': return isZeroKm === 'sim' ? 'Sim' : 'Não';
      case 'plate': return isZeroKm === "sim" ? 'Zero KM' : plate || '';
      case 'financed': return isFinanced === 'sim' ? 'Sim' : 'Não';
      case 'usage': return vehicleUseType === 'pessoal' ? 'Pessoal' : 'Comercial/App';
      case 'cep': return cep || '';
      default: return '';
    }
  };

  const advanceToNextField = () => {
    const order: typeof activeVehicleField[] = ['model', 'year', 'zeroKm', 'plate', 'financed', 'usage', 'cep'];
    const currentIndex = order.indexOf(activeVehicleField);
    
    // Se zeroKm = sim, pula o campo plate
    if (activeVehicleField === 'zeroKm' && isZeroKm === 'sim') {
      setActiveVehicleField('financed');
      return;
    }
    
    if (currentIndex < order.length - 1) {
      setActiveVehicleField(order[currentIndex + 1]);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return (
          cpfCnpj.replace(/\D/g, "").length === (personType === "pf" ? 11 : 14) &&
          name.trim().length >= 3 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
          phone.replace(/\D/g, "").length === 11 &&
          profession.trim().length >= 3 &&
          maritalStatus !== ""
        );
      case 1:
        const plateValid = isZeroKm === "sim" || plate.replace(/[^A-Z0-9]/g, "").length >= 7;
        return (
          plateValid &&
          model.trim().length > 0 &&
          yearModel.trim().length > 0 &&
          cep.replace(/\D/g, "").length === 8
        );
      case 2:
        return (
          street.trim().length > 0 &&
          number.trim().length > 0 &&
          neighborhood.trim().length > 0 &&
          city.trim().length > 0
        );
      case 3:
        // Se mora com jovem E jovem dirige → exigir idade e sexo
        if (livesWithYoungPerson === "sim" && youngPersonDrives === "sim") {
          return youngDriverAge.length > 0 && youngDriverGender !== "";
        }
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1 && isStepValid(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      // Reset focus mode for step 2
      if (currentStep === 0) {
        setActiveVehicleField('model');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = buildAutoPayload({
        quoteType, // NOVO: Passa o tipo de cotação
        fullName: name,
        email,
        phone,
        cpf: personType === "pf" ? cpfCnpj : undefined,
        cnpj: personType === "pj" ? cpfCnpj : undefined,
        personType,
        maritalStatus,
        profession,
        plate: isZeroKm === "sim" ? "ZERO KM" : plate,
        model,
        year: yearModel,
        isZeroKm: isZeroKm === "sim",
        isFinanced: isFinanced === "sim",
        vehicleUseType,
        cep,
        street,
        number,
        neighborhood,
        city,
        state,
        residenceType,
        garageType,
        usesForWork: usesForWork === "sim",
        workParking: usesForWork === "sim" ? workParking : undefined,
        usesForSchool: usesForSchool === "sim",
        schoolParking: usesForSchool === "sim" ? schoolParking : undefined,
        // Novos campos condutor jovem
        livesWithYoungPerson: livesWithYoungPerson === "sim",
        youngPersonDrives: livesWithYoungPerson === "sim" && youngPersonDrives === "sim",
        youngDriverAge: livesWithYoungPerson === "sim" && youngPersonDrives === "sim" ? youngDriverAge : undefined,
        youngDriverGender: livesWithYoungPerson === "sim" && youngPersonDrives === "sim" ? youngDriverGender : undefined,
      });

      const success = await sendToRDStation(payload);
      if (success) navigate("/sucesso");
      else toast.error("Erro ao enviar cotação.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar cotação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // TELA 0: SELEÇÃO DE TIPO DE COTAÇÃO
  // ============================================
  if (quoteType === null) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Qual tipo de cotação deseja?
          </h1>
          <p className="text-muted-foreground">
            Selecione uma opção para iniciar sua cotação de seguro auto
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <QuoteTypeCard
              icon={<PlusCircle size={32} />}
              title="Seguro Novo"
              description="Primeira vez fazendo seguro?"
              onClick={() => setQuoteType('new')}
              variant="new"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <QuoteTypeCard
              icon={<RefreshCw size={32} />}
              title="Renovação JJ & Amorim"
              description="Já é cliente? Renove conosco!"
              onClick={() => setQuoteType('renewal')}
              variant="renewal"
            />
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================
  // WIZARD PRINCIPAL (após seleção de tipo)
  // ============================================
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Badge do tipo selecionado */}
      <div className="flex items-center justify-center mb-4">
        <button
          onClick={() => setQuoteType(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80 ${
            quoteType === 'new' 
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
              : 'bg-primary/10 text-primary border border-primary/30'
          }`}
        >
          {quoteType === 'new' ? <PlusCircle size={16} /> : <RefreshCw size={16} />}
          {quoteType === 'new' ? 'Seguro Novo' : 'Renovação JJ & Amorim'}
          <span className="text-xs opacity-70">(alterar)</span>
        </button>
      </div>

      <Stepper steps={steps} currentStep={currentStep} className="mb-8" />

      <div className="min-h-[400px]">
        {/* STEP 1 - Dados Principal Condutor */}
        {currentStep === 0 && (
          <FormCard title="Dados Principal Condutor" description="Quem vai dirigir?">
            <div className="space-y-5">
              <SegmentedControl
                label="Tipo de Pessoa"
                options={[
                  { value: "pf", label: "Pessoa Física" },
                  { value: "pj", label: "Pessoa Jurídica" },
                ]}
                value={personType}
                onChange={(val) => {
                  setPersonType(val);
                  setCpfCnpj("");
                  setErrors((prev) => ({ ...prev, cpfCnpj: undefined } as Record<string, string>));
                }}
              />
              <FormInput
                label={personType === "pf" ? "CPF" : "CNPJ"}
                placeholder={personType === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(personType === "pf" ? formatCPF(e.target.value) : formatCNPJ(e.target.value))}
                onBlur={() => handleBlur("cpfCnpj", cpfCnpj)}
                error={touched.cpfCnpj ? errors.cpfCnpj : undefined}
                inputMode="numeric"
                required
              />
              <FormInput 
                label={personType === "pf" ? "Nome Completo" : "Razão Social"} 
                placeholder={personType === "pf" ? "Seu nome completo" : "Nome da empresa"}
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                onBlur={() => handleBlur("name", name)}
                error={touched.name ? errors.name : undefined}
                required 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado Civil <span className="text-destructive">*</span></label>
                  <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      <SelectItem value="uniao_estavel">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FormInput 
                  label="Profissão" 
                  placeholder="Ex: Engenheiro"
                  value={profession} 
                  onChange={(e) => setProfession(e.target.value)} 
                  onBlur={() => handleBlur("profession", profession)}
                  error={touched.profession ? errors.profession : undefined}
                  required 
                />
              </div>

              <FormInput 
                label="E-mail" 
                type="email" 
                placeholder="seu@email.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                onBlur={() => handleBlur("email", email)}
                error={touched.email ? errors.email : undefined}
                inputMode="email"
                required 
              />
              <FormInput 
                label="Celular" 
                placeholder="(00) 00000-0000"
                value={phone} 
                onChange={(e) => setPhone(formatPhone(e.target.value))} 
                onBlur={() => handleBlur("phone", phone)}
                error={touched.phone ? errors.phone : undefined}
                inputMode="tel"
                required 
              />
            </div>
          </FormCard>
        )}

        {/* STEP 2 - Veículo (FOCUS MODE) */}
        {currentStep === 1 && (
          <FormCard title="Dados do Veículo" description="Preencha os dados conforme o documento">
            <div className="space-y-4">
              
              {/* 1. MODELO */}
              <FocusQuestion
                isActive={activeVehicleField === 'model'}
                isCompleted={activeVehicleField !== 'model' && isFieldCompleted('model')}
                label="Modelo do Veículo"
                valueLabel={getFieldValueLabel('model')}
                stepNumber={1}
              >
                <div className="flex gap-3">
                  <FormInput
                    label=""
                    placeholder="Ex: Onix Plus 1.0 Turbo"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="default" 
                    onClick={() => {
                      if (model.trim().length >= 2) advanceToNextField();
                    }}
                    disabled={model.trim().length < 2}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    OK
                  </Button>
                </div>
              </FocusQuestion>

              {/* 2. ANO */}
              <FocusQuestion
                isActive={activeVehicleField === 'year'}
                isCompleted={activeVehicleField !== 'year' && activeVehicleField !== 'model' && isFieldCompleted('year')}
                label="Ano/Modelo"
                valueLabel={getFieldValueLabel('year')}
                stepNumber={2}
              >
                <div className="flex gap-3">
                  <FormInput
                    label=""
                    placeholder="Ex: 2024/2025"
                    value={yearModel}
                    onChange={(e) => setYearModel(e.target.value)}
                    inputMode="numeric"
                    className="flex-1"
                  />
                  <Button 
                    variant="default" 
                    onClick={() => {
                      if (yearModel.trim().length >= 4) advanceToNextField();
                    }}
                    disabled={yearModel.trim().length < 4}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    OK
                  </Button>
                </div>
              </FocusQuestion>

              {/* 3. ZERO KM */}
              <FocusQuestion
                isActive={activeVehicleField === 'zeroKm'}
                isCompleted={['plate', 'financed', 'usage', 'cep'].includes(activeVehicleField)}
                label="Veículo Zero KM?"
                valueLabel={getFieldValueLabel('zeroKm')}
                stepNumber={3}
              >
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsZeroKm("sim");
                      setPlate("");
                      setTimeout(() => advanceToNextField(), 150);
                    }}
                    className={`h-14 flex items-center justify-center rounded-lg border-2 text-base font-semibold transition-all ${
                      isZeroKm === "sim"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-muted-foreground border-input hover:border-emerald-300"
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsZeroKm("nao");
                      setTimeout(() => advanceToNextField(), 150);
                    }}
                    className={`h-14 flex items-center justify-center rounded-lg border-2 text-base font-semibold transition-all ${
                      isZeroKm === "nao"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-muted-foreground border-input hover:border-emerald-300"
                    }`}
                  >
                    Não
                  </button>
                </div>
              </FocusQuestion>

              {/* 4. PLACA (pula se zero km) */}
              {isZeroKm === "nao" && (
                <FocusQuestion
                  isActive={activeVehicleField === 'plate'}
                  isCompleted={['financed', 'usage', 'cep'].includes(activeVehicleField)}
                  label="Placa do Veículo"
                  valueLabel={getFieldValueLabel('plate')}
                  stepNumber={4}
                >
                  <div className="flex gap-3">
                    <FormInput
                      label=""
                      placeholder="ABC-1234"
                      value={plate}
                      onChange={(e) => setPlate(formatPlate(e.target.value))}
                      className="flex-1 uppercase font-mono"
                    />
                    <Button 
                      variant="default" 
                      onClick={() => {
                        if (plate.replace(/[^A-Z0-9]/g, "").length >= 7) advanceToNextField();
                      }}
                      disabled={plate.replace(/[^A-Z0-9]/g, "").length < 7}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      OK
                    </Button>
                  </div>
                </FocusQuestion>
              )}

              {/* 5. FINANCIADO */}
              <FocusQuestion
                isActive={activeVehicleField === 'financed'}
                isCompleted={['usage', 'cep'].includes(activeVehicleField)}
                label="Veículo Financiado/Alienado?"
                valueLabel={getFieldValueLabel('financed')}
                stepNumber={isZeroKm === "sim" ? 4 : 5}
              >
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFinanced("sim");
                      setTimeout(() => advanceToNextField(), 150);
                    }}
                    className={`h-14 flex items-center justify-center rounded-lg border-2 text-base font-semibold transition-all ${
                      isFinanced === "sim"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-muted-foreground border-input hover:border-emerald-300"
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFinanced("nao");
                      setTimeout(() => advanceToNextField(), 150);
                    }}
                    className={`h-14 flex items-center justify-center rounded-lg border-2 text-base font-semibold transition-all ${
                      isFinanced === "nao"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-muted-foreground border-input hover:border-emerald-300"
                    }`}
                  >
                    Não
                  </button>
                </div>
              </FocusQuestion>

              {/* 6. USO DO VEÍCULO */}
              <FocusQuestion
                isActive={activeVehicleField === 'usage'}
                isCompleted={activeVehicleField === 'cep'}
                label="Uso Principal do Veículo"
                valueLabel={getFieldValueLabel('usage')}
                stepNumber={isZeroKm === "sim" ? 5 : 6}
              >
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setVehicleUseType("pessoal");
                      setTimeout(() => advanceToNextField(), 150);
                    }}
                    className={`h-20 flex flex-col items-center justify-center rounded-xl border-2 transition-all gap-1 ${
                      vehicleUseType === "pessoal"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                        : "bg-white text-muted-foreground border-input hover:border-emerald-300"
                    }`}
                  >
                    <Car size={24} />
                    <span className="font-semibold text-sm">Uso Pessoal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVehicleUseType("comercial");
                      setTimeout(() => advanceToNextField(), 150);
                    }}
                    className={`h-20 flex flex-col items-center justify-center rounded-xl border-2 transition-all gap-1 ${
                      vehicleUseType === "comercial"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                        : "bg-white text-muted-foreground border-input hover:border-emerald-300"
                    }`}
                  >
                    <Smartphone size={24} />
                    <span className="font-semibold text-sm">Motorista Uber/Similares</span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {vehicleUseType === "comercial" 
                    ? "Inclui motoristas de app (Uber, 99, iFood), visitas a clientes e entregas"
                    : "Inclui lazer e ida/volta ao trabalho/faculdade"}
                </p>
              </FocusQuestion>

              {/* 7. CEP */}
              <FocusQuestion
                isActive={activeVehicleField === 'cep'}
                isCompleted={false}
                label="CEP de Pernoite"
                valueLabel={getFieldValueLabel('cep')}
                stepNumber={isZeroKm === "sim" ? 6 : 7}
              >
                <div className="relative">
                  <FormInput
                    label=""
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => {
                      const formatted = formatCEP(e.target.value);
                      setCep(formatted);
                      if (formatted.replace(/\D/g, "").length === 8) {
                        fetchAddressByCep(formatted);
                      }
                    }}
                    inputMode="numeric"
                    hint={isLoadingCep ? "Buscando endereço..." : "Onde o veículo passa a noite"}
                  />
                  {isLoadingCep && (
                    <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-emerald-500" />
                  )}
                </div>
              </FocusQuestion>
            </div>
          </FormCard>
        )}

        {/* STEP 3 - Endereço & Residência */}
        {currentStep === 2 && (
          <FormCard title="Endereço & Residência" description="Onde o veículo pernoita">
            <div className="space-y-8">
              
              {/* BLOCO A: Endereço Compacto */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-border">
                  <h3 className="font-semibold text-foreground">Endereço</h3>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-mono rounded-full">
                    {cep}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3">
                    <FormInput 
                      label="Rua" 
                      placeholder="Nome da rua"
                      value={street} 
                      onChange={(e) => setStreet(e.target.value)} 
                      required 
                    />
                  </div>
                  <FormInput 
                    label="Número" 
                    placeholder="Nº"
                    value={number} 
                    onChange={(e) => setNumber(e.target.value)} 
                    inputMode="numeric"
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput 
                    label="Bairro" 
                    placeholder="Seu bairro"
                    value={neighborhood} 
                    onChange={(e) => setNeighborhood(e.target.value)} 
                    required 
                  />
                  <FormInput 
                    label="Cidade" 
                    placeholder="Sua cidade"
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {/* BLOCO B: Residência & Garagem */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground pb-2 border-b border-border">Residência & Garagem</h3>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Qual seu tipo de residência?</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <OptionCard
                      icon={<Home size={24} />}
                      label="Casa"
                      selected={residenceType === "casa"}
                      onClick={() => setResidenceType("casa")}
                    />
                    <OptionCard
                      icon={<Building2 size={24} />}
                      label="Apartamento"
                      selected={residenceType === "apartamento"}
                      onClick={() => setResidenceType("apartamento")}
                    />
                    <OptionCard
                      icon={<Warehouse size={24} />}
                      label="Condomínio"
                      selected={residenceType === "condominio"}
                      onClick={() => setResidenceType("condominio")}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-medium">Onde o veículo pernoita?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <OptionCard
                      icon={<Zap size={24} />}
                      label="Portão Automático"
                      selected={garageType === "automatico"}
                      onClick={() => setGarageType("automatico")}
                    />
                    <OptionCard
                      icon={<KeyRound size={24} />}
                      label="Portão Manual"
                      selected={garageType === "manual"}
                      onClick={() => setGarageType("manual")}
                    />
                    <OptionCard
                      icon={<ParkingCircle size={24} />}
                      label="Estacionamento"
                      selected={garageType === "estacionamento"}
                      onClick={() => setGarageType("estacionamento")}
                    />
                    <OptionCard
                      icon={<Car size={24} />}
                      label="Rua"
                      selected={garageType === "rua"}
                      onClick={() => setGarageType("rua")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </FormCard>
        )}

        {/* STEP 4 - Perfil de Risco */}
        {currentStep === 3 && (
          <FormCard title="Perfil de Risco" description="Rotina de uso do veículo">
            <div className="space-y-8">
              
              {/* BLOCO A: Rotina - Trabalho */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground pb-2 border-b border-border flex items-center gap-2">
                  <Briefcase size={18} /> Rotina de Trabalho
                </h3>
                
                <YesNoToggle
                  label="Usa o veículo para ir ao trabalho?"
                  value={usesForWork}
                  onChange={setUsesForWork}
                />

                {usesForWork === "sim" && (
                  <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-sm font-medium">Onde estaciona no trabalho?</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <OptionCard
                        icon={<Warehouse size={24} />}
                        label="Garagem Fechada"
                        selected={workParking === "fechada"}
                        onClick={() => setWorkParking("fechada")}
                      />
                      <OptionCard
                        icon={<ParkingCircle size={24} />}
                        label="Estac. Pago"
                        selected={workParking === "estacionamento"}
                        onClick={() => setWorkParking("estacionamento")}
                      />
                      <OptionCard
                        icon={<Car size={24} />}
                        label="Rua"
                        selected={workParking === "rua"}
                        onClick={() => setWorkParking("rua")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* BLOCO B: Rotina - Faculdade */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground pb-2 border-b border-border flex items-center gap-2">
                  <GraduationCap size={18} /> Rotina de Estudo
                </h3>
                
                <YesNoToggle
                  label="Usa o veículo para ir à faculdade/escola?"
                  value={usesForSchool}
                  onChange={setUsesForSchool}
                />

                {usesForSchool === "sim" && (
                  <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-sm font-medium">Onde estaciona na faculdade/escola?</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <OptionCard
                        icon={<Warehouse size={24} />}
                        label="Garagem Fechada"
                        selected={schoolParking === "fechada"}
                        onClick={() => setSchoolParking("fechada")}
                      />
                      <OptionCard
                        icon={<ParkingCircle size={24} />}
                        label="Estac. Pago"
                        selected={schoolParking === "estacionamento"}
                        onClick={() => setSchoolParking("estacionamento")}
                      />
                      <OptionCard
                        icon={<Car size={24} />}
                        label="Rua"
                        selected={schoolParking === "rua"}
                        onClick={() => setSchoolParking("rua")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* BLOCO C: Condutor Jovem (Lógica Condicional) */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground pb-2 border-b border-border flex items-center gap-2">
                  <Users size={18} /> Condutor Jovem
                </h3>
                
                {/* Pergunta 1 - Sempre visível */}
                <YesNoToggle
                  label="O principal condutor reside com pessoas entre 18 a 25 anos?"
                  value={livesWithYoungPerson}
                  onChange={(val) => {
                    setLivesWithYoungPerson(val);
                    if (val === "nao") {
                      setYoungPersonDrives("nao");
                      setYoungDriverAge("");
                      setYoungDriverGender("");
                    }
                  }}
                />

                {/* Pergunta 2 - Só aparece se Pergunta 1 = Sim */}
                {livesWithYoungPerson === "sim" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <YesNoToggle
                      label="Essa pessoa conduz o veículo, mesmo que esporadicamente?"
                      value={youngPersonDrives}
                      onChange={(val) => {
                        setYoungPersonDrives(val);
                        if (val === "nao") {
                          setYoungDriverAge("");
                          setYoungDriverGender("");
                        }
                      }}
                    />
                  </div>
                )}

                {/* Pergunta 3 - Só aparece se Pergunta 2 = Sim */}
                {livesWithYoungPerson === "sim" && youngPersonDrives === "sim" && (
                  <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <FormInput
                      label="Idade do Condutor"
                      placeholder="Ex: 22"
                      value={youngDriverAge}
                      onChange={(e) => setYoungDriverAge(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      inputMode="numeric"
                      required
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sexo <span className="text-destructive">*</span></label>
                      <Select value={youngDriverGender} onValueChange={setYoungDriverGender}>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </FormCard>
        )}
      </div>

      <div className="flex items-center justify-center mt-6 mb-4">
        <p className="text-xs text-muted-foreground text-center flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-success" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Seus dados estão seguros e não serão compartilhados com terceiros.
        </p>
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => {
            if (currentStep === 0) {
              setQuoteType(null); // Volta para seleção de tipo
            } else {
              prevStep();
            }
          }} 
          className="gap-2"
        >
          <ArrowLeft size={18} /> Voltar
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button variant="cta" onClick={nextStep} disabled={!isStepValid(currentStep)} className="gap-2">
            Próximo <ArrowRight size={18} />
          </Button>
        ) : (
          <Button variant="cta" onClick={handleSubmit} disabled={!isStepValid(currentStep) || isSubmitting} className="gap-2">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Enviar Cotação <ArrowRight size={18} /></>}
          </Button>
        )}
      </div>
    </div>
  );
};
