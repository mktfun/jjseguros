import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Check, Copy, Key, Link2, Trash2, HelpCircle, AlertTriangle, Radio, ChevronDown, ChevronUp, Settings, Send, Loader2 } from 'lucide-react';
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
import { getSettings, saveSettings, isValidUrl, IntegrationSettings } from '@/utils/settings';
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
  const [urlError, setUrlError] = useState('');
  
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
    }
  }, [integrationSettings]);

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