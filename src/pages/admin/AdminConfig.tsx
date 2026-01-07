import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function AdminConfig() {
  return (
    <AdminLayout title="Configurações">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-warning" />
            Em Construção
          </CardTitle>
          <CardDescription>
            As configurações serão implementadas em fases futuras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página permitirá gerenciar configurações do sistema,
            como tokens de API, webhooks e preferências gerais.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
