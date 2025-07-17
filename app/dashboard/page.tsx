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
    plan: 'Plan Pro',
    messagesRemaining: 20500,
    totalMessages: 5000,
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
  };

  return <DashboardPage metrics={metrics} />;
}