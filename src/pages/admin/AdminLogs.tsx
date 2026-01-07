import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function AdminLogs() {
  return (
    <AdminLayout title="Logs de Integração">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-warning" />
            Em Construção
          </CardTitle>
          <CardDescription>
            O visualizador de logs será implementado na Fase 3.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página exibirá os logs de integração com RD Station e n8n,
            mostrando erros, tentativas de reenvio e status das operações.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
