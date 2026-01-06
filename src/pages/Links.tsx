import { useState } from "react";
import { Copy, Check, Car, Home, Heart, Building2, Plane, Stethoscope, Link2, MessageCircle, RefreshCw, PlusCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type DealMode = "novo" | "renovacao";

const insuranceLinks = [
  {
    type: "auto",
    name: "Seguro Auto",
    icon: Car,
    color: "from-blue-500 to-blue-600",
    emoji: "🚗",
    hasDealType: true,
    messages: {
      novo: "Olá! 👋\n\nPara fazer a cotação do seu *Seguro Auto Novo* é bem simples!\n\nÉ só acessar o link abaixo e preencher os dados do veículo:\n\n🚗 {link}\n\nLeva menos de 2 minutos! Qualquer dúvida estou à disposição.",
      renovacao: "Olá! 👋\n\nPara fazer a *Renovação do seu Seguro Auto* conosco é bem simples!\n\nÉ só acessar o link abaixo e preencher os dados:\n\n🔄 {link}\n\nLeva menos de 2 minutos! Qualquer dúvida estou à disposição.",
    },
  },
  {
    type: "uber",
    name: "Seguro Uber/Similares",
    icon: Smartphone,
    color: "from-violet-500 to-violet-600",
    emoji: "📱",
    hasDealType: true,
    messages: {
      novo: "Olá! 👋\n\nPara fazer a cotação do seu *Seguro Uber/App Novo* é bem simples!\n\nÉ só acessar o link abaixo e preencher os dados do veículo:\n\n📱 {link}\n\nLeva menos de 2 minutos! Qualquer dúvida estou à disposição.",
      renovacao: "Olá! 👋\n\nPara fazer a *Renovação do seu Seguro Uber/App* conosco é bem simples!\n\nÉ só acessar o link abaixo e preencher os dados:\n\n🔄 {link}\n\nLeva menos de 2 minutos! Qualquer dúvida estou à disposição.",
    },
  },
  {
    type: "residencial",
    name: "Seguro Residencial",
    icon: Home,
    color: "from-emerald-500 to-emerald-600",
    emoji: "🏠",
    hasDealType: false,
    message: "Olá! 👋\n\nPara fazer a cotação do seu *Seguro Residencial* é bem simples!\n\nÉ só acessar o link abaixo e preencher os dados do imóvel:\n\n🏠 {link}\n\nLeva menos de 2 minutos! Qualquer dúvida estou à disposição.",
  },
  {
    type: "vida",
    name: "Seguro de Vida",
    icon: Heart,
    color: "from-rose-500 to-rose-600",
    emoji: "❤️",
    hasDealType: false,
    message: "Olá! 👋\n\nPara fazer a cotação do seu *Seguro de Vida* é bem simples!\n\nÉ só acessar o link abaixo e preencher algumas informações:\n\n❤️ {link}\n\nLeva menos de 2 minutos! Qualquer dúvida estou à disposição.",
  },
  {
    type: "empresarial",
    name: "Seguro Empresarial",
    icon: Building2,
    color: "from-amber-500 to-amber-600",
    emoji: "🏢",
    hasDealType: false,
    message: "Olá! 👋\n\nPara fazer a cotação do *Seguro Empresarial* é bem simples!\n\nÉ só acessar o link abaixo e preencher os dados da empresa:\n\n🏢 {link}\n\nLeva menos de 2 minutos! Qualquer dúvida estou à disposição.",
  },
  {
    type: "viagem",
    name: "Seguro Viagem",
    icon: Plane,
    color: "from-sky-500 to-sky-600",
    emoji: "✈️",
    hasDealType: false,
    message: "Olá! 👋\n\nPara fazer a cotação do seu *Seguro Viagem* é bem simples!\n\nÉ só acessar o link abaixo e preencher os dados da viagem:\n\n✈️ {link}\n\nLeva menos de 2 minutos! Qualquer dúvida estou à disposição.",
  },
  {
    type: "saude",
    name: "Plano de Saúde",
    icon: Stethoscope,
    color: "from-teal-500 to-teal-600",
    emoji: "🏥",
    hasDealType: false,
    message: "Olá! 👋\n\nPara fazer a cotação do seu *Plano de Saúde* é bem simples!\n\nÉ só acessar o link abaixo e preencher algumas informações:\n\n🏥 {link}\n\nLeva menos de 2 minutos! Qualquer dúvida estou à disposição.",
  },
];

const Links = () => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [dealModes, setDealModes] = useState<Record<string, DealMode>>({
    auto: "novo",
    uber: "novo",
  });
  const baseUrl = window.location.origin;

  const getUrlForType = (type: string, hasDealType: boolean) => {
    if (hasDealType) {
      const mode = dealModes[type] || "novo";
      return `${baseUrl}/cotacao?type=${type}&deal=${mode}`;
    }
    return `${baseUrl}/cotacao?type=${type}`;
  };

  const getMessageForType = (link: typeof insuranceLinks[0]) => {
    if (link.hasDealType && link.messages) {
      const mode = dealModes[link.type] || "novo";
      return link.messages[mode];
    }
    return link.message || "";
  };

  const toggleDealMode = (type: string) => {
    setDealModes(prev => ({
      ...prev,
      [type]: prev[type] === "novo" ? "renovacao" : "novo",
    }));
  };

  const copyLink = async (type: string, name: string, hasDealType: boolean) => {
    const url = getUrlForType(type, hasDealType);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedType(type);
      toast.success(`Link de ${name} copiado!`);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      toast.error("Erro ao copiar link");
    }
  };

  const copyMessage = async (type: string, name: string, link: typeof insuranceLinks[0]) => {
    const url = getUrlForType(type, link.hasDealType);
    const messageTemplate = getMessageForType(link);
    const message = messageTemplate.replace("{link}", url);
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMessage(type);
      toast.success(`Mensagem de ${name} copiada!`);
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (err) {
      toast.error("Erro ao copiar mensagem");
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
            const isMessageCopied = copiedMessage === link.type;
            const fullUrl = getUrlForType(link.type, link.hasDealType);
            const currentMode = dealModes[link.type] || "novo";

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
                    
                    {/* Deal Type Toggle para Auto e Uber */}
                    {link.hasDealType && (
                      <div className="flex gap-1 mb-2">
                        <button
                          onClick={() => setDealModes(prev => ({ ...prev, [link.type]: "novo" }))}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                            currentMode === "novo"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          <PlusCircle className="w-3 h-3" />
                          Novo
                        </button>
                        <button
                          onClick={() => setDealModes(prev => ({ ...prev, [link.type]: "renovacao" }))}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                            currentMode === "renovacao"
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          <RefreshCw className="w-3 h-3" />
                          Renovação
                        </button>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground truncate mb-3" title={fullUrl}>
                      {fullUrl}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyLink(link.type, link.name, link.hasDealType)}
                        variant={isCopied ? "default" : "outline"}
                        size="sm"
                        className="flex-1 gap-1.5"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Link2 className="w-4 h-4" />
                            Link
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => copyMessage(link.type, link.name, link)}
                        variant={isMessageCopied ? "default" : "secondary"}
                        size="sm"
                        className="flex-1 gap-1.5"
                      >
                        {isMessageCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4" />
                            Mensagem
                          </>
                        )}
                      </Button>
                    </div>
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
📱 Seguro Uber/App: ${baseUrl}/cotacao?type=uber
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
📱 Seguro Uber/App: ${baseUrl}/cotacao?type=uber
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
