import obtenerMetricas from "@/lib/obtenerMetricas";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET() {
    const session=await getServerSession(authOptions);
    if(!session)return Response.json({ error: "Unauthorized" }, { status: 401 });
    
    const metricas = await obtenerMetricas();
      if (!metricas) {
        return Response.json({ error: "Error al cargar las métricas" }, { status: 500 });
      }
    
      const metrics = {
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

      return Response.json({ metrics }, { status: 200 });
}