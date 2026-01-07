import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function AdminLeads() {
  return (
    <AdminLayout title="Leads">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-warning" />
            Em Construção
          </CardTitle>
          <CardDescription>
            A listagem completa de leads será implementada na Fase 2.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página exibirá uma tabela com todos os leads, filtros por tipo de seguro,
            status de sincronização e opções de busca.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
