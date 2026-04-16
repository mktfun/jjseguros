import { useState } from "react";
import { Copy, Check, Car, Home, Heart, Building2, Plane, Stethoscope, Link2, MessageCircle, RefreshCw, PlusCircle, Smartphone, Send, SendHorizontal, Loader2, FileEdit, KeyRound, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type DealMode = "novo" | "renovacao" | "endosso";

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
  {
    type: "smartphone",
    name: "Seguro Smartphone",
    icon: Smartphone,
    color: "from-purple-500 to-purple-600",
    emoji: "📱",
    hasDealType: false,
    message: "Olá! 👋\n\nPara fazer a cotação do seu *Seguro Smartphone* é bem simples!\n\nÉ só acessar o link abaixo e preencher os dados:\n\n📱 {link}\n\nLeva menos de 2 minutos! Qualquer dúvida estou à disposição.",
  },
  {
    type: "fianca",
    name: "Fiança Residencial",
    icon: KeyRound,
    color: "from-stone-500 to-stone-600",
    emoji: "🔑",
    hasDealType: false,
    message: "Olá! 👋\n\nPara fazer a cotação do seu *Seguro Fiança Residencial* é bem simples!\n\nDispense fiador e garanta seu aluguel com segurança.\n\n🔑 {link}\n\nLeva menos de 2 minutos! Qualquer dúvida estou à disposição.",
  },
  {
    type: "funeral",
    name: "Assistência Funeral",
    icon: Heart,
    color: "from-gray-600 to-gray-700",
    emoji: "🕊️",
    hasDealType: false,
    message: "Olá! 👋\n\nPara fazer a cotação da sua *Assistência Funeral Familiar* é bem simples!\n\nÉ só acessar o link abaixo e preencher algumas informações:\n\n🕊️ {link}\n\nLeva menos de 2 minutos! Qualquer dúvida estou à disposição.",
  },
  {
    type: "sinistro",
    name: "Aviso de Sinistro",
    icon: AlertTriangle,
    color: "from-amber-500 to-orange-600",
    emoji: "⚠️",
    hasDealType: false,
    message: "Olá! Sinto muito pelo ocorrido. ⚠️\n\nPara agilizarmos a abertura do seu *Aviso de Sinistro*, por favor preencha os dados necessários no formulário abaixo:\n\n⚠️ {link}\n\nAssim que recebermos, entraremos em contato para os próximos passos.",
  },
];

const qarVariableMap: Record<string, string> = {
  auto: 'cf_qar_auto',
  uber: 'cf_qar_uber',
  residencial: 'cf_qar_residencial',
  vida: 'cf_qar_vida',
  empresarial: 'cf_qar_empresarial',
  viagem: 'cf_qar_viagem',
  saude: 'cf_qar_saude',
  smartphone: 'cf_qar_smartphone',
  fianca: 'cf_qar_residencial',
  funeral: 'cf_qar_funeral',
  sinistro: 'cf_qar_auto'
};

const insuranceNames: Record<string, string> = {
  auto: 'Seguro Auto',
  uber: 'Seguro Uber/Similares',
  residencial: 'Seguro Residencial',
  vida: 'Seguro de Vida',
  empresarial: 'Seguro Empresarial',
  viagem: 'Seguro Viagem',
  saude: 'Plano de Saúde',
  smartphone: 'Seguro Smartphone',
  fianca: 'Fiança Residencial',
  funeral: 'Assistência Funeral Familiar',
  sinistro: 'Aviso de Sinistro'
};

const Links = () => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [dealModes, setDealModes] = useState<Record<string, DealMode>>({
    auto: "novo",
    uber: "novo",
  });
  const [sendingType, setSendingType] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const baseUrl = window.location.origin;

  const generateTestPayload = (type: string) => {
    const timestamp = new Date().toLocaleString('pt-BR');
    
    // Seleciona o QAR correto baseado no tipo
    let testQAR = '';
    let extraCustomFields: Record<string, string> = {};

    switch (type) {
      case 'auto':
        testQAR = `NOVO LEAD: SEGURO AUTO\nEvento de Teste: ${timestamp}`;
        break;
      case 'funeral':
        testQAR = `NOVO LEAD: ASSISTENCIA FUNERAL FAMILIAR\nEvento de Teste: ${timestamp}\nDependentes: 3`;
        break;
      default:
        testQAR = `NOVO LEAD: ${insuranceNames[type]?.toUpperCase()}\nEvento de Teste: ${timestamp}`;
    }

    return {
      contactData: {
        name: "David Teste",
        email: "teste@example.com",
        personal_phone: "11996242812",
        city: "São Paulo",
        state: "SP"
      },
      customFields: {
        cf_tipo_solicitacao_seguro: insuranceNames[type],
        [qarVariableMap[type]]: testQAR,
        cf_qar_respondido: testQAR,
        cf_tipo_pessoa: 'Pessoa Física',
        cf_cpf: '123.456.789-00',
        ...extraCustomFields
      }
    };
  };

  const sendTestToRD = async (type: string, name: string) => {
    setSendingType(type);
    try {
      const payload = generateTestPayload(type);
      const { data, error } = await supabase.functions.invoke('send-lead', {
        body: { payload }
      });
      if (error) throw error;
      toast.success(`${name} enviado com sucesso!`);
      return true;
    } catch (err) {
      toast.error(`Erro ao enviar ${name}`);
      return false;
    } finally {
      setSendingType(null);
    }
  };

  const sendAllToRD = async () => {
    setSendingAll(true);
    const types = ['auto', 'uber', 'residencial', 'vida', 'empresarial', 'viagem', 'saude', 'smartphone', 'funeral'];
    for (const type of types) {
      const link = insuranceLinks.find(l => l.type === type);
      if (link) await sendTestToRD(type, link.name);
    }
    toast.success('Todos os testes concluídos!');
    setSendingAll(false);
  };

  const getUrlForType = (type: string, hasDealType: boolean) => {
    return hasDealType ? `${baseUrl}/cotacao?type=${type}&deal=${dealModes[type] || "novo"}` : `${baseUrl}/cotacao?type=${type}`;
  };

  const copyLink = async (type: string, name: string, hasDealType: boolean) => {
    const url = getUrlForType(type, hasDealType);
    await navigator.clipboard.writeText(url);
    setCopiedType(type);
    toast.success(`Link de ${name} copiado!`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyMessage = async (type: string, name: string, link: typeof insuranceLinks[0]) => {
    const url = getUrlForType(link.type, link.hasDealType);
    const template = link.hasDealType ? (link as any).messages[dealModes[link.type] || "novo"] : (link as any).message;
    const message = template.replace("{link}", url);
    await navigator.clipboard.writeText(message);
    setCopiedMessage(type);
    toast.success(`Mensagem de ${name} copiada!`);
    setTimeout(() => setCopiedMessage(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold flex items-center gap-3"><Link2 className="w-8 h-8" /> Painel de Cotações</h1>
          <p className="text-primary-foreground/80">Gerencie links e mensagens rápidas.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="links" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
            <TabsTrigger value="testes">Testes RD</TabsTrigger>
          </TabsList>

          <TabsContent value="links">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insuranceLinks.map((link) => (
                <div key={link.type} className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${link.color} text-white`}><link.icon className="w-6 h-6" /></div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{link.name}</h3>
                      <Button onClick={() => copyLink(link.type, link.name, link.hasDealType)} className="w-full gap-2">
                        {copiedType === link.type ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                        {copiedType === link.type ? "Copiado!" : "Copiar Link"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mensagens">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insuranceLinks.map((link) => (
                <div key={link.type} className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all">
                  <h3 className="font-semibold mb-3">{link.name}</h3>
                  <Button onClick={() => copyMessage(link.type, link.name, link)} variant="secondary" className="w-full gap-2">
                    {copiedMessage === link.type ? <Check className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                    Copiar WhatsApp
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="testes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insuranceLinks.map((link) => (
                <div key={link.type} className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold mb-3">{link.name}</h3>
                  <Button onClick={() => sendTestToRD(link.type, link.name)} variant="outline" className="w-full gap-2" disabled={sendingType === link.type}>
                    {sendingType === link.type ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Enviar Teste
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Links;