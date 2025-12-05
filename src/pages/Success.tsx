import { motion } from "framer-motion";
import { CheckCircle, Search, Phone, Shield, ArrowRight, Star, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    title: "Análise de Perfil",
    description: "Cruzamos seus dados com +15 seguradoras parceiras.",
  },
  {
    icon: Phone,
    title: "Contato",
    description: "Um consultor entrará em contato via WhatsApp ou Ligação.",
  },
  {
    icon: Shield,
    title: "Proteção Ativa",
    description: "Você escolhe a melhor proposta e ativa o seguro.",
  },
];

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-lg w-full text-center">
          {/* Animated Success Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
            className="mb-6 md:mb-8 inline-flex"
          >
            <div className="relative">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-success/10 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.3,
                  }}
                >
                  <CheckCircle className="w-10 h-10 md:w-16 md:h-16 text-success" strokeWidth={1.5} />
                </motion.div>
              </div>
              {/* Pulse ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                className="absolute inset-0 w-16 h-16 md:w-24 md:h-24 rounded-full bg-success/20"
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-4xl font-bold text-primary mb-3 md:mb-4"
          >
            Solicitação Recebida com Sucesso!
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12 max-w-md mx-auto px-2"
          >
            Obrigado pela confiança. Nossa equipe de especialistas já recebeu seus dados e iniciou a cotação nas melhores seguradoras.
          </motion.p>

          {/* Timeline Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card border border-border rounded-2xl p-5 md:p-8 mb-8 md:mb-10"
          >
            <h2 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6 text-left">
              Próximos Passos
            </h2>
            <div className="space-y-4 md:space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 md:gap-4 text-left"
                >
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <step.icon className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-0.5 md:mb-1 text-sm md:text-base">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-3"
          >
            {/* Primary CTA */}
            <Button
              variant="cta"
              size="xl"
              onClick={() => navigate("/seguros")}
              className="w-full gap-2"
            >
              Cotar Outro Seguro
              <ArrowRight className="w-5 h-5" />
            </Button>

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open("https://g.page/r/CYW0VPBkOz0ZEBM/review", "_blank")}
                className="w-full sm:flex-1 gap-2"
              >
                <Star className="w-4 h-4" />
                Avaliar a JJ & Amorim
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => window.open("https://jjamorimseguros.com.br", "_blank")}
                className="w-full sm:flex-1 gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Site Institucional
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Success;
