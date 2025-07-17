import obtenerMetricas from "@/lib/obtenerMetricas";
import DashboardPage from "./dashboard";
import { Metrics } from "@/types/Imetric"

export default async function Dashboard() {
  const metricas = await obtenerMetricas();
  if (!metricas) {
    return <div>Error al cargar las métricas</div>;
  }

  // Map metricas (MetricasResponse) to Metrics type
  const metrics: Metrics = {
    plan: metricas.cliente.plan,
    messagesRemaining: metricas.cliente.mensajesRestantes,
    totalMessages: metricas.cliente.plan==='Plan Inicial' ? 1000 : metricas.cliente.plan==='Plan Pro' ? 5000 : 14000,
    messagesSent: metricas.totalMensajesEnviadosHistoricos,
    messagesReceived: metricas.totalMensajesRecibidosHistoricos,
    totalContacts: metricas.totalContactos,
    lastHour: {
      sent: metricas.mensajesEnviadosUltimaHora,
      received: metricas.mensajesRecibidosUltimaHora,
    },
    lastDay: {
      sent: metricas.mensajesEnviadosUltimoDia,
      received: metricas.mensajesRecibidosUltimoDia,
    },
    lastWeek: {
      sent: metricas.mensajesEnviadosUltimaSemana,
      received: metricas.mensajesRecibidosUltimaSemana,
    },
    dailyData: metricas.datosDiariosUltimaSemana.map(dia => ({
      fecha: dia.fecha,
      timestamp: dia.timestamp,
      mensajesEnviados: dia.mensajesEnviados,
      mensajesRecibidos: dia.mensajesRecibidos,
    })),
  };

  return <DashboardPage metrics={metrics} />;
}