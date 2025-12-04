import { Car, Home, Heart, Building2, Plane, Users } from "lucide-react";

const insuranceTypes = [
  {
    icon: Car,
    title: "Auto",
    description: "Proteção completa para seu veículo",
  },
  {
    icon: Home,
    title: "Residencial",
    description: "Segurança para sua casa e bens",
  },
  {
    icon: Heart,
    title: "Vida",
    description: "Tranquilidade para sua família",
  },
  {
    icon: Building2,
    title: "Empresarial",
    description: "Proteja seu negócio",
  },
  {
    icon: Plane,
    title: "Viagem",
    description: "Viaje com segurança",
  },
  {
    icon: Users,
    title: "Saúde",
    description: "Cuidado quando precisar",
  },
];

export const InsuranceTypes = () => {
  return (
    <section className="bg-muted/50 py-16 sm:py-20">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Nossos Seguros
          </h2>
          <p className="text-muted-foreground">
            Soluções completas para todas as suas necessidades de proteção
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
          {insuranceTypes.map((insurance, index) => (
            <div
              key={index}
              className="group flex flex-col items-center rounded-lg bg-card p-6 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent transition-colors group-hover:bg-secondary/10">
                <insurance.icon 
                  size={28} 
                  className="text-secondary transition-transform group-hover:scale-110" 
                />
              </div>
              <h3 className="mb-1 text-base font-semibold text-foreground">
                {insurance.title}
              </h3>
              <p className="text-center text-xs text-muted-foreground">
                {insurance.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
