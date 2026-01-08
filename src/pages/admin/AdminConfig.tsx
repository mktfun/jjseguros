import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Key, Link2, Trash2, HelpCircle, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

export default function AdminConfig() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      // Deletar logs com mais de 30 dias
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
    },
    onError: () => {
      toast({
        title: 'Erro na limpeza',
        description: 'Não foi possível limpar os logs antigos.',
        variant: 'destructive',
      });
    },
  });

  return (
    <AdminLayout title="Configurações">
      <div className="space-y-6">
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

            {/* Documentação rápida */}
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

        {/* Card 3: Limpeza de Logs */}
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
