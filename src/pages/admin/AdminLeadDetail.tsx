import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, RefreshCw, User, Mail, Phone, Building, FileText, CheckCircle, XCircle, Clock, Send, Webhook } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const insuranceTypeLabels: Record<string, string> = {
  auto: "Automóvel",
  residential: "Residencial",
  life: "Vida",
  business: "Empresarial",
  travel: "Viagem",
  health: "Saúde",
  endorsement: "Endosso",
};

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
  sync_confirmed_at: string | null;
  funnel_name: string | null;
  funnel_stage: string | null;
  custom_fields: Record<string, unknown>;
}

interface IntegrationLog {
  id: string;
  created_at: string;
  service_name: string;
  status: string;
  error_message: string | null;
  payload: Record<string, unknown> | null;
  response: Record<string, unknown> | null;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  status: "success" | "error" | "pending";
  icon: React.ReactNode;
}

// Formata o QAR report para exibição legível
function formatQarReport(qar: string): React.ReactNode {
  if (!qar) return <p className="text-muted-foreground">Sem dados do QAR</p>;

  // Divide por linhas e formata
  const lines = qar.split("\n").filter(line => line.trim());
  
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        // Detecta se é um título/pergunta (geralmente termina com :)
        const isQuestion = line.includes(":") && !line.startsWith("-");
        const [label, ...valueParts] = line.split(":");
        const value = valueParts.join(":").trim();

        if (isQuestion && value) {
          return (
            <div key={index} className="py-1">
              <span className="font-semibold text-foreground">{label}:</span>{" "}
              <span className="text-muted-foreground">{value}</span>
            </div>
          );
        }

        // Detecta separadores ou títulos de seção
        if (line.startsWith("===") || line.startsWith("---")) {
          return <hr key={index} className="my-3 border-border" />;
        }

        // Detecta títulos em maiúsculas ou com emojis
        if (line === line.toUpperCase() && line.length > 3) {
          return (
            <h4 key={index} className="font-bold text-foreground mt-4 mb-2">
              {line}
            </h4>
          );
        }

        return (
          <p key={index} className="text-muted-foreground">
            {line}
          </p>
        );
      })}
    </div>
  );
}

// Componente Timeline
function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">Nenhum evento registrado</p>
    );
  }

  return (
    <div className="relative">
      {/* Linha vertical */}
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />

      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex gap-4">
            {/* Ponto do timeline */}
            <div
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                event.status === "success"
                  ? "border-green-500 bg-green-500/10 text-green-500"
                  : event.status === "error"
                  ? "border-red-500 bg-red-500/10 text-red-500"
                  : "border-muted-foreground bg-muted text-muted-foreground"
              }`}
            >
              {event.icon}
            </div>

            {/* Conteúdo do evento */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{event.title}</h4>
                <Badge
                  variant={
                    event.status === "success"
                      ? "default"
                      : event.status === "error"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {event.status === "success"
                    ? "Sucesso"
                    : event.status === "error"
                    ? "Erro"
                    : "Pendente"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {event.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(event.timestamp), "dd/MM/yyyy 'às' HH:mm:ss", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminLeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  // Fetch lead data
  const { data: lead, isLoading: isLoadingLead, error: leadError } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Lead;
    },
    enabled: !!id,
  });

  // Fetch integration logs
  const { data: logs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["lead-logs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_logs")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as IntegrationLog[];
    },
    enabled: !!id,
  });

  // Build timeline events
  const timelineEvents: TimelineEvent[] = [];

  if (lead) {
    // Evento de criação do lead
    timelineEvents.push({
      id: "lead-created",
      timestamp: lead.created_at,
      title: "Lead Criado",
      description: `Formulário de ${insuranceTypeLabels[lead.insurance_type] || lead.insurance_type} preenchido`,
      status: "success",
      icon: <User className="h-4 w-4" />,
    });
  }

  if (logs) {
    logs.forEach((log) => {
      const isSuccess = log.status === "success";
      let title = "Evento de Integração";
      let description = log.error_message || "Operação concluída";
      let icon = <Send className="h-4 w-4" />;

      if (log.service_name === "rd-station") {
        title = "Envio RD Station";
        description = isSuccess
          ? "Dados enviados com sucesso para o RD Station"
          : `Erro: ${log.error_message || "Falha no envio"}`;
        icon = <Send className="h-4 w-4" />;
      } else if (log.service_name === "rd-webhook") {
        title = "Webhook de Confirmação";
        description = isSuccess
          ? "Confirmação recebida do RD Station"
          : `Erro: ${log.error_message || "Falha na confirmação"}`;
        icon = <Webhook className="h-4 w-4" />;
      }

      timelineEvents.push({
        id: log.id,
        timestamp: log.created_at,
        title,
        description,
        status: isSuccess ? "success" : "error",
        icon,
      });
    });
  }

  // Adiciona evento pendente se não sincronizado
  if (lead && !lead.rd_station_synced && !logs?.some(l => l.service_name === "rd-station")) {
    timelineEvents.push({
      id: "pending-sync",
      timestamp: new Date().toISOString(),
      title: "Aguardando Sincronização",
      description: "Lead ainda não foi enviado para o RD Station",
      status: "pending",
      icon: <Clock className="h-4 w-4" />,
    });
  }

  // Ordena por timestamp
  timelineEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Função para reenviar para RD Station
  const handleResend = async () => {
    if (!lead) return;

    setIsResending(true);
    try {
      const payload = {
        contact: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          ...(lead.cpf && { cf_cpf: lead.cpf }),
          ...(lead.cnpj && { cf_cnpj: lead.cnpj }),
        },
        customFields: lead.custom_fields,
        funnelData: {
          funnel_name: lead.funnel_name || "default",
          funnel_stage: lead.funnel_stage || "Lead",
        },
        qarReport: lead.qar_report,
        insuranceType: lead.insurance_type,
      };

      const { data, error } = await supabase.functions.invoke("rd-station", {
        body: payload,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Lead reenviado para o RD Station com sucesso.",
      });

      // Refresh data
      window.location.reload();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao reenviar:", error);
      toast({
        title: "Erro ao reenviar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (leadError) {
    return (
      <AdminLayout title="Erro">
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">Erro ao carregar lead: {leadError.message}</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/leads")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={lead?.name || "Detalhes do Lead"}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/leads")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isLoadingLead ? <Skeleton className="h-8 w-48" /> : lead?.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLoadingLead ? (
                  <Skeleton className="h-4 w-32 mt-1" />
                ) : (
                  `Lead de ${insuranceTypeLabels[lead?.insurance_type || ""] || lead?.insurance_type}`
                )}
              </p>
            </div>
          </div>

          <Button onClick={handleResend} disabled={isResending || isLoadingLead}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isResending ? "animate-spin" : ""}`} />
            {isResending ? "Reenviando..." : "Reenviar para RD"}
          </Button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Lead Info & QAR */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Lead
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingLead ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : lead ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{lead.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Telefone</p>
                        <p className="font-medium">{lead.phone}</p>
                      </div>
                    </div>

                    {lead.cpf && (
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">CPF</p>
                          <p className="font-medium">{lead.cpf}</p>
                        </div>
                      </div>
                    )}

                    {lead.cnpj && (
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">CNPJ</p>
                          <p className="font-medium">{lead.cnpj}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Tipo de Seguro</p>
                        <Badge variant="outline">
                          {insuranceTypeLabels[lead.insurance_type] || lead.insurance_type}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {lead.rd_station_synced ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Status RD</p>
                        <Badge variant={lead.rd_station_synced ? "default" : "destructive"}>
                          {lead.rd_station_synced ? "Sincronizado" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* QAR Report Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Questionário de Avaliação de Risco (QAR)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingLead ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                    {formatQarReport(lead?.qar_report || "")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico de Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingLead || isLoadingLogs ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-full mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Timeline events={timelineEvents} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
