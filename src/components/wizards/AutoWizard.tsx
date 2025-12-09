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
  Check,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { sendToRDStation, buildAutoPayload } from "@/utils/dataProcessor";
import { Label } from "@/components/ui/label";

const steps: Step[] = [
  { id: "personal", title: "Dados Principal Condutor", description: "Quem vai dirigir?" },
  { id: "vehicle", title: "Veículo", description: "Dados do carro" },
  { id: "address", title: "Risco & Endereço", description: "Perfil de uso" },
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

// Componente YesNoToggle com visual refinado
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

// NOVO: Componente FocusQuestion para o acordeão sequencial
interface FocusQuestionProps {
  id: string;
  label: string;
  value: string;
  isActive: boolean;
  isCompleted: boolean;
  onActivate: () => void;
  children: React.ReactNode;
}

const FocusQuestion: React.FC<FocusQuestionProps> = ({
  id,
  label,
  value,
  isActive,
  isCompleted,
  onActivate,
  children,
}) => {
  return (
    <motion.div
      layout
      className={`rounded-xl border-2 overflow-hidden transition-colors duration-200 ${
        isActive 
          ? "border-primary ring-4 ring-primary/5 bg-background" 
          : isCompleted 
            ? "border-muted bg-muted/30 cursor-pointer hover:bg-muted/50" 
            : "border-muted bg-muted/20"
      }`}
      onClick={() => !isActive && isCompleted && onActivate()}
    >
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            <Label className="text-base font-semibold text-foreground mb-3 block">{label}</Label>
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-3 flex items-center justify-between min-h-[56px]"
          >
            <div className="flex items-center gap-3">
              {isCompleted && (
                <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                  <Check size={14} className="text-success" />
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">{label}</span>
                {isCompleted && value && (
                  <p className="text-sm font-semibold text-foreground">{value}</p>
                )}
              </div>
            </div>
            {isCompleted && (
              <ChevronRight size={18} className="text-muted-foreground" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Componente de Input com botão Ok inline
interface FocusInputProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirm: () => void;
  isValid: boolean;
  inputMode?: "text" | "numeric" | "tel";
  className?: string;
  autoFocus?: boolean;
}

const FocusInput: React.FC<FocusInputProps> = ({
  placeholder,
  value,
  onChange,
  onConfirm,
  isValid,
  inputMode = "text",
  className = "",
  autoFocus = true,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValid) {
      onConfirm();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        inputMode={inputMode}
        autoFocus={autoFocus}
        className={`flex-1 h-12 px-4 rounded-lg border border-input bg-background text-base 
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          transition-all duration-200 ${className}`}
      />
      <Button
        type="button"
        onClick={onConfirm}
        disabled={!isValid}
        className="h-12 px-4 shrink-0"
        variant="cta"
      >
        Ok
      </Button>
    </div>
  );
};

// Componente de seleção Sim/Não com auto-avanço
interface FocusYesNoProps {
  value: "sim" | "nao";
  onChange: (value: "sim" | "nao") => void;
  onConfirm: () => void;
}

const FocusYesNo: React.FC<FocusYesNoProps> = ({ value, onChange, onConfirm }) => {
  const handleClick = (newValue: "sim" | "nao") => {
    onChange(newValue);
    setTimeout(() => onConfirm(), 300);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => handleClick("sim")}
        className={`h-14 flex items-center justify-center rounded-xl border-2 text-base font-semibold transition-all duration-200 ${
          value === "sim"
            ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
            : "bg-background text-muted-foreground border-input hover:bg-muted/50 hover:border-muted-foreground"
        }`}
      >
        Sim
      </button>
      <button
        type="button"
        onClick={() => handleClick("nao")}
        className={`h-14 flex items-center justify-center rounded-xl border-2 text-base font-semibold transition-all duration-200 ${
          value === "nao"
            ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
            : "bg-background text-muted-foreground border-input hover:bg-muted/50 hover:border-muted-foreground"
        }`}
      >
        Não
      </button>
    </div>
  );
};

// Tipo para os campos do Step 2
type Step2Field = "model" | "year" | "zeroKm" | "plate" | "financed" | "useType" | "cep";

export const AutoWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  // Estado de controle de foco para Step 2
  const [activeField, setActiveField] = React.useState<Step2Field>("model");

  // Form state - Step 3 (Endereço + Risco)
  const [street, setStreet] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [neighborhood, setNeighborhood] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [residenceType, setResidenceType] = React.useState("casa");
  const [garageType, setGarageType] = React.useState("automatico");
  const [usesForWork, setUsesForWork] = React.useState<"sim" | "nao">("nao");
  const [workParking, setWorkParking] = React.useState("fechada");
  const [usesForSchool, setUsesForSchool] = React.useState<"sim" | "nao">("nao");
  const [schoolParking, setSchoolParking] = React.useState("fechada");
  const [youngDriver, setYoungDriver] = React.useState<"sim" | "nao">("nao");

  // Validation state
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  // Lógica de validação por campo Step 2
  const isFieldValid = (field: Step2Field): boolean => {
    switch (field) {
      case "model": return model.trim().length >= 2;
      case "year": return yearModel.trim().length >= 4;
      case "zeroKm": return true;
      case "plate": return isZeroKm === "sim" || plate.replace(/[^A-Z0-9]/g, "").length >= 7;
      case "financed": return true;
      case "useType": return true;
      case "cep": return cep.replace(/\D/g, "").length === 8;
      default: return false;
    }
  };

  // Lógica de avanço automático Step 2
  const advanceToNextField = (currentField: Step2Field) => {
    const fieldOrder: Step2Field[] = ["model", "year", "zeroKm", "plate", "financed", "useType", "cep"];
    const currentIndex = fieldOrder.indexOf(currentField);
    
    if (currentField === "zeroKm" && isZeroKm === "sim") {
      // Se Zero KM, pula o campo Placa
      setActiveField("financed");
      return;
    }
    
    if (currentIndex < fieldOrder.length - 1) {
      setActiveField(fieldOrder[currentIndex + 1]);
    }
  };

  // Verificar se um campo foi completado
  const isFieldCompleted = (field: Step2Field): boolean => {
    const fieldOrder: Step2Field[] = ["model", "year", "zeroKm", "plate", "financed", "useType", "cep"];
    const currentIndex = fieldOrder.indexOf(activeField);
    const fieldIndex = fieldOrder.indexOf(field);
    
    // Se Zero KM, considera Placa como completado
    if (field === "plate" && isZeroKm === "sim") {
      return fieldIndex < currentIndex || activeField === "cep";
    }
    
    return fieldIndex < currentIndex;
  };

  // Obter valor de exibição para campo colapsado
  const getFieldDisplayValue = (field: Step2Field): string => {
    switch (field) {
      case "model": return model;
      case "year": return yearModel;
      case "zeroKm": return isZeroKm === "sim" ? "Sim" : "Não";
      case "plate": return isZeroKm === "sim" ? "Zero KM (sem placa)" : plate;
      case "financed": return isFinanced === "sim" ? "Sim" : "Não";
      case "useType": return vehicleUseType === "pessoal" ? "Uso Pessoal" : "Comercial / App";
      case "cep": return cep;
      default: return "";
    }
  };

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
    }

    setErrors(newErrors);
    return !newErrors[field];
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
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
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1 && isStepValid(currentStep)) {
      setCurrentStep((prev) => prev + 1);
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
        youngDriver: youngDriver === "sim",
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

  return (
    <div className="w-full max-w-2xl mx-auto">
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

        {/* STEP 2 - Veículo + CEP (Focus Mode / Acordeão Sequencial) */}
        {currentStep === 1 && (
          <FormCard title="Dados do Veículo" description="Preencha os dados conforme o documento">
            <div className="flex flex-col gap-3">
              {/* Campo 1: Modelo */}
              <FocusQuestion
                id="model"
                label="Modelo do Veículo"
                value={getFieldDisplayValue("model")}
                isActive={activeField === "model"}
                isCompleted={isFieldCompleted("model")}
                onActivate={() => setActiveField("model")}
              >
                <FocusInput
                  placeholder="Ex: Onix Plus 1.0 Turbo"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  onConfirm={() => advanceToNextField("model")}
                  isValid={isFieldValid("model")}
                />
              </FocusQuestion>

              {/* Campo 2: Ano/Modelo */}
              <FocusQuestion
                id="year"
                label="Ano/Modelo"
                value={getFieldDisplayValue("year")}
                isActive={activeField === "year"}
                isCompleted={isFieldCompleted("year")}
                onActivate={() => setActiveField("year")}
              >
                <FocusInput
                  placeholder="Ex: 2024/2025"
                  value={yearModel}
                  onChange={(e) => setYearModel(e.target.value)}
                  onConfirm={() => advanceToNextField("year")}
                  isValid={isFieldValid("year")}
                  inputMode="numeric"
                />
              </FocusQuestion>

              {/* Campo 3: Zero KM? */}
              <FocusQuestion
                id="zeroKm"
                label="O veículo é Zero KM?"
                value={getFieldDisplayValue("zeroKm")}
                isActive={activeField === "zeroKm"}
                isCompleted={isFieldCompleted("zeroKm")}
                onActivate={() => setActiveField("zeroKm")}
              >
                <FocusYesNo
                  value={isZeroKm}
                  onChange={(val) => {
                    setIsZeroKm(val);
                    if (val === "sim") setPlate("");
                  }}
                  onConfirm={() => advanceToNextField("zeroKm")}
                />
              </FocusQuestion>

              {/* Campo 4: Placa (só aparece se não for Zero KM) */}
              {isZeroKm === "nao" && (
                <FocusQuestion
                  id="plate"
                  label="Placa do Veículo"
                  value={getFieldDisplayValue("plate")}
                  isActive={activeField === "plate"}
                  isCompleted={isFieldCompleted("plate")}
                  onActivate={() => setActiveField("plate")}
                >
                  <FocusInput
                    placeholder="ABC-1234"
                    value={plate}
                    onChange={(e) => setPlate(formatPlate(e.target.value))}
                    onConfirm={() => advanceToNextField("plate")}
                    isValid={isFieldValid("plate")}
                    className="uppercase font-mono text-lg tracking-wider"
                  />
                </FocusQuestion>
              )}

              {/* Campo 5: Alienado/Financiado? */}
              <FocusQuestion
                id="financed"
                label="Veículo Alienado/Financiado?"
                value={getFieldDisplayValue("financed")}
                isActive={activeField === "financed"}
                isCompleted={isFieldCompleted("financed")}
                onActivate={() => setActiveField("financed")}
              >
                <FocusYesNo
                  value={isFinanced}
                  onChange={setIsFinanced}
                  onConfirm={() => advanceToNextField("financed")}
                />
              </FocusQuestion>

              {/* Campo 6: Uso do Veículo */}
              <FocusQuestion
                id="useType"
                label="Qual o uso principal do veículo?"
                value={getFieldDisplayValue("useType")}
                isActive={activeField === "useType"}
                isCompleted={isFieldCompleted("useType")}
                onActivate={() => setActiveField("useType")}
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setVehicleUseType("pessoal");
                        setTimeout(() => advanceToNextField("useType"), 300);
                      }}
                      className={`h-20 flex flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all duration-200 ${
                        vehicleUseType === "pessoal"
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                          : "bg-background text-muted-foreground border-input hover:bg-muted/50"
                      }`}
                    >
                      <Car size={24} />
                      <span className="text-sm font-semibold">Uso Pessoal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVehicleUseType("comercial");
                        setTimeout(() => advanceToNextField("useType"), 300);
                      }}
                      className={`h-20 flex flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all duration-200 ${
                        vehicleUseType === "comercial"
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                          : "bg-background text-muted-foreground border-input hover:bg-muted/50"
                      }`}
                    >
                      <Briefcase size={24} />
                      <span className="text-sm font-semibold">Comercial / App</span>
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {vehicleUseType === "comercial" 
                      ? "Inclui visitas a clientes, entregas e motoristas de aplicativo"
                      : "Inclui lazer e ida/volta ao trabalho/faculdade"}
                  </p>
                </div>
              </FocusQuestion>

              {/* Campo 7: CEP Pernoite */}
              <FocusQuestion
                id="cep"
                label="CEP de Pernoite"
                value={getFieldDisplayValue("cep")}
                isActive={activeField === "cep"}
                isCompleted={isFieldCompleted("cep")}
                onActivate={() => setActiveField("cep")}
              >
                <div className="space-y-2">
                  <FocusInput
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => setCep(formatCEP(e.target.value))}
                    onConfirm={() => {}} // CEP é o último campo
                    isValid={isFieldValid("cep")}
                    inputMode="numeric"
                  />
                  <p className="text-xs text-muted-foreground">Onde o veículo passa a noite</p>
                </div>
              </FocusQuestion>
            </div>
          </FormCard>
        )}

        {/* STEP 3 - Risco & Endereço */}
        {currentStep === 2 && (
          <FormCard title="Risco & Endereço" description="Perfil de uso do veículo">
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

              {/* BLOCO C: Rotina - Trabalho */}
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

              {/* BLOCO C2: Rotina - Faculdade */}
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

              {/* BLOCO D: Perfil de Motorista */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground pb-2 border-b border-border">Perfil de Motorista</h3>
                
                <YesNoToggle
                  label="Há condutores entre 18 e 25 anos?"
                  value={youngDriver}
                  onChange={setYoungDriver}
                />
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
        <Button variant="outline-subtle" onClick={prevStep} disabled={currentStep === 0} className="gap-2">
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
