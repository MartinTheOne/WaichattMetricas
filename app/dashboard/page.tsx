"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, Send, MessageCircle, Users, TrendingUp, Clock } from "lucide-react"
import { MessagesChart } from "@/components/messages-chart"
import { PlanUsageChart } from "@/components/plan-usage-chart"
import { Metrics } from "@/types/Imetric"
import { useState, useEffect } from "react"


// Componente Skeleton para las tarjetas principales
const MainMetricCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-28" />
    </CardContent>
  </Card>
)

// Componente Skeleton para las tarjetas de tiempo
const TimeMetricCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-18" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Componente Skeleton para los gráficos
const ChartCardSkeleton = ({ className }: { className?: string }) => (
  <Card className={className}>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
)

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const cargarMetricas = async () => {
      if (metrics) return; // Evitar recargar si ya tenemos métricas
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if(!data.metrics) {
          setError("No se encontraron métricas disponibles.");
          return;
        }
        setMetrics(data.metrics);
      } catch (err) {
        console.error('Error al cargar métricas del dashboard:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    cargarMetricas();
  }, []);

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <MainMetricCardSkeleton />
            <MainMetricCardSkeleton />
            <MainMetricCardSkeleton />
            <MainMetricCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensajes Restantes</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics!.messagesRemaining.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">de {metrics!.totalMessages.toLocaleString()} disponibles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensajes Enviados</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics!.messagesSent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensajes Recibidos</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics!.messagesReceived.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8% desde el mes pasado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contactos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics!.totalContacts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+25 nuevos esta semana</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Métricas por tiempo */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        {isLoading ? (
          <>
            <TimeMetricCardSkeleton />
            <TimeMetricCardSkeleton />
            <TimeMetricCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Última Hora</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Enviados:</span>
                    <span className="font-medium">{metrics!.lastHour.sent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Recibidos:</span>
                    <span className="font-medium">{metrics!.lastHour.received}</span>
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
                    <span className="font-medium">{metrics!.lastDay.sent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Recibidos:</span>
                    <span className="font-medium">{metrics!.lastDay.received}</span>
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
                    <span className="font-medium">{metrics!.lastWeek.sent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Recibidos:</span>
                    <span className="font-medium">{metrics!.lastWeek.received}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Gráficas */}
      <div className="grid gap-4 xl:grid-cols-7">
        {isLoading ? (
          <>
            <ChartCardSkeleton className="xl:col-span-4" />
            <ChartCardSkeleton className="xl:col-span-3" />
          </>
        ) : (
          <>
            <Card className="xl:col-span-4">
              <CardHeader>
                <CardTitle>Evolución de Mensajes</CardTitle>
                <CardDescription>Mensajes enviados y recibidos en los últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <MessagesChart dailyData={metrics!.dailyData} />
              </CardContent>
            </Card>

            <Card className="xl:col-span-3">
              <CardHeader>
                <CardTitle>Uso del Plan</CardTitle>
                <CardDescription>Mensajes utilizados vs disponibles</CardDescription>
              </CardHeader>
              <CardContent>
                <PlanUsageChart used={metrics!.messagesRemaining} total={metrics!.totalMessages} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}