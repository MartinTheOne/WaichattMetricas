"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Send, MessageCircle, Users, TrendingUp, Clock } from "lucide-react"
import { MessagesChart } from "@/components/messages-chart"
import { PlanUsageChart } from "@/components/plan-usage-chart"
import { useSession } from "next-auth/react"
import { Metrics } from "@/types/Imetric"
// Datos simulados

interface DashboardPageProps {
    metrics: Metrics;
}
const metricsaa = {
  plan: "Plan Pro",
  messagesRemaining: 2500,
  totalMessages: 5000,
  messagesSent: 1250,
  messagesReceived: 980,
  totalContacts: 450,
  lastHour: { sent: 45, received: 32 },
  lastDay: { sent: 320, received: 280 },
  lastWeek: { sent: 1250, received: 980 },
}

export default function DashboardPage({metrics}:DashboardPageProps) {

  const { data: session } = useSession()
  console.log("Session data:", session)
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes Restantes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.messagesRemaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">de {metrics.totalMessages.toLocaleString()} disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes Enviados</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.messagesSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes Recibidos</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.messagesReceived.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contactos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalContacts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+25 nuevos esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas por tiempo */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Hora</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Enviados:</span>
                <span className="font-medium">{metrics.lastHour.sent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Recibidos:</span>
                <span className="font-medium">{metrics.lastHour.received}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Día</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Enviados:</span>
                <span className="font-medium">{metrics.lastDay.sent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Recibidos:</span>
                <span className="font-medium">{metrics.lastDay.received}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Enviados:</span>
                <span className="font-medium">{metrics.lastWeek.sent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Recibidos:</span>
                <span className="font-medium">{metrics.lastWeek.received}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid gap-4 xl:grid-cols-7">
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Evolución de Mensajes</CardTitle>
            <CardDescription>Mensajes enviados y recibidos en los últimos 7 días</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <MessagesChart />
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Uso del Plan</CardTitle>
            <CardDescription>Mensajes utilizados vs disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <PlanUsageChart used={metrics.messagesSent + metrics.messagesReceived} total={metrics.totalMessages} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
