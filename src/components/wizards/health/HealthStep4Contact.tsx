import * as React from "react";
import { Phone, User, Mail, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import type { HealthWizardData } from "../HealthWizard";

interface Props {
  data: HealthWizardData;
  saveData: (data: Partial<HealthWizardData>) => void;
}

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export const HealthStep4Contact: React.FC<Props> = ({ data, saveData }) => {
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isFetchingCep, setIsFetchingCep] = React.useState(false);

  const validations = {
    name: data.name.trim().length >= 3,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email),
    phone: data.phone.replace(/\D/g, '').length >= 10,
    cep: (data as any).cep?.replace(/\D/g, '').length === 8,
    street: ((data as any).street || '').trim().length > 0,
    addressNumber: ((data as any).addressNumber || '').trim().length > 0,
    addressCity: ((data as any).addressCity || '').trim().length > 0,
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const fetchCepData = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    setIsFetchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const result = await res.json();
      if (!result.erro) {
        saveData({
          street: result.logradouro || "",
          addressNeighborhood: result.bairro || "",
          addressCity: result.localidade || "",
          addressState: result.uf || "",
        } as any);
      }
    } catch (e) {
      console.error("Erro ao buscar CEP:", e);
    } finally {
      setIsFetchingCep(false);
    }
  };

  const handleCepChange = (value: string) => {
    const formatted = value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
    saveData({ cep: formatted } as any);
    if (formatted.replace(/\D/g, "").length === 8) {
      fetchCepData(formatted);
    }
  };

  const inputClass = (field: string, isValid: boolean) => `
    w-full h-12 px-4 pr-10 rounded-xl border-2 bg-background
    text-base
    focus:outline-none focus:ring-4 transition-all duration-200
    ${touched[field] && !isValid
      ? 'border-destructive focus:ring-destructive/10'
      : isValid
        ? 'border-success focus:ring-success/10'
        : 'border-input focus:ring-primary/10 focus:border-primary'
    }
  `;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-2">
          <Phone className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          Seus Dados de Contato
        </h2>
        <p className="text-muted-foreground">
          Para enviarmos as melhores opções de planos.
        </p>
      </div>

      {/* Contact Fields */}
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
            <User className="w-4 h-4 text-primary" />
            Nome Completo <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.name}
              onChange={(e) => saveData({ name: e.target.value })}
              onBlur={() => handleBlur('name')}
              placeholder="Seu nome completo"
              className={inputClass('name', validations.name)}
            />
            {validations.name && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
            )}
            {touched.name && !validations.name && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
            )}
          </div>
          {touched.name && !validations.name && (
            <p className="mt-1 text-xs text-destructive">Nome deve ter pelo menos 3 caracteres</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
            <Mail className="w-4 h-4 text-primary" />
            E-mail <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              inputMode="email"
              value={data.email}
              onChange={(e) => saveData({ email: e.target.value })}
              onBlur={() => handleBlur('email')}
              placeholder="seu@email.com"
              className={inputClass('email', validations.email)}
            />
            {validations.email && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
            )}
            {touched.email && !validations.email && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
            )}
          </div>
          {touched.email && !validations.email && (
            <p className="mt-1 text-xs text-destructive">E-mail inválido</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
            <Phone className="w-4 h-4 text-primary" />
            Celular <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              inputMode="tel"
              value={data.phone}
              onChange={(e) => saveData({ phone: formatPhone(e.target.value) })}
              onBlur={() => handleBlur('phone')}
              placeholder="(00) 00000-0000"
              className={inputClass('phone', validations.phone)}
            />
            {validations.phone && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
            )}
            {touched.phone && !validations.phone && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
            )}
          </div>
          {touched.phone && !validations.phone && (
            <p className="mt-1 text-xs text-destructive">Telefone deve ter pelo menos 10 dígitos</p>
          )}
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          Endereço
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            CEP <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={(data as any).cep || ''}
            onChange={(e) => handleCepChange(e.target.value)}
            onBlur={() => handleBlur('cep')}
            placeholder="00000-000"
            className={inputClass('cep', validations.cep)}
          />
          {isFetchingCep && (
            <p className="mt-1 text-xs text-muted-foreground">Buscando endereço...</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Rua <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={(data as any).street || ''}
            onChange={(e) => saveData({ street: e.target.value } as any)}
            placeholder="Nome da rua"
            className={inputClass('street', validations.street)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Número <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={(data as any).addressNumber || ''}
              onChange={(e) => saveData({ addressNumber: e.target.value } as any)}
              placeholder="Nº"
              className={inputClass('addressNumber', validations.addressNumber)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Complemento
            </label>
            <input
              type="text"
              value={(data as any).addressComplement || ''}
              onChange={(e) => saveData({ addressComplement: e.target.value } as any)}
              placeholder="Apto, Bloco"
              className="w-full h-12 px-4 rounded-xl border-2 bg-background text-base focus:outline-none focus:ring-4 transition-all duration-200 border-input focus:ring-primary/10 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Bairro</label>
          <input
            type="text"
            value={(data as any).addressNeighborhood || ''}
            onChange={(e) => saveData({ addressNeighborhood: e.target.value } as any)}
            placeholder="Bairro"
            className="w-full h-12 px-4 rounded-xl border-2 bg-background text-base focus:outline-none focus:ring-4 transition-all duration-200 border-input focus:ring-primary/10 focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Cidade <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={(data as any).addressCity || ''}
              onChange={(e) => saveData({ addressCity: e.target.value } as any)}
              placeholder="Cidade"
              className={inputClass('addressCity', validations.addressCity)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Estado</label>
            <input
              type="text"
              value={(data as any).addressState || ''}
              onChange={(e) => saveData({ addressState: e.target.value } as any)}
              placeholder="UF"
              className="w-full h-12 px-4 rounded-xl border-2 bg-background text-base focus:outline-none focus:ring-4 transition-all duration-200 border-input focus:ring-primary/10 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
        <p className="text-xs text-muted-foreground">
          🔒 Seus dados estão protegidos e não serão compartilhados com terceiros.
        </p>
      </div>
    </div>
  );
};
