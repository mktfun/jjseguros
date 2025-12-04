import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Stepper, type Step } from "@/components/ui/stepper";
import { FormCard } from "@/components/ui/form-card";
import { FormInput } from "@/components/ui/form-input";
import { RadioCardGroup } from "@/components/ui/radio-card";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendToRDStation, buildHealthPayload } from "@/utils/dataProcessor";

const steps: Step[] = [
  { id: "holder", title: "Titular", description: "Seus dados" },
  { id: "dependents", title: "Dependentes", description: "Quem mais?" },
  { id: "preferences", title: "Preferências", description: "Tipo de plano" },
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

interface Dependent {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  relationship: string;
}

export const HealthWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Step 1: Holder Data
  const [name, setName] = React.useState("");
  const [cpf, setCpf] = React.useState("");
  const [birthDate, setBirthDate] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");

  // Step 2: Dependents
  const [hasDependents, setHasDependents] = React.useState(false);
  const [dependents, setDependents] = React.useState<Dependent[]>([]);

  // Step 3: Preferences
  const [planType, setPlanType] = React.useState("individual");
  const [coverageType, setCoverageType] = React.useState("complete");
  const [wantDental, setWantDental] = React.useState(true);
  const [preferredHospital, setPreferredHospital] = React.useState("");

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

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

  const addDependent = () => {
    setDependents([
      ...dependents,
      { id: Date.now().toString(), name: "", cpf: "", birthDate: "", relationship: "spouse" },
    ]);
  };

  const removeDependent = (id: string) => {
    setDependents(dependents.filter((d) => d.id !== id));
  };

  const updateDependent = (id: string, field: keyof Dependent, value: string) => {
    setDependents(
      dependents.map((d) =>
        d.id === id
          ? { ...d, [field]: field === "cpf" ? formatCPF(value) : value }
          : d
      )
    );
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return (
          name.trim().length >= 3 &&
          cpf.replace(/\D/g, "").length === 11 &&
          birthDate.length > 0 &&
          phone.replace(/\D/g, "").length === 11 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        );
      case 1:
        if (!hasDependents) return true;
        return dependents.every(
          (d) =>
            d.name.trim().length >= 3 &&
            d.cpf.replace(/\D/g, "").length === 11 &&
            d.birthDate.length > 0
        );
      case 2:
        return planType && coverageType;
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
      const payload = buildHealthPayload(
        {
          fullName: name,
          email,
          phone,
          cpf,
          birthDate,
          planType,
          accommodation: coverageType,
          coparticipation: false,
          hasCurrentPlan: false,
          currentProvider: preferredHospital,
        },
        dependents.map(d => ({
          name: d.name,
          relationship: d.relationship,
        }))
      );

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
    <div className="w-full max-w-2xl mx-auto">
      <Stepper steps={steps} currentStep={currentStep} className="mb-8" />

      <div className="min-h-[400px]">
        {currentStep === 0 && (
          <FormCard
            title="Dados do Titular"
            description="Informações do responsável pelo plano"
          >
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
              </div>
            </div>
          </FormCard>
        )}

        {currentStep === 1 && (
          <FormCard
            title="Dependentes"
            description="Adicione familiares ao plano"
          >
            <div className="space-y-5">
              <ToggleSwitch
                label="Incluir dependentes?"
                description="Cônjuge, filhos ou outros familiares"
                checked={hasDependents}
                onCheckedChange={(checked) => {
                  setHasDependents(checked);
                  if (checked && dependents.length === 0) {
                    addDependent();
                  }
                }}
              />

              {hasDependents && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Dependentes ({dependents.length})
                    </label>
                    <Button
                      type="button"
                      variant="outline-subtle"
                      size="sm"
                      onClick={addDependent}
                      className="gap-1"
                    >
                      <Plus size={16} />
                      Adicionar
                    </Button>
                  </div>

                  {dependents.map((dependent, index) => (
                    <div
                      key={dependent.id}
                      className="p-4 rounded-xl border border-border bg-muted/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          Dependente {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDependent(dependent.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      <FormInput
                        label="Nome Completo"
                        placeholder="Nome do dependente"
                        value={dependent.name}
                        onChange={(e) => updateDependent(dependent.id, "name", e.target.value)}
                        required
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormInput
                          label="CPF"
                          placeholder="000.000.000-00"
                          value={dependent.cpf}
                          onChange={(e) => updateDependent(dependent.id, "cpf", e.target.value)}
                          inputMode="numeric"
                          required
                        />
                        <FormInput
                          label="Data de Nascimento"
                          type="date"
                          value={dependent.birthDate}
                          onChange={(e) => updateDependent(dependent.id, "birthDate", e.target.value)}
                          required
                        />
                      </div>

                      <RadioCardGroup
                        label="Parentesco"
                        options={[
                          { value: "spouse", label: "Cônjuge" },
                          { value: "child", label: "Filho(a)" },
                          { value: "parent", label: "Pai/Mãe" },
                          { value: "other", label: "Outro" },
                        ]}
                        value={dependent.relationship}
                        onChange={(val) => updateDependent(dependent.id, "relationship", val)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormCard>
        )}

        {currentStep === 2 && (
          <FormCard
            title="Preferências do Plano"
            description="Escolha o tipo de cobertura"
          >
            <div className="space-y-5">
              <RadioCardGroup
                label="Tipo de Plano"
                options={[
                  { value: "individual", label: "Individual", description: "Apenas para você" },
                  { value: "family", label: "Familiar", description: "Para toda a família" },
                ]}
                value={planType}
                onChange={setPlanType}
              />

              <RadioCardGroup
                label="Cobertura"
                options={[
                  { value: "ambulatory", label: "Ambulatorial", description: "Consultas e exames" },
                  { value: "hospitalar", label: "Hospitalar", description: "Internações" },
                  { value: "complete", label: "Completo", description: "Ambulatorial + Hospitalar" },
                ]}
                value={coverageType}
                onChange={setCoverageType}
                columns={3}
              />

              <ToggleSwitch
                label="Incluir cobertura odontológica?"
                description="Consultas, limpezas e procedimentos dentários"
                checked={wantDental}
                onCheckedChange={setWantDental}
              />

              <FormInput
                label="Hospital/Clínica de Preferência"
                placeholder="Ex: Hospital Albert Einstein (opcional)"
                value={preferredHospital}
                onChange={(e) => setPreferredHospital(e.target.value)}
                hint="Caso tenha preferência por alguma rede credenciada"
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
