import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Stepper, type Step } from "@/components/ui/stepper";
import { FormCard } from "@/components/ui/form-card";
import { FormInput } from "@/components/ui/form-input";
import { RadioCardGroup } from "@/components/ui/radio-card";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Home, Building2 } from "lucide-react";

const steps: Step[] = [
  { id: "property", title: "Tipo de Imóvel", description: "Características" },
  { id: "address", title: "Endereço", description: "Localização" },
  { id: "coverage", title: "Cobertura", description: "Valores e opções" },
];

const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
};

const formatCurrency = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  const amount = parseInt(numbers || "0", 10) / 100;
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const ResidentialWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(0);

  // Step 1: Property Type
  const [propertyType, setPropertyType] = React.useState("house");
  const [ownershipType, setOwnershipType] = React.useState("owner");
  const [hasAlarm, setHasAlarm] = React.useState(false);
  const [hasGatedCommunity, setHasGatedCommunity] = React.useState(false);

  // Step 2: Address
  const [cep, setCep] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [complement, setComplement] = React.useState("");
  const [neighborhood, setNeighborhood] = React.useState("");
  const [city, setCity] = React.useState("");

  // Step 3: Coverage
  const [propertyValue, setPropertyValue] = React.useState("");
  const [contentsValue, setContentsValue] = React.useState("");
  const [wantTheftCoverage, setWantTheftCoverage] = React.useState(true);
  const [wantElectricalDamage, setWantElectricalDamage] = React.useState(true);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = { ...errors };

    if (field === "cep" && value.replace(/\D/g, "").length !== 8) {
      newErrors.cep = "CEP deve ter 8 dígitos";
    } else {
      delete newErrors.cep;
    }

    setErrors(newErrors);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return propertyType && ownershipType;
      case 1:
        return (
          cep.replace(/\D/g, "").length === 8 &&
          street.trim().length > 0 &&
          number.trim().length > 0 &&
          neighborhood.trim().length > 0 &&
          city.trim().length > 0
        );
      case 2:
        return propertyValue.length > 0;
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
    console.log("Residential form submitted:", {
      propertyType,
      ownershipType,
      hasAlarm,
      hasGatedCommunity,
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      propertyValue,
      contentsValue,
      wantTheftCoverage,
      wantElectricalDamage,
    });
    navigate("/sucesso");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Stepper steps={steps} currentStep={currentStep} className="mb-8" />

      <div className="min-h-[400px]">
        {currentStep === 0 && (
          <FormCard
            title="Tipo de Imóvel"
            description="Informe as características do imóvel"
          >
            <div className="space-y-5">
              <RadioCardGroup
                label="Tipo de Residência"
                options={[
                  { value: "house", label: "Casa", icon: <Home size={24} /> },
                  { value: "apartment", label: "Apartamento", icon: <Building2 size={24} /> },
                ]}
                value={propertyType}
                onChange={setPropertyType}
              />

              <RadioCardGroup
                label="Você é"
                options={[
                  { value: "owner", label: "Proprietário", description: "Dono do imóvel" },
                  { value: "tenant", label: "Inquilino", description: "Aluga o imóvel" },
                ]}
                value={ownershipType}
                onChange={setOwnershipType}
              />

              <ToggleSwitch
                label="Sistema de Alarme"
                description="O imóvel possui alarme monitorado?"
                checked={hasAlarm}
                onCheckedChange={setHasAlarm}
              />

              <ToggleSwitch
                label="Condomínio Fechado"
                description="O imóvel está em condomínio com portaria?"
                checked={hasGatedCommunity}
                onCheckedChange={setHasGatedCommunity}
              />
            </div>
          </FormCard>
        )}

        {currentStep === 1 && (
          <FormCard title="Endereço do Imóvel" description="Localização da residência">
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

              <FormInput
                label="Complemento"
                placeholder="Apto, bloco, etc. (opcional)"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
              />

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

        {currentStep === 2 && (
          <FormCard
            title="Cobertura Desejada"
            description="Valores e coberturas adicionais"
          >
            <div className="space-y-5">
              <FormInput
                label="Valor do Imóvel"
                placeholder="R$ 0,00"
                value={propertyValue}
                onChange={(e) => setPropertyValue(formatCurrency(e.target.value))}
                inputMode="numeric"
                hint="Valor estimado de reconstrução do imóvel"
                required
              />

              <FormInput
                label="Valor dos Conteúdos"
                placeholder="R$ 0,00"
                value={contentsValue}
                onChange={(e) => setContentsValue(formatCurrency(e.target.value))}
                inputMode="numeric"
                hint="Móveis, eletrodomésticos, eletrônicos, etc."
              />

              <ToggleSwitch
                label="Cobertura contra Roubo/Furto"
                description="Proteção para bens dentro do imóvel"
                checked={wantTheftCoverage}
                onCheckedChange={setWantTheftCoverage}
              />

              <ToggleSwitch
                label="Danos Elétricos"
                description="Cobertura para equipamentos danificados por oscilação elétrica"
                checked={wantElectricalDamage}
                onCheckedChange={setWantElectricalDamage}
              />
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
