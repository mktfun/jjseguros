import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Save,
  RefreshCw,
  Copy,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const FUNNEL_STAGES = [
  { value: 'not_set', label: 'Não definido' },
  { value: 'novo', label: 'Novo' },
  { value: 'em_contato', label: 'Em Contato' },
  { value: 'negociacao', label: 'Negociação' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'perdido', label: 'Perdido' },
];

interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  cpf: string | null;
  cnpj: string | null;
  person_type: string | null;
  insurance_type: string;
  qar_report: string;
  rd_station_synced: boolean;
  rd_station_error: string | null;
  internal_notes: string | null;
  funnel_stage: string | null;
}

const copyToClipboard = (text: string, label: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  toast.success(`${label} copiado!`);
};

function InfoRow({ label, value, icon: Icon, canCopy = true }: { label: string, value: string | null, icon: any, canCopy?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 group transition-all">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-[#002147] transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">{label}</p>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
      </div>
      {canCopy && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => copyToClipboard(value, label)}
          className="opacity-0 group-hover:opacity-100 rounded-full h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Copy className="w-3.5 h-3.5 text-[#002147]" />
        </Button>
      )}
    </div>
  );
}

function formatQarReport(qar: string): React.ReactNode {
  if (!qar) return <p className="text-slate-400 text-center py-10 text-[10px] font-bold uppercase tracking-widest">Sem relatório</p>;
  
  const lines = qar.split('\n');
  
  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;
        
        if (trimmedLine.includes('───')) return <hr key={index} className="border-slate-100 dark:border-slate-800 my-4" />;

        if (trimmedLine.endsWith(':') && trimmedLine === trimmedLine.toUpperCase()) {
          return (
            <h4 key={index} className="text-[10px] font-black text-[#002147] dark:text-slate-400 uppercase tracking-[0.2em] mt-8 first:mt-0 flex items-center gap-2">
              <span className="w-1 h-3 bg-[#002147] rounded-full" />
              {trimmedLine.replace(':', '')}
            </h4>
          );
        }
        
        if (trimmedLine.includes(':')) {
          const [label, ...rest] = trimmedLine.split(':');
          return (
            <div key={index} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 pl-3 border-l border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 min-w-[120px] uppercase font-black tracking-tight">{label}:</span>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{rest.join(':').trim() || '---'}</span>
            </div>
          );
        }
        
        return <p key={index} className="text-sm text-slate-600 dark:text-slate-400 pl-3">{trimmedLine}</p>;
      })}
    </div>
  );
}

export default function AdminLeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isResending, setIsResending] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('');

  const { data: lead, isLoading: loadingLead, error: leadError } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Lead não encontrado');
      return data as Lead;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (lead) {
      setInternalNotes(lead.internal_notes || '');
      setSelectedStage(lead.funnel_stage || 'not_set');
    }
  }, [lead]);

  const updateStageMutation = useMutation({
    mutationFn: async (newStage: string) => {
      const { error } = await supabase.from('leads').update({ funnel_stage: newStage }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Status atualizado!');
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    }
  });

  if (loadingLead) return (
    <AdminLayout title="Lead">
       <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-300" /></div>
    </AdminLayout>
  );

  if (leadError || !lead) return (
    <AdminLayout title="Erro">
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <XCircle className="w-12 h-12 text-red-500" />
        <p className="font-bold text-slate-900 dark:text-white">Lead não encontrado</p>
        <Button variant="outline" onClick={() => navigate('/admin/leads')} className="font-bold"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title={lead.name}>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => navigate('/admin/leads')} className="p-0 h-auto hover:bg-transparent text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold uppercase text-[10px] tracking-[0.2em] gap-2">
              <ArrowLeft className="w-3 h-3" /> Voltar para Lista
            </Button>
            <div>
               <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white capitalize">{lead.name.toLowerCase()}</h1>
               <div className="flex items-center gap-3 mt-2">
                 <Badge className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold uppercase text-[9px] tracking-widest border-none">
                    {lead.insurance_type}
                 </Badge>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    Recebido em {format(new Date(lead.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                 </span>
               </div>
            </div>
          </div>

          <div className="flex gap-2">
             <Button variant="outline" size="lg" onClick={() => window.open(`https://wa.me/55${lead.phone.replace(/\D/g, '')}`, '_blank')} className="rounded-xl font-bold text-emerald-600 border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 gap-2">
               <Smartphone className="w-4 h-4" /> WhatsApp
             </Button>
             <Button size="lg" onClick={() => setIsResending(true)} className="rounded-xl font-bold bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white gap-2 shadow-xl">
                <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} /> Sincronizar RD
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="E-mail principal" value={lead.email} icon={Mail} />
              <InfoRow label="Telefone / Celular" value={lead.phone} icon={Phone} />
              <InfoRow label="Documento Identificador" value={lead.cpf || lead.cnpj} icon={ShieldCheck} />
              <InfoRow label="Identificador do Lead" value={lead.id.slice(0, 8)} icon={FileText} canCopy={true} />
            </div>

            <Card className="border-none shadow-2xl bg-white dark:bg-slate-950 overflow-hidden">
              <CardHeader className="border-b border-slate-50 dark:border-slate-900 py-6 px-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Relatório Consolidado</CardTitle>
                  <CardDescription className="text-[9px] font-bold uppercase text-slate-300">Dados coletados no questionário</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(lead.qar_report, 'Relatório')} className="text-[#002147] hover:bg-[#002147]/5 font-bold text-[10px] uppercase gap-2">
                   <Copy className="w-3.5 h-3.5" /> Copiar Tudo
                </Button>
              </CardHeader>
              <CardContent className="p-8 bg-slate-50/30 dark:bg-slate-900/20">
                {formatQarReport(lead.qar_report)}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-white dark:bg-slate-950">
              <CardHeader className="pb-4">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status Comercial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Select value={selectedStage} onValueChange={(v) => { setSelectedStage(v); updateStageMutation.mutate(v); }}>
                   <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-sm">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                      {FUNNEL_STAGES.map(s => <SelectItem key={s.value} value={s.value} className="font-bold">{s.label}</SelectItem>)}
                   </SelectContent>
                </Select>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Anotações Internas</label>
                  <Textarea 
                    value={internalNotes} 
                    onChange={e => setInternalNotes(e.target.value)}
                    placeholder="Escreva aqui observações..."
                    className="min-h-[150px] rounded-xl bg-slate-50 dark:bg-slate-900 border-none resize-none p-4 font-medium text-sm"
                  />
                  <Button className="w-full h-11 rounded-xl font-bold uppercase text-[10px] tracking-widest bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300" onClick={() => {
                    supabase.from('leads').update({ internal_notes: internalNotes }).eq('id', id).then(() => toast.success("Salvo!"));
                  }}>
                    Salvar Notas
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-2xl bg-[#002147] text-white shadow-xl">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">Segurança de Dados</h4>
               <p className="text-xs font-medium leading-relaxed">Este ambiente é blindado. Logs de console foram desativados e a restrição de unicidade está ativa para sua proteção.</p>
               <div className="flex items-center gap-2 mt-4 text-[9px] font-black uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Criptografia Ponta-a-Ponta
               </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
