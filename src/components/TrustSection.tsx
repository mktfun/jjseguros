import { Shield, Clock, Award, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Segurança Garantida",
    description: "Seus dados protegidos com criptografia de ponta a ponta",
  },
  {
    icon: Clock,
    title: "Resposta Rápida",
    description: "Cotações em até 24 horas úteis",
  },
  {
    icon: Award,
    title: "Parceiros Premium",
    description: "Trabalhamos com as melhores seguradoras do mercado",
  },
  {
    icon: Headphones,
    title: "Suporte Dedicado",
    description: "Atendimento humanizado do início ao fim",
  },
];

export const TrustSection = () => {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Por que escolher a Corretora JJ?
          </h2>
          <p className="text-muted-foreground">
            Mais de uma década de experiência protegendo famílias e empresas
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-secondary/30 hover:shadow-card"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <feature.icon size={24} className="text-secondary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
