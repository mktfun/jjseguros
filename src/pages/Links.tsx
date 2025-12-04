import { useState } from "react";
import { Copy, Check, Car, Home, Heart, Building2, Plane, Stethoscope, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const insuranceLinks = [
  {
    type: "auto",
    name: "Seguro Auto",
    icon: Car,
    color: "from-blue-500 to-blue-600",
  },
  {
    type: "residencial",
    name: "Seguro Residencial",
    icon: Home,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    type: "vida",
    name: "Seguro de Vida",
    icon: Heart,
    color: "from-rose-500 to-rose-600",
  },
  {
    type: "empresarial",
    name: "Seguro Empresarial",
    icon: Building2,
    color: "from-amber-500 to-amber-600",
  },
  {
    type: "viagem",
    name: "Seguro Viagem",
    icon: Plane,
    color: "from-sky-500 to-sky-600",
  },
  {
    type: "saude",
    name: "Plano de Saúde",
    icon: Stethoscope,
    color: "from-violet-500 to-violet-600",
  },
];

const Links = () => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const baseUrl = window.location.origin;

  const copyToClipboard = async (type: string, name: string) => {
    const url = `${baseUrl}/cotacao?type=${type}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedType(type);
      toast.success(`Link de ${name} copiado!`);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      toast.error("Erro ao copiar link");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Link2 className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Links de Cotação</h1>
          </div>
          <p className="text-primary-foreground/80">
            Copie e envie os links diretamente para seus clientes via WhatsApp
          </p>
        </div>
      </div>

      {/* Links Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insuranceLinks.map((link) => {
            const Icon = link.icon;
            const isCopied = copiedType === link.type;
            const fullUrl = `${baseUrl}/cotacao?type=${link.type}`;

            return (
              <div
                key={link.type}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${link.color} text-white shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1">{link.name}</h3>
                    <p className="text-xs text-muted-foreground truncate mb-3" title={fullUrl}>
                      {fullUrl}
                    </p>
                    <Button
                      onClick={() => copyToClipboard(link.type, link.name)}
                      variant={isCopied ? "default" : "outline"}
                      size="sm"
                      className="w-full gap-2"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar Link
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Copy All Section */}
        <div className="mt-8 bg-muted/50 rounded-xl p-6 border border-border">
          <h3 className="font-semibold text-foreground mb-4">Mensagem Pronta para WhatsApp</h3>
          <div className="bg-background rounded-lg p-4 text-sm text-muted-foreground font-mono whitespace-pre-line border">
{`Olá! 👋

Seguem os links para fazer sua cotação online:

🚗 Seguro Auto: ${baseUrl}/cotacao?type=auto
🏠 Seguro Residencial: ${baseUrl}/cotacao?type=residencial
❤️ Seguro de Vida: ${baseUrl}/cotacao?type=vida
🏢 Seguro Empresarial: ${baseUrl}/cotacao?type=empresarial
✈️ Seguro Viagem: ${baseUrl}/cotacao?type=viagem
🏥 Plano de Saúde: ${baseUrl}/cotacao?type=saude

É rápido e fácil! Qualquer dúvida estou à disposição.`}
          </div>
          <Button
            onClick={async () => {
              const message = `Olá! 👋

Seguem os links para fazer sua cotação online:

🚗 Seguro Auto: ${baseUrl}/cotacao?type=auto
🏠 Seguro Residencial: ${baseUrl}/cotacao?type=residencial
❤️ Seguro de Vida: ${baseUrl}/cotacao?type=vida
🏢 Seguro Empresarial: ${baseUrl}/cotacao?type=empresarial
✈️ Seguro Viagem: ${baseUrl}/cotacao?type=viagem
🏥 Plano de Saúde: ${baseUrl}/cotacao?type=saude

É rápido e fácil! Qualquer dúvida estou à disposição.`;
              await navigator.clipboard.writeText(message);
              toast.success("Mensagem copiada!");
            }}
            className="mt-4 gap-2"
          >
            <Copy className="w-4 h-4" />
            Copiar Mensagem Completa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Links;
