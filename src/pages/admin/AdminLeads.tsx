import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Eye, Filter, X } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Mapeamento de tipos de seguro para labels amigáveis
const insuranceTypeLabels: Record<string, string> = {
  auto: 'Automóvel',
  life: 'Vida',
  health: 'Saúde',
  residential: 'Residencial',
  business: 'Empresarial',
  travel: 'Viagem',
  endorsement: 'Endosso',
};

// Tipos de seguro disponíveis para filtro
const insuranceTypes = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'auto', label: 'Automóvel' },
  { value: 'life', label: 'Vida' },
  { value: 'health', label: 'Saúde' },
  { value: 'residential', label: 'Residencial' },
  { value: 'business', label: 'Empresarial' },
  { value: 'travel', label: 'Viagem' },
  { value: 'endorsement', label: 'Endosso' },
];

// Status de sincronização
const syncStatuses = [
  { value: 'all', label: 'Todos os status' },
  { value: 'synced', label: 'Sincronizado' },
  { value: 'error', label: 'Com erro' },
  { value: 'pending', label: 'Pendente' },
];

type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  insurance_type: string;
  rd_station_synced: boolean;
  rd_station_error: string | null;
};

function getSyncStatus(lead: Lead): 'synced' | 'error' | 'pending' {
  if (lead.rd_station_error) return 'error';
  if (lead.rd_station_synced) return 'synced';
  return 'pending';
}

function SyncBadge({ lead }: { lead: Lead }) {
  const status = getSyncStatus(lead);
  
  const variants: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; label: string }> = {
    synced: { variant: 'default', label: 'Sincronizado' },
    error: { variant: 'destructive', label: 'Erro' },
    pending: { variant: 'secondary', label: 'Pendente' },
  };

  const { variant, label } = variants[status];

  return (
    <Badge 
      variant={variant}
      className={status === 'synced' ? 'bg-green-600 hover:bg-green-700' : status === 'pending' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
    >
      {label}
    </Badge>
  );
}

function LeadsTableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function AdminLeads() {
  const [searchQuery, setSearchQuery] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState('all');
  const [syncFilter, setSyncFilter] = useState('all');

  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id, created_at, name, email, phone, insurance_type, rd_station_synced, rd_station_error')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });

  // Filtros aplicados em memória
  const filteredLeads = useMemo(() => {
    if (!leads) return [];

    return leads.filter((lead) => {
      // Filtro de busca por texto
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = lead.name.toLowerCase().includes(query);
        const matchesEmail = lead.email.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) return false;
      }

      // Filtro por tipo de seguro
      if (insuranceFilter !== 'all' && lead.insurance_type !== insuranceFilter) {
        return false;
      }

      // Filtro por status de sincronização
      if (syncFilter !== 'all') {
        const status = getSyncStatus(lead);
        if (status !== syncFilter) return false;
      }

      return true;
    });
  }, [leads, searchQuery, insuranceFilter, syncFilter]);

  const hasActiveFilters = searchQuery || insuranceFilter !== 'all' || syncFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setInsuranceFilter('all');
    setSyncFilter('all');
  };

  return (
    <AdminLayout title="Leads">
      <Card>
        <CardHeader>
          <CardTitle>Listagem de Leads</CardTitle>
          <CardDescription>
            Gerencie todos os leads capturados pelos formulários de cotação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={insuranceFilter} onValueChange={setInsuranceFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Tipo de seguro" />
                </SelectTrigger>
                <SelectContent>
                  {insuranceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={syncFilter} onValueChange={setSyncFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status RD" />
                </SelectTrigger>
                <SelectContent>
                  {syncStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar filtros">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Contagem de resultados */}
          {leads && (
            <p className="text-sm text-muted-foreground">
              {filteredLeads.length} de {leads.length} leads
            </p>
          )}

          {/* Tabela */}
          {isLoading ? (
            <LeadsTableSkeleton />
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              Erro ao carregar leads. Por favor, tente novamente.
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              {hasActiveFilters
                ? 'Nenhum lead encontrado com os filtros aplicados.'
                : 'Nenhum lead cadastrado ainda.'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Data</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status RD</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{lead.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {insuranceTypeLabels[lead.insurance_type] || lead.insurance_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <SyncBadge lead={lead} />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" disabled title="Ver detalhes (em breve)">
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
