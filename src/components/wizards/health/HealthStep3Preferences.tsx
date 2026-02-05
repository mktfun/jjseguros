import * as React from "react";
import { Wallet, Building, BedDouble, Percent, MapPin } from "lucide-react";
import type { HealthWizardData } from "../HealthWizard";
import { brazilianStates } from "@/utils/qualification";

interface Props {
  data: HealthWizardData;
  saveData: (data: Partial<HealthWizardData>) => void;
}

const networkOptions = [
  { value: 'einstein', label: 'Albert Einstein' },
  { value: 'sirio', label: 'Sírio-Libanês' },
  { value: 'hcor', label: 'HCor' },
  { value: 'sabara', label: 'Sabará' },
  { value: 'rede_d_or', label: "Rede D'Or" },
  { value: 'unimed', label: 'Rede Unimed' },
  { value: 'bradesco', label: 'Bradesco Saúde' },
  { value: 'amil', label: 'Amil' },
  { value: 'sulamerica', label: 'SulAmérica' },
  { value: 'outro', label: 'Outro / Sem preferência' },
];

export const HealthStep3Preferences: React.FC<Props> = ({ data, saveData }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-2">
          <Wallet className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          Suas Preferências
        </h2>
        <p className="text-muted-foreground">
          Nos ajude a encontrar o plano ideal para você.
        </p>
      </div>

      {/* Budget Slider */}
      <div className="space-y-3">
        <label className="flex items-center justify-between text-sm font-medium text-foreground">
          <span className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            Orçamento mensal por pessoa
          </span>
          <span className="text-primary font-semibold">
            R$ {data.budget.toLocaleString('pt-BR')}
          </span>
        </label>
        
        <div className="relative pt-2 pb-4">
          <input
            type="range"
            min="200"
            max="3000"
            step="50"
            value={data.budget}
            onChange={(e) => saveData({ budget: parseInt(e.target.value) })}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-primary
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>R$ 200</span>
            <span>R$ 3.000</span>
          </div>
        </div>
      </div>

      {/* State Selector */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          Estado (UF)
        </label>
        <select
          value={data.state}
          onChange={(e) => saveData({ state: e.target.value })}
          className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background
            text-base appearance-none cursor-pointer
            focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
            transition-all duration-200"
        >
          <option value="">Selecione seu estado...</option>
          {brazilianStates.map(state => (
            <option key={state.value} value={state.value}>
              {state.label} - {state.value}
            </option>
          ))}
        </select>
      </div>

      {/* Network Preference */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Building className="w-4 h-4 text-primary" />
          Hospital/Rede de preferência
        </label>
        <select
          value={data.networkPreference}
          onChange={(e) => saveData({ networkPreference: e.target.value })}
          className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background
            text-base appearance-none cursor-pointer
            focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
            transition-all duration-200"
        >
          <option value="">Selecione...</option>
          {networkOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Accommodation Type */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <BedDouble className="w-4 h-4 text-primary" />
          Tipo de acomodação
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => saveData({ accommodation: 'enfermaria' })}
            className={`
              flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-200
              ${data.accommodation === 'enfermaria'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <span className="font-medium text-foreground">Enfermaria</span>
            <span className="text-xs text-muted-foreground">Quarto compartilhado</span>
          </button>
          
          <button
            type="button"
            onClick={() => saveData({ accommodation: 'apartamento' })}
            className={`
              flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-200
              ${data.accommodation === 'apartamento'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <span className="font-medium text-foreground">Apartamento</span>
            <span className="text-xs text-muted-foreground">Quarto individual</span>
          </button>
        </div>
      </div>

      {/* Coparticipation Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
        <div className="flex items-center gap-3">
          <Percent className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium text-foreground">Coparticipação</p>
            <p className="text-xs text-muted-foreground">
              Pague parte dos procedimentos e tenha desconto na mensalidade
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => saveData({ coparticipation: !data.coparticipation })}
          className={`
            relative w-14 h-8 rounded-full transition-all duration-300
            ${data.coparticipation ? 'bg-primary' : 'bg-muted'}
          `}
        >
          <span
            className={`
              absolute top-1 w-6 h-6 rounded-full bg-white shadow-md
              transition-all duration-300
              ${data.coparticipation ? 'left-7' : 'left-1'}
            `}
          />
        </button>
      </div>
    </div>
  );
};
