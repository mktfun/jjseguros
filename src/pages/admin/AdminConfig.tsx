import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Check, Copy, Key, Link2, Trash2, HelpCircle, AlertTriangle, Radio, ChevronDown, ChevronUp, Settings, Send, Loader2, FileText, Target, Eye, EyeOff } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSettings, saveSettings, isValidUrl, IntegrationSettings } from '@/utils/settings';
import { HealthQualificationConfig } from '@/components/admin/HealthQualificationConfig';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SUPABASE_PROJECT_ID = 'jrbknkrkhyoobkpdyaay';
const WEBHOOK_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/rd-webhook-confirm`;

interface IntegrationLog {
  id: string;
  service_name: string;
  status: string;
  payload: Record<string, unknown> | null;
  response: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
}

export default function AdminConfig() {
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [realtimeLogs, setRealtimeLogs] = useState<IntegrationLog[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  
  // Integration settings state
  const [integrationMode, setIntegrationMode] = useState<'rd_station' | 'webhook'>('rd_station');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedQarType, setSelectedQarType] = useState<string>('auto');
  const [isSendingQar, setIsSendingQar] = useState(false);
  const [urlError, setUrlError] = useState('');
  
  // Marketing settings state
  const [metaPixelId, setMetaPixelId] = useState('');
  const [metaCapiToken, setMetaCapiToken] = useState('');
  const [showCapiToken, setShowCapiToken] = useState(false);
  const [isSavingMarketing, setIsSavingMarketing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar últimos logs ao carregar
  const { data: initialLogs } = useQuery({
    queryKey: ['webhook-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_logs')
        .select('*')
        .eq('service_name', 'rd_webhook')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as IntegrationLog[];
    },
  });

  // Combinar logs iniciais com realtime
  useEffect(() => {
    if (initialLogs && realtimeLogs.length === 0) {
      setRealtimeLogs(initialLogs);
    }
  }, [initialLogs, realtimeLogs.length]);

  // Realtime subscription
  useEffect(() => {
    if (!isListening) return;

    const channel = supabase
      .channel('webhook-debugger')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'integration_logs',
          filter: 'service_name=eq.rd_webhook',
        },
        (payload) => {
          const newLog = payload.new as IntegrationLog;
          setRealtimeLogs((prev) => [newLog, ...prev].slice(0, 20));
          toast({
            title: 'Novo webhook recebido',
            description: `Status: ${newLog.status}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isListening, toast]);

  const toggleListening = () => {
    setIsListening((prev) => !prev);
    toast({
      title: isListening ? 'Monitoramento pausado' : 'Monitoramento ativo',
      description: isListening 
        ? 'Você não receberá mais atualizações em tempo real.' 
        : 'Webhooks serão exibidos automaticamente.',
    });
  };

  const toggleExpanded = (logId: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(WEBHOOK_URL);
      setCopied(true);
      toast({
        title: 'Copiado!',
        description: 'URL do webhook copiada para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar a URL.',
        variant: 'destructive',
      });
    }
  };

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { error } = await supabase
        .from('integration_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Limpeza concluída',
        description: 'Logs antigos foram removidos com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
      queryClient.invalidateQueries({ queryKey: ['webhook-logs'] });
    },
    onError: () => {
      toast({
        title: 'Erro na limpeza',
        description: 'Não foi possível limpar os logs antigos.',
        variant: 'destructive',
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fetch integration settings
  const { data: integrationSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['integration-settings'],
    queryFn: getSettings,
  });

  // Sync local state with fetched settings
  useEffect(() => {
    if (integrationSettings) {
      setIntegrationMode(integrationSettings.mode);
      setWebhookUrl(integrationSettings.webhook_url || '');
      // Marketing settings
      setMetaPixelId(integrationSettings.meta_pixel_id || '');
      setMetaCapiToken(integrationSettings.meta_capi_token || '');
    }
  }, [integrationSettings]);

  // Handle save marketing settings
  const handleSaveMarketingSettings = async () => {
    setIsSavingMarketing(true);
    
    const success = await saveSettings({
      meta_pixel_id: metaPixelId || null,
      meta_capi_token: metaCapiToken || null,
    });
    
    if (success) {
      toast({
        title: 'Configurações salvas',
        description: 'Configurações de marketing atualizadas.',
      });
      queryClient.invalidateQueries({ queryKey: ['integration-settings'] });
    } else {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    }
    
    setIsSavingMarketing(false);
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    if (integrationMode === 'webhook' && webhookUrl && !isValidUrl(webhookUrl)) {
      setUrlError('URL inválida. Deve começar com http:// ou https://');
      return;
    }
    
    setIsSaving(true);
    setUrlError('');
    
    const success = await saveSettings({
      mode: integrationMode,
      webhook_url: integrationMode === 'webhook' ? webhookUrl : null,
    });
    
    if (success) {
      toast({
        title: 'Configurações salvas',
        description: 'As configurações de integração foram atualizadas.',
      });
      queryClient.invalidateQueries({ queryKey: ['integration-settings'] });
    } else {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    }
    
    setIsSaving(false);
  };

  // Handle test connection
  const handleTestConnection = async () => {
    if (integrationMode === 'webhook' && !isValidUrl(webhookUrl)) {
      setUrlError('URL inválida para teste.');
      return;
    }
    
    setIsTesting(true);
    setUrlError('');
    
    const testPayload = {
      name: 'Teste de Conexão',
      email: 'teste@exemplo.com',
      phone: '11999999999',
      source: 'Painel Admin - Teste',
      timestamp: new Date().toISOString(),
    };
    
    try {
      if (integrationMode === 'webhook') {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPayload),
        });
        
        if (response.ok) {
          toast({
            title: 'Sucesso',
            description: 'Webhook respondeu corretamente.',
          });
        } else {
          toast({
            title: 'Erro',
            description: `Webhook retornou status ${response.status}`,
            variant: 'destructive',
          });
        }
      } else {
        const { error } = await supabase.functions.invoke('rd-station', {
          body: {
            contactData: {
              name: testPayload.name,
              email: testPayload.email,
              personal_phone: testPayload.phone,
            },
            customFields: {
              cf_tipo_solicitacao_seguro: 'Teste Admin',
            },
          },
        });
        
        if (error) {
          toast({
            title: 'Erro',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Sucesso',
            description: 'RD Station recebeu os dados.',
          });
        }
      }
    } catch (err) {
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível conectar ao destino.',
        variant: 'destructive',
      });
    }
    
    setIsTesting(false);
  };

  // Generate complete QAR test payloads
  const generateQarPayload = (type: string) => {
    const SEPARATOR = '───────────────────────';
    const timestamp = new Date().toISOString();
    
    const payloads: Record<string, any> = {
      auto: {
        name: 'João Carlos da Silva',
        email: 'joao.silva@email.com',
        personal_phone: '11987654321',
        city: 'São Paulo',
        state: 'SP',
        cf_tipo_solicitacao_seguro: 'Seguro Auto',
        cf_deal_type: 'Seguro Novo',
        cf_qar_auto: `NOVO LEAD: SEGURO AUTO
${SEPARATOR}
Nome: João Carlos da Silva
Chamar: https://wa.me/5511987654321
${SEPARATOR}

TIPO SOLICITACAO: Seguro Novo

DADOS DO CONDUTOR:
Nome: João Carlos da Silva
Tipo: Pessoa Fisica
CPF/CNPJ: 123.456.789-00
Estado Civil: Casado(a)
Profissao: Engenheiro de Software

DADOS DO VEICULO:
Modelo: Honda Civic EXL 2.0 2024
Placa: ABC1D23
Ano/Modelo: 2024
Zero KM: Nao
Financiado/Alienado: Sim
Tipo de Uso: Uso Pessoal (Lazer/Trabalho)

ENDERECO E PERNOITE:
CEP: 01310-100
Endereco: Av. Paulista, 1000, Bela Vista, São Paulo, SP
Tipo Residencia: Apartamento
Garagem Casa: Portao Automatico

ROTINA DE USO:
Usa p/ Trabalho: Sim
  > Estacionamento Trabalho: Garagem Fechada
Usa p/ Faculdade: Nao

PERFIL DE RISCO:
Reside com pessoa de 18-25 anos: Sim
  > Essa pessoa conduz o veiculo: Sim
  > Idade do condutor jovem: 22 anos
  > Sexo: Masculino

${SEPARATOR}
CONTATO:
Email: joao.silva@email.com
Telefone: 11987654321`,
        funnel: { funnel_name: '1-Auto', funnel_stage: 'AGR Cotacao' },
      },
      residencial: {
        name: 'Maria Fernanda Costa',
        email: 'maria.costa@email.com',
        personal_phone: '21998765432',
        city: 'Rio de Janeiro',
        state: 'RJ',
        cf_tipo_solicitacao_seguro: 'Seguro Residencial',
        cf_qar_residencial: `NOVO LEAD: SEGURO RESIDENCIAL
${SEPARATOR}
Nome: Maria Fernanda Costa
Chamar: https://wa.me/5521998765432
${SEPARATOR}

DADOS DO SEGURADO:
Tipo: Pessoa Fisica
Nome: Maria Fernanda Costa
CPF/CNPJ: 987.654.321-00
Estado Civil: Solteiro(a)
Profissao: Advogada

DADOS DO IMOVEL:
Tipo: Apartamento
Condicao: Proprietario
Alarme Monitorado: Sim
Condominio Fechado: Sim

ENDERECO:
CEP: 22041-080
Endereco: Rua Barata Ribeiro, 500, Copacabana, Rio de Janeiro, RJ

VALORES E COBERTURAS:
Valor de Reconstrucao: R$ 500.000
Valor do Conteudo: R$ 150.000
Roubo/Furto: Sim
Incendio/Raio/Explosao: Sim
Eletronicos Portateis: Sim
Valor NF Eletronicos Portateis: R$ 25.000
Cobertura Valor de Novo: Sim

${SEPARATOR}
CONTATO:
Email: maria.costa@email.com
Telefone: 21998765432`,
        funnel: { funnel_name: '2-Residencial', funnel_stage: 'AGR Cotacao' },
      },
      vida: {
        name: 'Carlos Eduardo Santos',
        email: 'carlos.santos@email.com',
        personal_phone: '31987654321',
        city: 'Belo Horizonte',
        state: 'MG',
        cf_tipo_solicitacao_seguro: 'Seguro de Vida',
        cf_qar_vida: `NOVO LEAD: SEGURO DE VIDA
${SEPARATOR}
Nome: Carlos Eduardo Santos
Chamar: https://wa.me/5531987654321
${SEPARATOR}

DADOS DO SEGURADO:
Nome: Carlos Eduardo Santos
CPF: 456.789.123-00
Data Nascimento: 15/03/1985
Profissao: Medico

PERFIL DE SAUDE:
Fumante: Nao
Esportes Radicais: Nao

CAPITAL E COBERTURAS:
Capital Segurado: R$ 1.000.000
Invalidez: Sim
Doencas Graves: Sim
Funeral: Sim

${SEPARATOR}
CONTATO:
Email: carlos.santos@email.com
Telefone: 31987654321`,
        funnel: { funnel_name: '3-Vida', funnel_stage: 'AGR Cotacao' },
      },
      empresarial: {
        name: 'Tech Solutions LTDA',
        email: 'contato@techsolutions.com.br',
        personal_phone: '11912345678',
        city: 'São Paulo',
        state: 'SP',
        cf_tipo_solicitacao_seguro: 'Seguro Empresarial',
        cf_qar_empresarial: `NOVO LEAD: SEGURO EMPRESARIAL
${SEPARATOR}
Nome: Tech Solutions LTDA
Chamar: https://wa.me/5511912345678
${SEPARATOR}

DADOS DA EMPRESA:
Razao Social: Tech Solutions LTDA
CNPJ: 12.345.678/0001-90
Ramo: Tecnologia da Informacao
Contato: Roberto Silva
Cargo: Diretor Financeiro

DADOS DO IMOVEL:
Tipo: Sala Comercial
Condicao: Inquilino
Possui Alarme: Sim

ENDERECO:
CEP: 04543-011
Endereco: Av. Brigadeiro Faria Lima, 3477, Itaim Bibi, São Paulo, SP

COBERTURAS:
Incendio: Sim
Roubo/Furto: Sim
Responsabilidade Civil: Sim
Lucros Cessantes: Sim

${SEPARATOR}
CONTATO:
Email: contato@techsolutions.com.br
Telefone: 11912345678`,
        funnel: { funnel_name: '4-Business', funnel_stage: 'AGR Cotacao' },
      },
      viagem: {
        name: 'Ana Paula Oliveira',
        email: 'ana.oliveira@email.com',
        personal_phone: '41987654321',
        city: 'Curitiba',
        state: 'PR',
        cf_tipo_solicitacao_seguro: 'Seguro Viagem',
        cf_qar_viagem: `NOVO LEAD: SEGURO VIAGEM
${SEPARATOR}
Nome: Ana Paula Oliveira
Chamar: https://wa.me/5541987654321
${SEPARATOR}

DADOS DO VIAJANTE:
Nome: Ana Paula Oliveira
CPF: 789.123.456-00
Data Nascimento: 22/07/1990

DADOS DA VIAGEM:
Destino: Europa (Multiplos Paises)
Data Ida: 15/03/2026
Data Volta: 30/03/2026
Duracao: 15 dias
Motivo: Turismo

COBERTURAS DESEJADAS:
Despesas Medicas: USD 100.000
Extravio Bagagem: Sim
Cancelamento Viagem: Sim
Assistencia Juridica: Sim

${SEPARATOR}
CONTATO:
Email: ana.oliveira@email.com
Telefone: 41987654321`,
        funnel: { funnel_name: '5-Viagem', funnel_stage: 'AGR Cotacao' },
      },
      saude: {
        name: 'Fernando Henrique Lima',
        email: 'fernando.lima@email.com',
        personal_phone: '51987654321',
        city: 'Porto Alegre',
        state: 'RS',
        cf_tipo_solicitacao_seguro: 'Plano de Saúde',
        cf_qar_saude: `NOVO LEAD: PLANO DE SAUDE
${SEPARATOR}
Nome: Fernando Henrique Lima
Chamar: https://wa.me/5551987654321
${SEPARATOR}

DADOS DO TITULAR:
Nome: Fernando Henrique Lima
CPF: 321.654.987-00
Data Nascimento: 10/11/1978
Profissao: Empresario

TIPO DE PLANO:
Modalidade: Familiar
Qtd Dependentes: 3

DEPENDENTES:
1. Juliana Lima (Esposa) - 42 anos
2. Pedro Lima (Filho) - 15 anos
3. Ana Lima (Filha) - 12 anos

PREFERENCIAS:
Acomodacao: Apartamento
Coparticipacao: Aceita
Rede Preferencial: Ampla

${SEPARATOR}
CONTATO:
Email: fernando.lima@email.com
Telefone: 51987654321`,
        funnel: { funnel_name: '6-Saude', funnel_stage: 'AGR Cotacao' },
      },
      smartphone: {
        name: 'Gabriela Mendes',
        email: 'gabriela.mendes@email.com',
        personal_phone: '61987654321',
        city: 'Brasília',
        state: 'DF',
        cf_tipo_solicitacao_seguro: 'Seguro Residencial',
        cf_qar_residencial: `NOVO LEAD: SEGURO SMARTPHONE (VIA RESIDENCIAL)
${SEPARATOR}
Nome: Gabriela Mendes
Chamar: https://wa.me/5561987654321
${SEPARATOR}

DADOS DO SEGURADO:
Tipo: Pessoa Fisica
Nome: Gabriela Mendes
CPF: 654.321.987-00

ENDERECO BASE:
CEP: 70040-010
Endereco: SQS 308, Bloco A, Asa Sul, Brasília, DF

DADOS DO SMARTPHONE:
Marca/Modelo: iPhone 15 Pro Max
Valor Nota Fiscal: R$ 9.499,00
Data Compra: 10/01/2026
IMEI: 123456789012345

COBERTURAS:
Roubo/Furto: Sim
Quebra Acidental: Sim
Danos por Liquidos: Sim

AVISO IMPORTANTE:
Nota Fiscal obrigatoria para indenizacao

${SEPARATOR}
CONTATO:
Email: gabriela.mendes@email.com
Telefone: 61987654321`,
        funnel: { funnel_name: '2-Residencial', funnel_stage: 'AGR Cotacao' },
      },
    };

    const payload = payloads[type] || payloads.auto;
    return {
      ...payload,
      cf_qar_respondido: payload.cf_qar_auto || payload.cf_qar_residencial || payload.cf_qar_vida || payload.cf_qar_empresarial || payload.cf_qar_viagem || payload.cf_qar_saude,
      timestamp,
      source: 'JJ Seguros - Teste Admin Panel',
    };
  };

  // Handle send complete QAR test
  const handleSendQarTest = async () => {
    if (integrationMode === 'webhook' && !isValidUrl(webhookUrl)) {
      setUrlError('URL inválida para envio.');
      return;
    }

    setIsSendingQar(true);
    const payload = generateQarPayload(selectedQarType);

    try {
      if (integrationMode === 'webhook') {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          toast({
            title: 'QAR Enviado com Sucesso!',
            description: `Payload de ${selectedQarType.toUpperCase()} enviado para o webhook.`,
          });
        } else {
          toast({
            title: 'Erro no Envio',
            description: `Webhook retornou status ${response.status}`,
            variant: 'destructive',
          });
        }
      } else {
        // For RD Station, use the edge function
        const { error } = await supabase.functions.invoke('rd-station', {
          body: {
            contactData: {
              name: payload.name,
              email: payload.email,
              personal_phone: payload.personal_phone,
              city: payload.city,
              state: payload.state,
            },
            customFields: {
              cf_tipo_solicitacao_seguro: payload.cf_tipo_solicitacao_seguro,
              cf_qar_respondido: payload.cf_qar_respondido,
            },
            funnelData: payload.funnel,
          },
        });

        if (error) {
          toast({
            title: 'Erro no Envio',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'QAR Enviado com Sucesso!',
            description: `Payload de ${selectedQarType.toUpperCase()} enviado para RD Station.`,
          });
        }
      }
    } catch (err) {
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível enviar o QAR de teste.',
        variant: 'destructive',
      });
    }

    setIsSendingQar(false);
  };

  return (
    <AdminLayout title="Configurações">
      <div className="space-y-6">
        {/* Card 0: Integration Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração de Integração
            </CardTitle>
            <CardDescription>
              Escolha o destino dos leads capturados pelos formulários.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingSettings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <Label className="text-base font-medium">Destino dos Leads</Label>
                  <RadioGroup
                    value={integrationMode}
                    onValueChange={(value) => setIntegrationMode(value as 'rd_station' | 'webhook')}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="rd_station" id="rd_station" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="rd_station" className="font-medium cursor-pointer">
                          RD Station (Direto via API)
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Envia diretamente para a API oficial do RD Station Marketing.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="webhook" id="webhook" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="webhook" className="font-medium cursor-pointer">
                          Webhook (n8n, Make, Zapier)
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Envia para uma URL customizada (automação externa).
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {integrationMode === 'webhook' && (
                  <div className="space-y-2 pl-7">
                    <Label htmlFor="webhook-url">URL do Webhook (POST)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="webhook-url"
                        type="url"
                        placeholder="https://seu-webhook.exemplo.com/endpoint"
                        value={webhookUrl}
                        onChange={(e) => {
                          setWebhookUrl(e.target.value);
                          setUrlError('');
                        }}
                        className={urlError ? 'border-destructive' : ''}
                      />
                      <Button
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={isTesting || !webhookUrl}
                      >
                        {isTesting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {urlError && (
                      <p className="text-sm text-destructive">{urlError}</p>
                    )}
                    
                    {/* URL de Callback para confirmação */}
                    <div className="space-y-2 pt-4 mt-4 border-t border-dashed">
                      <Label>URL de Callback (Confirmação)</Label>
                      <p className="text-sm text-muted-foreground">
                        Configure no n8n/Make para confirmar que o lead foi processado:
                      </p>
                      <div className="flex gap-2 items-center">
                        <Input
                          readOnly
                          value={`https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/rd-webhook-confirm?token=SEU_TOKEN`}
                          className="font-mono text-xs bg-muted"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={async () => {
                            const url = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/rd-webhook-confirm?token=SEU_TOKEN`;
                            await navigator.clipboard.writeText(url);
                            toast({
                              title: 'Copiado!',
                              description: 'URL de callback copiada.',
                            });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Alert className="mt-2">
                        <HelpCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          O n8n deve fazer um POST para esta URL com <code className="bg-muted px-1 rounded">{"{ email: 'lead@email.com' }"}</code> para 
                          marcar como sincronizado na timeline. Substitua <code className="bg-muted px-1 rounded">SEU_TOKEN</code> pelo token configurado no secret <code className="bg-muted px-1 rounded">RD_WEBHOOK_TOKEN</code>.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                )}

                {integrationMode === 'rd_station' && (
                  <div className="pl-7">
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Testar Conexão RD Station
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Configurações'
                    )}
                  </Button>
                </div>

                {/* QAR Test Section */}
                <div className="pt-6 border-t space-y-4">
                  <div>
                    <Label className="text-base font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Enviar QAR de Teste Completo
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Envia um payload real de cotação para testar a integração.
                    </p>
                  </div>

                  <div className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="qar-type">Tipo de Seguro</Label>
                      <Select value={selectedQarType} onValueChange={setSelectedQarType}>
                        <SelectTrigger id="qar-type">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">🚗 Seguro Auto</SelectItem>
                          <SelectItem value="residencial">🏠 Seguro Residencial</SelectItem>
                          <SelectItem value="vida">❤️ Seguro de Vida</SelectItem>
                          <SelectItem value="empresarial">🏢 Seguro Empresarial</SelectItem>
                          <SelectItem value="viagem">✈️ Seguro Viagem</SelectItem>
                          <SelectItem value="saude">🏥 Plano de Saúde</SelectItem>
                          <SelectItem value="smartphone">📱 Seguro Smartphone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleSendQarTest} 
                      disabled={isSendingQar}
                      className="shrink-0"
                    >
                      {isSendingQar ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar QAR Teste
                        </>
                      )}
                    </Button>
                  </div>

                  <Alert>
                    <AlertDescription className="text-sm">
                      O payload será enviado para: <strong>{integrationMode === 'webhook' ? (webhookUrl || 'URL não configurada') : 'RD Station (API)'}</strong>
                    </AlertDescription>
                  </Alert>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 1: Status da API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Status da API
            </CardTitle>
            <CardDescription>
              Verifique se as chaves de API estão configuradas corretamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">RD_API_KEY</p>
                <p className="text-sm text-muted-foreground">Chave de API do RD Station</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono bg-background px-2 py-1 rounded">****</span>
                <span className="text-green-600 text-sm font-medium">Configurada</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">RD_WEBHOOK_TOKEN</p>
                <p className="text-sm text-muted-foreground">Token de validação do webhook</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono bg-background px-2 py-1 rounded">****</span>
                <span className="text-green-600 text-sm font-medium">Configurada</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Marketing & Conversão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Marketing & Conversão
            </CardTitle>
            <CardDescription>
              Configure Meta Pixel e parâmetros de qualificação de leads.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingSettings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Meta Pixel ID */}
                <div className="space-y-2">
                  <Label htmlFor="meta-pixel-id">Meta Pixel ID</Label>
                  <Input
                    id="meta-pixel-id"
                    type="text"
                    placeholder="Ex: 123456789012345"
                    value={metaPixelId}
                    onChange={(e) => setMetaPixelId(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre em: Gerenciador de Eventos → Fontes de Dados → Seu Pixel
                  </p>
                </div>

                {/* CAPI Token */}
                <div className="space-y-2">
                  <Label htmlFor="meta-capi-token">Meta CAPI Token (Access Token)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="meta-capi-token"
                      type={showCapiToken ? 'text' : 'password'}
                      placeholder="EAAG..."
                      value={metaCapiToken}
                      onChange={(e) => setMetaCapiToken(e.target.value)}
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowCapiToken(!showCapiToken)}
                    >
                      {showCapiToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Token de acesso para Conversions API. Mantenha em segredo!
                  </p>
                </div>

                {/* Health Age Limit - Moved to SDR Config */}
                <Alert>
                  <HelpCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Leads desqualificados NÃO disparam eventos de conversão no Meta Pixel, 
                    mas ainda são salvos no banco de dados para análise.
                    <br />
                    <strong>Nota:</strong> As regras de qualificação SDR foram movidas para a seção abaixo.
                  </AlertDescription>
                </Alert>

                <div className="pt-4 border-t">
                  <Button onClick={handleSaveMarketingSettings} disabled={isSavingMarketing}>
                    {isSavingMarketing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Configurações de Marketing'
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card: SDR Qualification */}
        <HealthQualificationConfig 
          settings={integrationSettings} 
          isLoading={isLoadingSettings}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ['integration-settings'] })}
        />

        {/* Card 2: Endpoints de Webhook */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Endpoints de Webhook
            </CardTitle>
            <CardDescription>
              URLs para configurar no RD Station e outras integrações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">URL de Confirmação do Webhook</label>
              <div className="flex gap-2">
                <Input 
                  value={WEBHOOK_URL} 
                  readOnly 
                  className="font-mono text-sm bg-muted"
                />
                <Button 
                  variant="outline" 
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Use com o parâmetro <code className="bg-muted px-1 rounded">?token=SEU_TOKEN</code>
              </p>
            </div>

            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertTitle>Como configurar no RD Station</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Acesse <strong>Configurações → Integrações → Webhooks</strong> no RD Station</li>
                  <li>Clique em "Adicionar webhook"</li>
                  <li>Cole a URL acima no campo "URL do webhook"</li>
                  <li>Adicione o token: <code className="bg-muted px-1 rounded">?token=SEU_RD_WEBHOOK_TOKEN</code></li>
                  <li>Selecione o evento "Conversão"</li>
                  <li>Salve e teste a integração</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Card 3: Webhook Debugger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Webhook Debugger
            </CardTitle>
            <CardDescription>
              Monitore webhooks do RD Station em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant={isListening ? 'default' : 'outline'}
                onClick={toggleListening}
                className="relative"
              >
                {isListening && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                )}
                <Radio className="mr-2 h-4 w-4" />
                {isListening ? 'Ouvindo...' : 'Ouvir Webhook'}
              </Button>
              {isListening && (
                <span className="text-sm text-muted-foreground">
                  Aguardando novos webhooks...
                </span>
              )}
            </div>

            <div className="border rounded-lg">
              <div className="p-3 border-b bg-muted/50">
                <p className="text-sm font-medium">Últimos Logs</p>
              </div>
              <ScrollArea className="h-[300px]">
                {realtimeLogs.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Radio className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum log de webhook encontrado.</p>
                    <p className="text-xs mt-1">Ative o monitoramento e aguarde um webhook.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {realtimeLogs.map((log) => (
                      <Collapsible
                        key={log.id}
                        open={expandedLogs.has(log.id)}
                        onOpenChange={() => toggleExpanded(log.id)}
                      >
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={log.status === 'success' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {log.status === 'success' ? 'SUCCESS' : 'ERROR'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(log.created_at)}
                              </span>
                            </div>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm">
                                {expandedLogs.has(log.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                          {log.error_message && (
                            <p className="text-sm text-destructive mt-1">{log.error_message}</p>
                          )}
                          <CollapsibleContent>
                            <div className="mt-3 space-y-2">
                              {log.payload && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Payload</p>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                    {JSON.stringify(log.payload, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.response && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Response</p>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                    {JSON.stringify(log.response, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Limpeza de Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Manutenção
            </CardTitle>
            <CardDescription>
              Ferramentas para manutenção e limpeza do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Limpar logs antigos</p>
                <p className="text-sm text-muted-foreground">
                  Remove logs de integração com mais de 30 dias.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    disabled={cleanupMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {cleanupMutation.isPending ? 'Limpando...' : 'Limpar'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Confirmar limpeza
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá remover permanentemente todos os logs de integração 
                      com mais de 30 dias. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cleanupMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Confirmar limpeza
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}