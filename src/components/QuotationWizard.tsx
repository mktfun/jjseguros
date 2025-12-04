import * as React from "react";
import { Stepper, type Step } from "@/components/ui/stepper";
import { FormCard } from "@/components/ui/form-card";
import { FormInput } from "@/components/ui/form-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { RadioCardGroup } from "@/components/ui/radio-card";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User, Car, MapPin } from "lucide-react";

const steps: Step[] = [
  { id: "personal", title: "Dados Pessoais", description: "Suas informações" },
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

export const QuotationWizard = () => {
  const [currentStep, setCurrentStep] = React.useState(0);

  // Form state
  const [personType, setPersonType] = React.useState("pf");
  const [cpfCnpj, setCpfCnpj] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const [plate, setPlate] = React.useState("");
  const [isZeroKm, setIsZeroKm] = React.useState(false);
  const [isFinanced, setIsFinanced] = React.useState(false);
  const [vehicleUse, setVehicleUse] = React.useState("personal");

  const [cep, setCep] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [neighborhood, setNeighborhood] = React.useState("");
  const [city, setCity] = React.useState("");

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
          phone.replace(/\D/g, "").length === 11
        );
      case 1:
        return isZeroKm || plate.replace(/[^A-Z0-9]/g, "").length >= 7;
      case 2:
        return (
          cep.replace(/\D/g, "").length === 8 &&
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

  const handleSubmit = () => {
    // Handle form submission
    console.log("Form submitted:", {
      personType,
      cpfCnpj,
      name,
      email,
      phone,
      plate,
      isZeroKm,
      isFinanced,
      vehicleUse,
      cep,
      street,
      number,
      neighborhood,
      city,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Stepper */}
      <Stepper steps={steps} currentStep={currentStep} className="mb-8" />

      {/* Step Content */}
      <div className="min-h-[400px]">
        {/* Step 1: Personal Data */}
        {currentStep === 0 && (
          <FormCard
            title="Dados Pessoais"
            description="Preencha suas informações para a cotação"
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

        {/* Step 2: Vehicle */}
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

              <RadioCardGroup
                label="Uso do Veículo"
                options={[
                  {
                    value: "personal",
                    label: "Particular",
                    description: "Uso pessoal/família",
                  },
                  {
                    value: "work",
                    label: "Trabalho",
                    description: "Ida e volta ao trabalho",
                  },
                  {
                    value: "app",
                    label: "Aplicativo",
                    description: "Uber, 99, etc.",
                  },
                  {
                    value: "commercial",
                    label: "Comercial",
                    description: "Entregas/serviços",
                  },
                ]}
                value={vehicleUse}
                onChange={setVehicleUse}
              />
            </div>
          </FormCard>
        )}

        {/* Step 3: Address */}
        {currentStep === 2 && (
          <FormCard
            title="Endereço"
            description="Onde o veículo pernoita"
          >
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
            </div>
          </FormCard>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
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
            disabled={!isStepValid(currentStep)}
            className="gap-2"
          >
            Enviar Cotação
            <ArrowRight size={18} />
          </Button>
        )}
      </div>
    </div>
  );
};
