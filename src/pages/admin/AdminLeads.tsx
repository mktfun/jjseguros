import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 10;

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
      className={status === 'synced' ? 'bg-green-600 hover:bg-green-700' : status === 'pending' ? 'bg-gray-500 hover:bg-gray-600 text-white' : ''}
    >
      {label}
    </Badge>
  );
}

function LeadsTableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce da busca para evitar muitas requisições
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset para página 1 ao buscar
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-leads', currentPage, debouncedSearch],
    queryFn: async () => {
      // Cálculo do range: página 1 = 0-9, página 2 = 10-19, etc.
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('leads')
        .select('id, created_at, name, email, phone, insurance_type, rd_station_synced, rd_station_error', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicar filtro de busca no servidor
      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }

      // Aplicar paginação
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      
      return {
        leads: data as Lead[],
        totalCount: count ?? 0,
      };
    },
  });

  const totalPages = data ? Math.ceil(data.totalCount / ITEMS_PER_PAGE) : 0;
  const leads = data?.leads ?? [];

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
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
          {/* Busca */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Contagem de resultados */}
          {data && (
            <p className="text-sm text-muted-foreground">
              Mostrando {leads.length} de {data.totalCount} leads
              {debouncedSearch && ` (filtrado por "${debouncedSearch}")`}
            </p>
          )}

          {/* Tabela */}
          {isLoading ? (
            <LeadsTableSkeleton />
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              Erro ao carregar leads. Por favor, tente novamente.
            </div>
          ) : leads.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              {debouncedSearch
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
                    <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                    <TableHead>Ramo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{lead.email}</TableCell>
                      <TableCell className="hidden lg:table-cell">{lead.phone}</TableCell>
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

          {/* Paginação */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages}
                >
                  Próximo
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
