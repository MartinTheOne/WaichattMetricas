export interface ChatwootReportResponse {
    value: number;
    timestamp: number;
}

export interface DatosDiarios {
    fecha: string; // Formato YYYY-MM-DD
    timestamp: number;
    mensajesEnviados: number;
    mensajesRecibidos: number;
}

export interface MetricasResponse {
    // Métricas históricas (desde 2024-12-12)
    totalMensajesEnviadosHistoricos: number;
    totalMensajesRecibidosHistoricos: number;
    totalContactos: number;

    // Métricas de última hora
    mensajesEnviadosUltimaHora: number;
    mensajesRecibidosUltimaHora: number;

    // Métricas de último día
    mensajesEnviadosUltimoDia: number;
    mensajesRecibidosUltimoDia: number;

    // Métricas de última semana
    mensajesEnviadosUltimaSemana: number;
    mensajesRecibidosUltimaSemana: number;

    // Datos diarios de la última semana
    datosDiariosUltimaSemana: DatosDiarios[];

    // Información del cliente
    cliente: {
        plan: string;
        mensajesRestantes: number;
        nombre: string;
    };
}



