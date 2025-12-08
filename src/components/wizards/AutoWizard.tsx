import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Stepper, type Step } from "@/components/ui/stepper";
import { FormCard } from "@/components/ui/form-card";
import { FormInput } from "@/components/ui/form-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { RadioCardGroup } from "@/components/ui/radio-card";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
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
  Car, 
  Briefcase, 
  Building2, 
  Smartphone,
  ShieldCheck,
  DoorOpen,
  ParkingSquare,
  Building,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { sendToRDStation, buildAutoPayload } from "@/utils/dataProcessor";

// Passo 1 renomeado conforme solicitado
const steps: Step[] = [
  { id: "personal", title: "Dados Principal Condutor", description: "Quem vai dirigir?" },
  { id: "vehicle", title: "Veículo", description: "Dados do carro" },
  { id: "address", title: "Endereço", description: "Onde você mora" },
];

// CPF Mask
const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

// CNPJ Mask
const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

// Phone Mask
const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

// CEP Mask
const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
};

// License Plate Mask
const formatPlate = (value: string) => {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^([A-Z]{3})([0-9A-Z])/, "$1-$2")
    .slice(0, 8);
};

// Vehicle usage options with icons
const vehicleUsageOptions = [
  { value: "lazer", label: "Somente Lazer", description: "Passeios e viagens", icon: <Car size={20} /> },
  { value: "rotina", label: "Trabalho/Estudo", description: "Ida e volta diária", icon: <Briefcase size={20} /> },
  { value: "comercial", label: "Uso Comercial", description: "Vendas/Visitas", icon: <Building2 size={20} /> },
  { value: "app", label: "Motorista App", description: "Uber, 99, iFood", icon: <Smartphone size={20} /> },
];

// Home garage options with icons
const homeGarageOptions = [
  { value: "garagem_automatica", label: "Garagem Automática", description: "Portão com controle", icon: <ShieldCheck size={20} /> },
  { value: "garagem_manual", label: "Garagem Manual", description: "Portão comum", icon: <DoorOpen size={20} /> },
  { value: "estacionamento", label: "Estacionamento", description: "Fechado/Pago", icon: <ParkingSquare size={20} /> },
  { value: "condominio", label: "Garagem Condomínio", description: "Área comum", icon: <Building size={20} /> },
  { value: "rua", label: "Na Rua", description: "Sem garagem", icon: <AlertTriangle size={20} /> },
];

// Work garage options
const workGarageOptions = [
  { value: "garagem_fechada", label: "Garagem da Empresa", description: "Privativa/Fechada", icon: <ShieldCheck size={20} /> },
  { value: "estacionamento_pago", label: "Estacionamento Pago", description: "Coberto ou não", icon: <ParkingSquare size={20} /> },
  { value: "rua", label: "Na Rua", description: "Sem cobertura", icon: <AlertTriangle size={20} /> },
];

export const AutoWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state - Step 1 (Personal)
  const [personType, setPersonType] = React.useState("pf");
  const [cpfCnpj, setCpfCnpj] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [maritalStatus, setMaritalStatus] = React.useState("");
  const [profession, setProfession] = React.useState("");

  // Form state - Step 2 (Vehicle)
  const [plate, setPlate] = React.useState("");
  const [isZeroKm, setIsZeroKm] = React.useState(false);
  const [isFinanced, setIsFinanced] = React.useState(false);
  const [vehicleModel, setVehicleModel] = React.useState("");
  const [vehicleYearModel, setVehicleYearModel] = React.useState("");
  const [vehicleUse, setVehicleUse] = React.useState("lazer");
  const [hasYoungDriver, setHasYoungDriver] = React.useState(false);
  const [livesWithMinor, setLivesWithMinor] = React.useState(false);

  // Form state - Step 3 (Address + Risk)
  const [cep, setCep] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [neighborhood, setNeighborhood] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [homeGarageType, setHomeGarageType] = React.useState("garagem_automatica");
  const [workGarageType, setWorkGarageType] = React.useState("");

  // Conditional: show work garage only for rotina or comercial
  const needsWorkGarage = vehicleUse === "rotina" || vehicleUse === "comercial";

  // Validation state
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "cpfCnpj":
        if (personType === "pf" && value.replace(/\D/g, "").length !== 11) {
          newErrors.cpfCnpj = "CPF deve ter 11 dígitos";
        } else if (personType === "pj" && value.replace(/\D/g, "").length !== 14) {
          newErrors.cpfCnpj = "CNPJ deve ter 14 dígitos";
        } else {
          delete newErrors.cpfCnpj;
        }
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "E-mail inválido";
        } else {
          delete newErrors.email;
        }
        break;
      case "phone":
        if (value.replace(/\D/g, "").length < 11) {
          newErrors.phone = "Telefone deve ter 11 dígitos";
        } else {
          delete newErrors.phone;
        }
        break;
      case "name":
        if (value.trim().length < 3) {
          newErrors.name = "Nome deve ter pelo menos 3 caracteres";
        } else {
          delete newErrors.name;
        }
        break;
      case "profession":
        if (value.trim().length < 3) {
          newErrors.profession = "Profissão é obrigatória";
        } else {
          delete newErrors.profession;
        }
        break;
      case "maritalStatus":
        if (!value) {
          newErrors.maritalStatus = "Estado civil é obrigatório";
        } else {
          delete newErrors.maritalStatus;
        }
        break;
      case "plate":
        if (!isZeroKm && value.replace(/[^A-Z0-9]/g, "").length < 7) {
          newErrors.plate = "Placa inválida";
        } else {
          delete newErrors.plate;
        }
        break;
      case "cep":
        if (value.replace(/\D/g, "").length !== 8) {
          newErrors.cep = "CEP deve ter 8 dígitos";
        } else {
          delete newErrors.cep;
        }
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
        const plateValid = isZeroKm || plate.replace(/[^A-Z0-9]/g, "").length >= 7;
        return plateValid && vehicleModel.trim().length >= 2 && vehicleYearModel.trim().length >= 4;
      case 2:
        const addressValid = 
          cep.replace(/\D/g, "").length === 8 &&
          street.trim().length > 0 &&
          number.trim().length > 0 &&
          neighborhood.trim().length > 0 &&
          city.trim().length > 0 &&
          homeGarageType !== "";
        
        // If needs work garage, validate it too
        if (needsWorkGarage) {
          return addressValid && workGarageType !== "";
        }
        return addressValid;
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
        plate,
        isZeroKm,
        isFinanced,
        vehicleModel,
        vehicleYearModel,
        vehicleUse,
        hasYoungDriver,
        livesWithMinor,
        cep,
        street,
        number,
        neighborhood,
        city,
        state,
        homeGarageType,
        workGarageType: needsWorkGarage ? workGarageType : undefined,
      });

      const success = await sendToRDStation(payload);
      
      if (success) {
        navigate("/sucesso");
      } else {
        toast.error("Erro ao enviar cotação. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro no submit:", error);
      toast.error("Erro ao enviar cotação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      <Stepper steps={steps} currentStep={currentStep} className="mb-8" />

      <div className="min-h-[400px]">
        {currentStep === 0 && (
          <FormCard
            title="Dados Principal Condutor"
            description="Preencha as informações do principal condutor"
          >
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
                onChange={(e) =>
                  setCpfCnpj(
                    personType === "pf"
                      ? formatCPF(e.target.value)
                      : formatCNPJ(e.target.value)
                  )
                }
                onBlur={() => handleBlur("cpfCnpj", cpfCnpj)}
                inputMode="numeric"
                error={touched.cpfCnpj ? errors.cpfCnpj : undefined}
                success={touched.cpfCnpj && !errors.cpfCnpj && cpfCnpj.length > 0}
                required
              />

              <FormInput
                label={personType === "pf" ? "Nome Completo" : "Razão Social"}
                placeholder={personType === "pf" ? "Seu nome completo" : "Nome da empresa"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur("name", name)}
                error={touched.name ? errors.name : undefined}
                success={touched.name && !errors.name && name.length > 0}
                required
              />

              {/* Novos Campos: Estado Civil e Profissão */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Estado Civil <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={maritalStatus}
                    onValueChange={(val) => {
                      setMaritalStatus(val);
                      setTouched((prev) => ({ ...prev, maritalStatus: true }));
                      if (val) {
                        const newErrors = { ...errors };
                        delete newErrors.maritalStatus;
                        setErrors(newErrors);
                      }
                    }}
                  >
                    <SelectTrigger className={touched.maritalStatus && errors.maritalStatus ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      <SelectItem value="uniao_estavel">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                  {touched.maritalStatus && errors.maritalStatus && (
                    <p className="text-xs text-destructive">{errors.maritalStatus}</p>
                  )}
                </div>

                <FormInput
                  label="Profissão"
                  placeholder="Ex: Engenheiro"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  onBlur={() => handleBlur("profession", profession)}
                  error={touched.profession ? errors.profession : undefined}
                  success={touched.profession && !errors.profession && profession.length > 0}
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
                inputMode="email"
                error={touched.email ? errors.email : undefined}
                success={touched.email && !errors.email && email.length > 0}
                required
              />

              <FormInput
                label="Celular"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                onBlur={() => handleBlur("phone", phone)}
                inputMode="tel"
                error={touched.phone ? errors.phone : undefined}
                success={touched.phone && !errors.phone && phone.length > 0}
                required
              />
            </div>
          </FormCard>
        )}

        {currentStep === 1 && (
          <FormCard
            title="Dados do Veículo"
            description="Informações sobre o veículo a ser segurado"
          >
            <div className="space-y-5">
              <ToggleSwitch
                label="Veículo Zero KM"
                description="Marque se o veículo é 0km (sem placa)"
                checked={isZeroKm}
                onCheckedChange={(checked) => {
                  setIsZeroKm(checked);
                  if (checked) {
                    setPlate("");
                    setErrors((prev) => ({ ...prev, plate: undefined } as Record<string, string>));
                  }
                }}
              />

              {!isZeroKm && (
                <FormInput
                  label="Placa do Veículo"
                  placeholder="ABC-1234 ou ABC1D23"
                  value={plate}
                  onChange={(e) => setPlate(formatPlate(e.target.value))}
                  onBlur={() => handleBlur("plate", plate)}
                  error={touched.plate ? errors.plate : undefined}
                  success={touched.plate && !errors.plate && plate.length > 0}
                  required
                  className="uppercase font-mono"
                />
              )}

              <ToggleSwitch
                label="Veículo Financiado"
                description="Marque se o veículo possui financiamento ativo"
                checked={isFinanced}
                onCheckedChange={setIsFinanced}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Modelo do Veículo"
                  placeholder="Ex: Civic, Onix, HB20"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  required
                />
                <FormInput
                  label="Ano/Modelo"
                  placeholder="Ex: 2023/2024"
                  value={vehicleYearModel}
                  onChange={(e) => setVehicleYearModel(e.target.value)}
                  required
                />
              </div>

              <RadioCardGroup
                label="Qual o uso principal do veículo?"
                options={vehicleUsageOptions}
                value={vehicleUse}
                onChange={setVehicleUse}
              />

              <ToggleSwitch
                label="Há condutor entre 18-25 anos?"
                description="Motoristas jovens que usarão o veículo regularmente"
                checked={hasYoungDriver}
                onCheckedChange={setHasYoungDriver}
              />

              <ToggleSwitch
                label="Reside com menor de 18 anos?"
                description="Menores que residem na mesma residência"
                checked={livesWithMinor}
                onCheckedChange={setLivesWithMinor}
              />
            </div>
          </FormCard>
        )}

        {currentStep === 2 && (
          <FormCard title="Endereço" description="Onde o veículo pernoita">
            <div className="space-y-5">
              <FormInput
                label="CEP"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(formatCEP(e.target.value))}
                onBlur={() => handleBlur("cep", cep)}
                inputMode="numeric"
                error={touched.cep ? errors.cep : undefined}
                success={touched.cep && !errors.cep && cep.length > 0}
                hint="Digite o CEP para buscar o endereço"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
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

              <RadioCardGroup
                label="Onde o veículo passa a noite?"
                options={homeGarageOptions}
                value={homeGarageType}
                onChange={setHomeGarageType}
              />

              {needsWorkGarage && (
                <RadioCardGroup
                  label="Onde o veículo fica no trabalho/estudo?"
                  options={workGarageOptions}
                  value={workGarageType}
                  onChange={setWorkGarageType}
                />
              )}
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

      <div className="flex items-center justify-between">
        <Button
          variant="outline-subtle"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft size={18} />
          Voltar
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            variant="cta"
            onClick={nextStep}
            disabled={!isStepValid(currentStep)}
            className="gap-2"
          >
            Próximo
            <ArrowRight size={18} />
          </Button>
        ) : (
          <Button
            variant="cta"
            onClick={handleSubmit}
            disabled={!isStepValid(currentStep) || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                Enviar Cotação
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};