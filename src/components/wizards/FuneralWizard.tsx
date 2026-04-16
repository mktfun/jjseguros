import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Stepper, type Step } from "@/components/ui/stepper";
import { FormCard } from "@/components/ui/form-card";
import { FormInput } from "@/components/ui/form-input";
import { RadioCardGroup } from "@/components/ui/radio-card";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendToRDStation, buildFuneralPayload } from "@/utils/dataProcessor";
import { usePartialLead } from "@/hooks/usePartialLead";
import { LgpdConsent } from "@/components/ui/lgpd-consent";

const steps: Step[] = [
  { id: "holder", title: "Dados do Titular", description: "Informações pessoais" },
  { id: "profile", title: "Perfil", description: "Endereço e renda" },
  { id: "health", title: "Saúde e Cobertura", description: "Dados complementares" },
];

const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
};

const incomeOptions = [
  { value: "1-3", label: "R$ 1.000 - R$ 3.000" },
  { value: "3-5", label: "R$ 3.000 - R$ 5.000" },
  { value: "5-10", label: "R$ 5.000 - R$ 10.000" },
  { value: "10+", label: "Acima de R$ 10.000" },
];

const incomeLabels: Record<string, string> = {
  "1-3": "R$ 1.000 - R$ 3.000",
  "3-5": "R$ 3.000 - R$ 5.000",
  "5-10": "R$ 5.000 - R$ 10.000",
  "10+": "Acima de R$ 10.000",
};

export const FuneralWizard = () => {
  const navigate = useNavigate();
  const { savePartialLead, updateStepIndex, getLeadId } = usePartialLead();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // LGPD
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = React.useState(false);

  // Step 1: Dados do Titular
  const [name, setName] = React.useState("");
  const [cpf, setCpf] = React.useState("");
  const [birthDate, setBirthDate] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  // Step 2: Perfil
  const [profession, setProfession] = React.useState("");
  const [cep, setCep] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [complement, setComplement] = React.useState("");
  const [neighborhood, setNeighborhood] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [incomeRange, setIncomeRange] = React.useState("3-5");

  // Step 3: Saúde e Cobertura
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [isSmoker, setIsSmoker] = React.useState(false);
  const [dependentsCount, setDependentsCount] = React.useState("");
  const [observations, setObservations] = React.useState("");

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  // CEP auto-fill
  const fetchAddressFromCep = React.useCallback(async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  }, []);

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = { ...errors };

    switch (field) {
      case "cpf":
        if (value.replace(/\D/g, "").length !== 11) {
          newErrors.cpf = "CPF deve ter 11 dígitos";
        } else {
          delete newErrors.cpf;
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
      case "cep":
        if (value.replace(/\D/g, "").length !== 8) {
          newErrors.cep = "CEP deve ter 8 dígitos";
        } else {
          delete newErrors.cep;
        }
        break;
    }

    setErrors(newErrors);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return (
          name.trim().length >= 3 &&
          cpf.replace(/\D/g, "").length === 11 &&
          birthDate.length > 0 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
          phone.replace(/\D/g, "").length === 11
        );
      case 1:
        return (
          profession.trim().length > 0 &&
          cep.replace(/\D/g, "").length === 8 &&
          street.trim().length > 0 &&
          number.trim().length > 0 &&
          neighborhood.trim().length > 0 &&
          city.trim().length > 0 &&
          incomeRange.length > 0
        );
      case 2:
        return height.trim().length > 0 && weight.trim().length > 0 && dependentsCount.trim().length > 0;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    if (currentStep < steps.length - 1 && isStepValid(currentStep)) {
      if (currentStep === 0 && !getLeadId()) {
        await savePartialLead({
          name,
          email,
          phone,
          cpf,
          insuranceType: "Assistencia Funeral Familiar",
          stepIndex: 1,
        });
      } else if (getLeadId()) {
        await updateStepIndex(currentStep + 1);
      }
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
      const payload = buildFuneralPayload({
        name,
        cpf,
        birthDate,
        email,
        phone,
        profession,
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        incomeRange,
        incomeLabel: incomeLabels[incomeRange] || incomeRange,
        height,
        weight,
        isSmoker,
        dependentsCount,
        observations,
      });

      const leadId = getLeadId();
      const success = await sendToRDStation(payload, leadId);

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
        {/* Step 1: Dados do Titular */}
        {currentStep === 0 && (
          <FormCard title="Dados do Titular" description="Informações do titular do plano">
            <div className="space-y-5">
              <FormInput
                label="Nome Completo"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  onBlur={() => handleBlur("cpf", cpf)}
                  inputMode="numeric"
                  error={touched.cpf ? errors.cpf : undefined}
                  success={touched.cpf && !errors.cpf && cpf.length > 0}
                  required
                />
                <FormInput
                  label="Data de Nascimento"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email", email)}
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
            </div>
          </FormCard>
        )}

        {/* Step 2: Perfil */}
        {currentStep === 1 && (
          <FormCard title="Perfil do Titular" description="Profissão, endereço e renda">
            <div className="space-y-5">
              <FormInput
                label="Profissão"
                placeholder="Ex: Engenheiro, Médico, Autônomo"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                required
              />

              <FormInput
                label="CEP"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => {
                  const formatted = formatCEP(e.target.value);
                  setCep(formatted);
                  if (formatted.replace(/\D/g, "").length === 8) {
                    fetchAddressFromCep(formatted);
                  }
                }}
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

              <RadioCardGroup
                label="Faixa de Renda Mensal"
                options={incomeOptions}
                value={incomeRange}
                onChange={setIncomeRange}
              />
            </div>
          </FormCard>
        )}

        {/* Step 3: Saúde e Cobertura */}
        {currentStep === 2 && (
          <FormCard title="Saúde e Cobertura" description="Dados complementares para o plano">
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Altura (cm)"
                  placeholder="Ex: 175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  hint="Informe em centímetros"
                  required
                />
                <FormInput
                  label="Peso (kg)"
                  placeholder="Ex: 80"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  hint="Informe em quilogramas"
                  required
                />
              </div>

              <FormInput
                label="Quantidade de dependentes"
                placeholder="Ex: 3"
                value={dependentsCount}
                onChange={(e) => setDependentsCount(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                hint="Quantas pessoas deseja incluir no plano?"
                required
              />

              <ToggleSwitch
                label="É Fumante?"
                description="Você fuma ou fumou nos últimos 2 anos?"
                checked={isSmoker}
                onCheckedChange={setIsSmoker}
              />


              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Observações Adicionais
                </label>
                <Textarea
                  placeholder="Informações complementares (opcional)"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </FormCard>
        )}
      </div>

      {currentStep === steps.length - 1 && (
        <div className="mt-6">
          <LgpdConsent
            acceptedTerms={acceptedTerms}
            acceptedPrivacy={acceptedPrivacy}
            onAcceptTermsChange={setAcceptedTerms}
            onAcceptPrivacyChange={setAcceptedPrivacy}
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
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
            disabled={!isStepValid(currentStep) || isSubmitting || !acceptedTerms || !acceptedPrivacy}
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

      <div className="flex items-center justify-center mt-6 mb-4">
        <p className="text-xs text-muted-foreground text-center flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-success" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Seus dados estão seguros e não serão compartilhados com terceiros.
        </p>
      </div>
    </div>
  );
};
