import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QuotationWizard } from "@/components/QuotationWizard";
import { Shield } from "lucide-react";

const Cotacao = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-28 sm:pt-32 pb-12 bg-gradient-to-b from-slate-100 via-slate-50 to-white">
        <div className="container">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary mb-4">
              <Shield size={16} />
              <span>Cotação Rápida e Segura</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Solicite sua Cotação
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Preencha o formulário abaixo e receba as melhores ofertas de seguro para você.
            </p>
          </div>

          {/* Wizard Form */}
          <QuotationWizard />

          {/* Trust indicators */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Seus dados estão protegidos por criptografia de ponta a ponta
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cotacao;
