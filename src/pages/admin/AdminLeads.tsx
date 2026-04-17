import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Eye, ChevronLeft, ChevronRight, Download, Loader2, Copy, MessageCircle, Smartphone, User, FileText, Hash } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 12;

const insuranceTypeLabels: Record<string, string> = {
  auto: 'Automóvel',
  uber: 'Uber/App',
  life: 'Vida',
  health: 'Saúde',
  residential: 'Residencial',
  business: 'Empresarial',
  travel: 'Viagem',
  endorsement: 'Endosso',
  funeral: 'Assistência Funeral',
};

// Cores neutras e sóbrias
const insuranceColors: Record<string, string> = {
  auto: 'border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  uber: 'border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  life: 'border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  funeral: 'border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  residential: 'border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
};

type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  insurance_type: string;
  rd_station_synced: boolean;
  rd_station_error: string | null;
  is_completed?: boolean;
  abandoned_alert_sent?: boolean;
};

function SyncBadge({ lead }: { lead: Lead }) {
  if (lead.rd_station_error) return <Badge variant="destructive" className="font-bold">ERRO RD</Badge>;
  if (lead.rd_station_synced) return <Badge className="bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold border-none">SINCRONIZADO</Badge>;
  return <Badge variant="outline" className="text-slate-400 border-slate-200 uppercase text-[9px]">Pendente</Badge>;
}

export default function AdminLeads() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-leads', currentPage, debouncedSearch],
    queryFn: async () => {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('leads')
        .select('id, created_at, name, email, phone, cpf, insurance_type, rd_station_synced, rd_station_error, is_completed, abandoned_alert_sent', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,cpf.ilike.%${debouncedSearch}%`);
      }

      query = query.range(from, to);
      const { data, error, count } = await query;
      if (error) throw error;
      return { leads: data as Lead[], totalCount: count ?? 0 };
    },
  });

  const copyInfo = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const leads = data?.leads ?? [];
  const totalPages = data ? Math.ceil(data.totalCount / ITEMS_PER_PAGE) : 0;

  return (
    <AdminLayout title="Leads">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase italic">Oportunidades</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 font-bold border-slate-200">
               <Download className="w-4 h-4 mr-2" /> Exportar
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white dark:bg-slate-950">
          <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-900">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 bg-slate-50 dark:bg-slate-900 border-none focus:ring-1 focus:ring-[#002147]"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-300" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                  <TableRow className="border-slate-100 dark:border-slate-900 hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.15em] py-5">Entrada</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.15em]">Cliente</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.15em]">CPF / CNPJ</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.15em]">Ramo</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.15em]">RD CRM</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.15em]">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id} className="border-slate-50 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all">
                      <TableCell>
                         <span className="font-bold text-xs tabular-nums text-slate-600 dark:text-slate-400">
                            {format(new Date(lead.created_at), 'dd/MM/yy', { locale: ptBR })}
                         </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">{lead.name.toLowerCase()}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{lead.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2 group">
                            <span className="text-xs font-mono text-slate-500">{lead.cpf || '---'}</span>
                            <button onClick={() => copyInfo(lead.cpf || '', 'CPF')} className="opacity-0 group-hover:opacity-100 transition-opacity">
                               <Copy className="w-3 h-3 text-[#002147]" />
                            </button>
                         </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold border-none uppercase tracking-tight">
                          {insuranceTypeLabels[lead.insurance_type] || lead.insurance_type}
                        </Badge>
                      </TableCell>
                      <TableCell><SyncBadge lead={lead} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => window.open(`https://wa.me/55${lead.phone.replace(/\D/g, '')}`, '_blank')} className="h-8 w-8 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
                            <MessageCircle className="w-4 h-4 fill-current" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/leads/${lead.id}`)} className="h-8 w-8 text-slate-400 hover:text-[#002147] hover:bg-[#002147]/10">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
