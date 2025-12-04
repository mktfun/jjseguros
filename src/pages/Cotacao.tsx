import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QuotationWizard } from "@/components/QuotationWizard";
import { Shield } from "lucide-react";

const Cotacao = () => {
  return (
    <div className="min-h-screen flex flex-col mesh-gradient-page">
      <Header />
      <main className="flex-1 py-8 sm:py-12">
        <div className="container">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground mb-4">
              <Shield size={16} className="text-secondary" />
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
            <p className="text-xs text-muted-foreground">
              🔒 Seus dados estão protegidos por criptografia de ponta a ponta
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cotacao;
