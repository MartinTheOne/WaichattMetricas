export interface Metrics {
    plan: string;
    messagesRemaining: number;
    totalMessages: number;
    messagesSent: number;
    messagesReceived: number;
    totalContacts: number;
    lastHour: { sent: number; received: number };
    lastDay: { sent: number; received: number };
    lastWeek: { sent: number; received: number };
    dailyData?: DailyData[]; // Datos diarios opcionales
}

export interface DailyData {
    fecha: string; // Formato YYYY-MM-DD
    timestamp: number;
    mensajesEnviados: number;
    mensajesRecibidos: number;
}