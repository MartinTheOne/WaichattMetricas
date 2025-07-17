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
}