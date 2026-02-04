import * as React from "react";
import { Gift, Car, Heart, Calendar } from "lucide-react";
import type { HealthWizardData } from "../HealthWizard";

interface Props {
  data: HealthWizardData;
  saveData: (data: Partial<HealthWizardData>) => void;
}

export const HealthStep5CrossSell: React.FC<Props> = ({ data, saveData }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-2">
          <Gift className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          Descontos Exclusivos
        </h2>
        <p className="text-muted-foreground">
          Combine seguros e economize ainda mais!
        </p>
      </div>

      {/* Cross-sell Toggle */}
      <div 
        className={`
          p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300
          ${data.wantsCrossSell 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
          }
        `}
        onClick={() => saveData({ wantsCrossSell: !data.wantsCrossSell })}
      >
        <div className="flex items-start gap-4">
          <div className={`
            flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
            transition-all duration-200
            ${data.wantsCrossSell 
              ? 'border-primary bg-primary' 
              : 'border-muted-foreground'
            }
          `}>
            {data.wantsCrossSell && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              Quero aproveitar descontos combinados
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Economize até <span className="text-primary font-semibold">15%</span> combinando 
              seu Plano de Saúde com Seguro Auto ou Vida.
            </p>
          </div>
        </div>
      </div>

      {/* Cross-sell Options (when enabled) */}
      {data.wantsCrossSell && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-medium text-foreground">
            Informe as datas de vencimento dos seus seguros atuais:
          </p>

          {/* Auto Insurance */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">
                Seguro Auto
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={data.currentAutoExpiry}
                  onChange={(e) => saveData({ currentAutoExpiry: e.target.value })}
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background
                    text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                    transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Life Insurance */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">
                Seguro de Vida
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={data.currentLifeExpiry}
                  onChange={(e) => saveData({ currentLifeExpiry: e.target.value })}
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background
                    text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                    transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Deixe em branco se não tiver seguro ativo.
          </p>
        </div>
      )}

      {/* Skip Note */}
      {!data.wantsCrossSell && (
        <div className="text-center p-4 rounded-xl bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Sem problemas! Você pode aproveitar essa oferta depois. 
            Clique em "Enviar Cotação" para finalizar.
          </p>
        </div>
      )}
    </div>
  );
};
