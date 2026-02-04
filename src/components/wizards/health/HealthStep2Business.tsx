import * as React from "react";
import { Building2, User, Loader2, CheckCircle2 } from "lucide-react";
import type { HealthWizardData } from "../HealthWizard";
import { formatCNPJ, isValidCNPJ } from "@/utils/cnpjApi";

interface Props {
  data: HealthWizardData;
  saveData: (data: Partial<HealthWizardData>) => void;
  isFetchingCNPJ: boolean;
  onCNPJBlur: () => void;
}

const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const educationLevels = [
  { value: 'fundamental', label: 'Ensino Fundamental' },
  { value: 'medio', label: 'Ensino Médio' },
  { value: 'superior', label: 'Ensino Superior' },
  { value: 'pos', label: 'Pós-graduação' },
  { value: 'mestrado', label: 'Mestrado/Doutorado' },
];

export const HealthStep2Business: React.FC<Props> = ({ 
  data, 
  saveData, 
  isFetchingCNPJ, 
  onCNPJBlur 
}) => {
  const isValidCPF = data.cpf.replace(/\D/g, '').length === 11;
  const cnpjValid = isValidCNPJ(data.cnpj);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-2">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          Tipo de Contratação
        </h2>
        <p className="text-muted-foreground">
          Escolha como deseja contratar o plano de saúde.
        </p>
      </div>

      {/* Contract Type Toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => saveData({ contractType: 'cpf' })}
          className={`
            flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200
            ${data.contractType === 'cpf'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border hover:border-primary/50 text-muted-foreground'
            }
          `}
        >
          <User className="w-6 h-6" />
          <span className="font-medium">Pessoa Física</span>
          <span className="text-xs opacity-70">CPF individual</span>
        </button>

        <button
          type="button"
          onClick={() => saveData({ contractType: 'cnpj' })}
          className={`
            flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200
            ${data.contractType === 'cnpj'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border hover:border-primary/50 text-muted-foreground'
            }
          `}
        >
          <Building2 className="w-6 h-6" />
          <span className="font-medium">Pessoa Jurídica</span>
          <span className="text-xs opacity-70">CNPJ empresarial</span>
        </button>
      </div>

      {/* CPF Form */}
      {data.contractType === 'cpf' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              CPF <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={data.cpf}
                onChange={(e) => saveData({ cpf: formatCPF(e.target.value) })}
                placeholder="000.000.000-00"
                className={`
                  w-full h-12 px-4 rounded-xl border-2 bg-background
                  font-mono text-base tracking-wide
                  focus:outline-none focus:ring-4 transition-all duration-200
                  ${isValidCPF
                    ? 'border-success focus:ring-success/10 focus:border-success'
                    : 'border-input focus:ring-primary/10 focus:border-primary'
                  }
                `}
              />
              {isValidCPF && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
              )}
            </div>
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nível de Escolaridade
            </label>
            <select
              value={data.educationLevel}
              onChange={(e) => saveData({ educationLevel: e.target.value })}
              className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background
                text-base appearance-none cursor-pointer
                focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
                transition-all duration-200"
            >
              <option value="">Selecione...</option>
              {educationLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Algumas categorias profissionais têm acesso a planos diferenciados.
            </p>
          </div>

          {/* Profession */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Profissão
            </label>
            <input
              type="text"
              value={data.profession}
              onChange={(e) => saveData({ profession: e.target.value })}
              placeholder="Ex: Engenheiro, Médico, Advogado..."
              className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background
                text-base
                focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
                transition-all duration-200"
            />
          </div>
        </div>
      )}

      {/* CNPJ Form */}
      {data.contractType === 'cnpj' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              CNPJ <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={data.cnpj}
                onChange={(e) => saveData({ cnpj: formatCNPJ(e.target.value) })}
                onBlur={onCNPJBlur}
                placeholder="00.000.000/0000-00"
                className={`
                  w-full h-12 px-4 pr-10 rounded-xl border-2 bg-background
                  font-mono text-base tracking-wide
                  focus:outline-none focus:ring-4 transition-all duration-200
                  ${cnpjValid && data.razaoSocial
                    ? 'border-success focus:ring-success/10 focus:border-success'
                    : 'border-input focus:ring-primary/10 focus:border-primary'
                  }
                `}
              />
              {isFetchingCNPJ && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
              )}
              {!isFetchingCNPJ && cnpjValid && data.razaoSocial && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
              )}
            </div>
          </div>

          {/* Razão Social (preenchida automaticamente) */}
          {data.razaoSocial && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Razão Social
              </label>
              <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                <p className="text-sm font-medium text-foreground">{data.razaoSocial}</p>
              </div>
            </div>
          )}

          {/* Employee Count */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Número de Funcionários
            </label>
            <input
              type="number"
              inputMode="numeric"
              min="2"
              value={data.employeeCount || ''}
              onChange={(e) => saveData({ employeeCount: parseInt(e.target.value) || 0 })}
              placeholder="Mínimo 2 vidas"
              className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background
                text-base
                focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
                transition-all duration-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
