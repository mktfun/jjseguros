import * as React from "react";
import { useNavigate } from "react-router-dom";
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
  Users
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

// Componente Sim/Não minimalista
interface YesNoSelectorProps {
  label: string;
  value: "sim" | "nao";
  onChange: (value: "sim" | "nao") => void;
}

const YesNoSelector: React.FC<YesNoSelectorProps> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{label}</Label>
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange("sim")}
        className={`flex-1 py-3 px-4 rounded-lg border text-center font-medium transition-all duration-200 ${
          value === "sim"
            ? "border-primary bg-primary/5 text-primary shadow-sm"
            : "border-input bg-background hover:bg-muted/50 text-muted-foreground"
        }`}
      >
        Sim
      </button>
      <button
        type="button"
        onClick={() => onChange("nao")}
        className={`flex-1 py-3 px-4 rounded-lg border text-center font-medium transition-all duration-200 ${
          value === "nao"
            ? "border-primary bg-primary/5 text-primary shadow-sm"
            : "border-input bg-background hover:bg-muted/50 text-muted-foreground"
        }`}
      >
        Não
      </button>
    </div>
  </div>
);

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
  const [cep, setCep] = React.useState("");

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
  const [youngDriver, setYoungDriver] = React.useState<"sim" | "nao">("nao");

  // Validation state
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

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

        {/* STEP 2 - Veículo + CEP */}
        {currentStep === 1 && (
          <FormCard title="Dados do Veículo" description="Preencha os dados conforme o documento">
            <div className="space-y-6">
              {/* 1. PLACA - Renderização condicional simples */}
              {isZeroKm === "nao" && (
                <FormInput
                  label="Placa"
                  placeholder="ABC-1234"
                  value={plate}
                  onChange={(e) => setPlate(formatPlate(e.target.value))}
                  onBlur={() => handleBlur("plate", plate)}
                  error={touched.plate ? errors.plate : undefined}
                  className="uppercase font-mono text-lg"
                />
              )}

              {/* 2. MODELO */}
              <FormInput
                label="Modelo do Veículo"
                placeholder="Ex: Onix Plus 1.0 Turbo"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                onBlur={() => handleBlur("model", model)}
                error={touched.model ? errors.model : undefined}
                required
              />

              {/* 3. ANO/MODELO */}
              <FormInput
                label="Ano/Modelo"
                placeholder="Ex: 2024/2025"
                value={yearModel}
                onChange={(e) => setYearModel(e.target.value)}
                onBlur={() => handleBlur("yearModel", yearModel)}
                error={touched.yearModel ? errors.yearModel : undefined}
                required
                inputMode="numeric"
              />

              {/* 4. ZERO KM? */}
              <YesNoSelector
                label="O veículo é Zero KM?"
                value={isZeroKm}
                onChange={(val) => {
                  setIsZeroKm(val);
                  if (val === "sim") setPlate("");
                }}
              />

              {/* 5. ALIENADO/FINANCIADO? */}
              <YesNoSelector
                label="Veículo Alienado/Financiado?"
                value={isFinanced}
                onChange={setIsFinanced}
              />

              {/* 6. CEP PERNOITE */}
              <div className="pt-4 border-t border-border">
                <FormInput
                  label="CEP de Pernoite"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(formatCEP(e.target.value))}
                  onBlur={() => handleBlur("cep", cep)}
                  inputMode="numeric"
                  error={touched.cep ? errors.cep : undefined}
                  hint="Onde o veículo passa a noite"
                  required
                />
              </div>
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
                  <div className="grid grid-cols-3 gap-3">
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

              {/* BLOCO C: Rotina (Condicional) */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground pb-2 border-b border-border">Rotina</h3>
                
                <YesNoSelector
                  label="Usa o veículo para ir ao trabalho ou faculdade?"
                  value={usesForWork}
                  onChange={setUsesForWork}
                />

                {usesForWork === "sim" && (
                  <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-sm font-medium">Onde estaciona no trabalho/estudo?</Label>
                    <div className="grid grid-cols-3 gap-3">
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

              {/* BLOCO D: Perfil de Motorista */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground pb-2 border-b border-border">Perfil de Motorista</h3>
                
                <YesNoSelector
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
