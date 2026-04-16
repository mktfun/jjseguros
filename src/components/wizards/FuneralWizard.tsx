import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Stepper, type Step } from "@/components/ui/stepper";
import { FormCard } from "@/components/ui/form-card";
import { FormInput } from "@/components/ui/form-input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Heart, Users, Check } from "lucide-react";
import { toast } from "sonner";
import { sendToRDStation, buildFuneralPayload } from "@/utils/dataProcessor";
import { usePartialLead } from "@/hooks/usePartialLead";
import { LgpdConsent } from "@/components/ui/lgpd-consent";

const steps: Step[] = [
  { id: "holder", title: "Dados Pessoais", description: "Identificação" },
  { id: "family", title: "Plano Familiar", description: "Dependentes e Endereço" },
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
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  // Step 2: Plano e Endereço
  const [hasDependents, setHasDependents] = React.useState<"sim" | "nao">("sim");
  const [dependentType, setDependentType] = React.useState<string>("ambos");
  const [cep, setCep] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const fetchAddressFromCep = React.useCallback(async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
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
    }
    setErrors(newErrors);
  };

  const isStepValid = (step: number) => {
    if (step === 0) {
      return (
        name.trim().length >= 3 &&
        cpf.replace(/\D/g, "").length === 11 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
        phone.replace(/\D/g, "").length === 11
      );
    }
    if (step === 1) {
      return cep.replace(/\D/g, "").length === 8 && city.length > 0;
    }
    return false;
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = buildFuneralPayload({
        name,
        cpf,
        email,
        phone,
        cep,
        city,
        state,
        hasDependents,
        dependentType: hasDependents === "sim" ? dependentType : "Nenhum",
        // Campos removidos enviados como default para não quebrar o dataProcessor
        birthDate: "",
        profession: "",
        street: "",
        number: "",
        neighborhood: "",
        incomeRange: "",
        incomeLabel: "",
        height: "",
        weight: "",
        isSmoker: false,
        dependentsCount: hasDependents === "sim" ? "Sim" : "0",
        observations: ""
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
      toast.error("Erro ao enviar cotação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const DependentOption = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button
      onClick={() => setDependentType(id)}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
        dependentType === id 
          ? "border-red-600 bg-red-50 text-red-600" 
          : "border-border bg-card text-muted-foreground hover:border-red-200"
      }`}
    >
      <Icon className={`w-6 h-6 ${dependentType === id ? "text-red-600" : "text-muted-foreground"}`} />
      <span className="text-xs font-bold uppercase tracking-tighter">{label}</span>
      {dependentType === id && <Check className="w-3 h-3 absolute top-2 right-2" />}
    </button>
  );

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      <div className="flex justify-center mb-6">
         <div className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-red-200 shadow-sm">
           <Heart className="w-3 h-3 fill-current" /> Proteção Familiar Premium
         </div>
      </div>

      <Stepper steps={steps} currentStep={currentStep} className="mb-8" />

      <div className="min-h-[350px]">
        {/* Step 1: Dados do Titular */}
        {currentStep === 0 && (
          <FormCard title="Quem é o Titular?" description="Preencha os dados de quem será o responsável pelo plano">
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
                  required
                />
              </div>

              <FormInput
                label="E-mail Principal"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email", email)}
                error={touched.email ? errors.email : undefined}
                required
              />
            </div>
          </FormCard>
        )}

        {/* Step 2: Plano Familiar */}
        {currentStep === 1 && (
          <FormCard title="Configure seu Plano" description="Informe quem você deseja proteger e sua localização">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                   <Users className="w-4 h-4 text-red-600" /> Possui dependentes?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setHasDependents("sim")}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${hasDependents === "sim" ? "border-red-600 bg-red-600 text-white shadow-md shadow-red-200" : "border-border text-muted-foreground"}`}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setHasDependents("nao")}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${hasDependents === "nao" ? "border-red-600 bg-red-600 text-white shadow-md shadow-red-200" : "border-border text-muted-foreground"}`}
                  >
                    Não
                  </button>
                </div>
              </div>

              {hasDependents === "sim" && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Selecione o parentesco</label>
                  <div className="grid grid-cols-3 gap-3">
                    <DependentOption id="conjugue" label="Cônjuge" icon={Heart} />
                    <DependentOption id="filhos" label="Filhos" icon={Users} />
                    <DependentOption id="ambos" label="Ambos" icon={Check} />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-dashed border-border">
                <FormInput
                  label="Seu CEP"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => {
                    const formatted = formatCEP(e.target.value);
                    setCep(formatted);
                    if (formatted.replace(/\D/g, "").length === 8) {
                      fetchAddressFromCep(formatted);
                    }
                  }}
                  inputMode="numeric"
                  hint={city ? `${city} - ${state}` : "Informe seu CEP para localização"}
                  required
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
          onClick={() => currentStep > 0 ? setCurrentStep(0) : navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft size={18} />
          Voltar
        </Button>

        {currentStep === 0 ? (
          <Button
            variant="cta"
            onClick={nextStep}
            disabled={!isStepValid(0)}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100"
          >
            Próximo Passo
            <ArrowRight size={18} />
          </Button>
        ) : (
          <Button
            variant="cta"
            onClick={handleSubmit}
            disabled={!isStepValid(1) || isSubmitting || !acceptedTerms || !acceptedPrivacy}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100 w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enviando Solicitação...
              </>
            ) : (
              <>
                Solicitar Cotação Familiar
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        )}
      </div>

      <div className="flex items-center justify-center mt-8">
        <p className="text-[10px] text-muted-foreground text-center flex items-center gap-1.5 font-medium uppercase tracking-tight">
          <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Protocolo de Segurança Ativo • Seus dados estão blindados
        </p>
      </div>
    </div>
  );
};
