import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';

const supabase = createClient(
    process.env.DATABASE_URL ?? '',
    process.env.PUBLIC_ANON_KEY ?? ''
);


interface ChatwootReportResponse {
    value: number;
    timestamp: number;
}

interface MetricasResponse {
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
}

class ChatwootAPI {
    private baseUrl: string;
    private apiToken: string;
    private accountId: number;

    constructor(baseUrl: string, apiToken: string, accountId: number = 1) {
        this.baseUrl = baseUrl;
        this.apiToken = apiToken;
        this.accountId = accountId;
    }

    private async makeRequest(endpoint: string): Promise<any> {
        const url = endpoint !== '/contacts' ? `${this.baseUrl}/api/v2/accounts/${this.accountId}${endpoint}` : `${this.baseUrl}/api/v1/accounts/${this.accountId}/${endpoint}`;

        const response = await fetch(url, {
            headers: {
                'api_access_token': this.apiToken,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error en la API de Chatwoot: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    private getUnixTimestamp(date: Date): number {
        return Math.floor(date.getTime() / 1000);
    }

    private async obtenerReporte(
        metric: 'incoming_messages_count' | 'outgoing_messages_count',
        since: number,
        until: number
    ): Promise<ChatwootReportResponse[]> {
        const endpoint = `/reports?metric=${metric}&type=account&since=${since}&until=${until}`;
        const response = await this.makeRequest(endpoint);
        return response;
    }

    private async obtenerTotalContactos(): Promise<number> {
        try {
            const endpoint = '/contacts';
            const response = await this.makeRequest(endpoint);

            // Si la respuesta tiene paginación, necesitamos obtener el total
            if (response.meta && response.meta.count) {
                return response.meta.count;
            }

            // Si no hay meta, contar los contactos directamente
            return response.payload ? response.payload.length : 0;
        } catch (error) {
            console.error('Error obteniendo contactos:', error);
            return 0;
        }
    }

    private sumarValoresArray(data: ChatwootReportResponse[]): number {
        return data.reduce((total, item) => total + item.value, 0);
    }

    private obtenerUltimoValor(data: ChatwootReportResponse[]): number {
        if (data.length === 0) return 0;
        return data[data.length - 1].value;
    }

    async obtenerMetricas(): Promise<MetricasResponse> {
        const ahora = new Date();
        const inicioHistorico = new Date('2024-12-12T00:00:00Z');

        // Timestamps para diferentes períodos
        const unixAhora = this.getUnixTimestamp(ahora);
        const unixInicioHistorico = this.getUnixTimestamp(inicioHistorico);

        // Última hora
        const unaHoraAtras = new Date(ahora.getTime() - 60 * 60 * 1000);
        const unixUnaHoraAtras = this.getUnixTimestamp(unaHoraAtras);

        // Último día
        const unDiaAtras = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
        const unixUnDiaAtras = this.getUnixTimestamp(unDiaAtras);

        // Última semana
        const unaSemanaaAtras = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        const unixUnaSemanaAtras = this.getUnixTimestamp(unaSemanaaAtras);

        try {
            // Obtener todas las métricas en paralelo
            const [
                // Métricas históricas
                mensajesEnviadosHistoricos,
                mensajesRecibidosHistoricos,
                totalContactos,

                // Métricas de última hora
                mensajesEnviadosUltimaHora,
                mensajesRecibidosUltimaHora,

                // Métricas de último día
                mensajesEnviadosUltimoDia,
                mensajesRecibidosUltimoDia,

                // Métricas de última semana
                mensajesEnviadosUltimaSemana,
                mensajesRecibidosUltimaSemana,
            ] = await Promise.all([
                // Históricos
                this.obtenerReporte('outgoing_messages_count', unixInicioHistorico, unixAhora),
                this.obtenerReporte('incoming_messages_count', unixInicioHistorico, unixAhora),
                this.obtenerTotalContactos(),

                // Última hora
                this.obtenerReporte('outgoing_messages_count', unixUnaHoraAtras, unixAhora),
                this.obtenerReporte('incoming_messages_count', unixUnaHoraAtras, unixAhora),

                // Último día
                this.obtenerReporte('outgoing_messages_count', unixUnDiaAtras, unixAhora),
                this.obtenerReporte('incoming_messages_count', unixUnDiaAtras, unixAhora),

                // Última semana
                this.obtenerReporte('outgoing_messages_count', unixUnaSemanaAtras, unixAhora),
                this.obtenerReporte('incoming_messages_count', unixUnaSemanaAtras, unixAhora),
            ]);

            return {
                // Métricas históricas
                totalMensajesEnviadosHistoricos: this.sumarValoresArray(mensajesEnviadosHistoricos),
                totalMensajesRecibidosHistoricos: this.sumarValoresArray(mensajesRecibidosHistoricos),
                totalContactos,

                // Métricas de última hora
                mensajesEnviadosUltimaHora: this.sumarValoresArray(mensajesEnviadosUltimaHora),
                mensajesRecibidosUltimaHora: this.sumarValoresArray(mensajesRecibidosUltimaHora),

                // Métricas de último día (último valor del array para el día más reciente)
                mensajesEnviadosUltimoDia: this.obtenerUltimoValor(mensajesEnviadosUltimoDia),
                mensajesRecibidosUltimoDia: this.obtenerUltimoValor(mensajesRecibidosUltimoDia),

                // Métricas de última semana
                mensajesEnviadosUltimaSemana: this.sumarValoresArray(mensajesEnviadosUltimaSemana),
                mensajesRecibidosUltimaSemana: this.sumarValoresArray(mensajesRecibidosUltimaSemana),
            };
        } catch (error) {
            console.error('Error obteniendo métricas:', error);
            throw error;
        }
    }
}

// Función principal para obtener métricas
export async function obtenerMetricas(): Promise<MetricasResponse> {
    const session = await getServerSession();
    if (!session) {
        throw new Error('No hay sesión activa');
    }

    const { data, error } = await supabase.rpc('get_url_and_access_2', {
        id_user: session.user.id
    });
    if (error) {
        console.error('[Supabase error]', error);
        return {
            totalMensajesEnviadosHistoricos: 0,
            totalMensajesRecibidosHistoricos: 0,
            totalContactos: 0,
            mensajesEnviadosUltimaHora: 0,
            mensajesRecibidosUltimaHora: 0,
            mensajesEnviadosUltimoDia: 0,
            mensajesRecibidosUltimoDia: 0,
            mensajesEnviadosUltimaSemana: 0,
            mensajesRecibidosUltimaSemana: 0,
        };
    }
    if (!data || data.length === 0) {
        console.warn('No se encontraron datos de configuración para el usuario');
        return {
            totalMensajesEnviadosHistoricos: 0,
            totalMensajesRecibidosHistoricos: 0,
            totalContactos: 0,
            mensajesEnviadosUltimaHora: 0,
            mensajesRecibidosUltimaHora: 0,
            mensajesEnviadosUltimoDia: 0,
            mensajesRecibidosUltimoDia: 0,
            mensajesEnviadosUltimaSemana: 0,
            mensajesRecibidosUltimaSemana: 0,
        };
    }
    const api = new ChatwootAPI(data.url_base, data.api_access_token, 1);
    return await api.obtenerMetricas();
}


export default obtenerMetricas;
export type { MetricasResponse };