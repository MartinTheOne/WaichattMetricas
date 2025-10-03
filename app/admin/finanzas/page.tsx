"use client"

import { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EgresosTab } from "@/components/finanzas/egresos-tab"
import { ServiciosTab } from "@/components/finanzas/servicios-tab"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Balance {
  totalIngresos: number
  totalEgresos: number
  balance: number
}

interface Servicio {
  id: number
  nombre: string
  tipo: string
  monto_default: number | null
  activo: string
  descripcion: string | null
}

interface Egreso {
  id: number
  fecha: string
  descripcion: string
  monto: number
  estado: string
  servicio_id: number
  servicio: Servicio
}

interface Filters {
  servicio_id: string
  fecha: string
  estado: string
}

export default function FinanzasPage() {
  const [balance, setBalance] = useState<Balance>({
    totalIngresos: 0,
    totalEgresos: 0,
    balance: 0,
  })
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [egresos, setEgresos] = useState<Egreso[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [filters, setFilters] = useState<Filters>({
    servicio_id: "all",
    fecha: "",
    estado: "all",
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      const [balanceRes, serviciosRes, egresosRes] = await Promise.all([
        fetch("/api/admin/balance"),
        fetch("/api/admin/servicios"),
        fetch("/api/admin/egresos"),
      ])

      const balanceData = await balanceRes.json()
      const serviciosData = await serviciosRes.json()
      const egresosData = await egresosRes.json()

      setBalance(balanceData)
      setServicios(serviciosData.servicios || [])
      setEgresos(egresosData.egresos || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshEgresos = async () => {
    try {
      const [egresosRes, balanceRes] = await Promise.all([fetch("/api/admin/egresos"), fetch("/api/admin/balance")])
      const egresosData = await egresosRes.json()
      const balanceData = await balanceRes.json()
      setEgresos(egresosData.egresos || [])
      setBalance(balanceData)
    } catch (error) {
      console.error("Error refreshing egresos:", error)
    }
  }

  const refreshServicios = async () => {
    try {
      const response = await fetch("/api/admin/servicios")
      const data = await response.json()
      setServicios(data.servicios || [])
    } catch (error) {
      console.error("Error refreshing servicios:", error)
    }
  }

  const filteredEgresos = useMemo(() => {
    return egresos.filter((egreso) => {
      if (
        filters.servicio_id &&
        filters.servicio_id !== "all" &&
        egreso.servicio_id.toString() !== filters.servicio_id
      ) {
        return false
      }
      if (filters.fecha && egreso.fecha !== filters.fecha) {
        return false
      }
      if (filters.estado && filters.estado !== "all" && egreso.estado !== filters.estado) {
        return false
      }
      return true
    })
  }, [egresos, filters])

  const filteredBalance = useMemo(() => {
    const totalEgresos = filteredEgresos.reduce((sum, egreso) => sum + egreso.monto, 0)
    return {
      totalIngresos: balance.totalIngresos,
      totalEgresos,
      balance: balance.totalIngresos - totalEgresos,
    }
  }, [filteredEgresos, balance.totalIngresos])

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Finanzas</h1>
            <p className="text-muted-foreground">Gestiona tus ingresos, egresos y servicios</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Ingresos</CardTitle>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ${filteredBalance.totalIngresos.toLocaleString("es-AR")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Pagos recibidos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Egresos</CardTitle>
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ${filteredBalance.totalEgresos.toLocaleString("es-AR")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Gastos registrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${filteredBalance.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    ${filteredBalance.balance.toLocaleString("es-AR")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {filteredBalance.balance >= 0 ? "Superávit" : "Déficit"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="egresos" className="space-y-6">
            <TabsList className="bg-white border border-border">
              <TabsTrigger value="egresos">Finanzas</TabsTrigger>
              <TabsTrigger value="servicios">Servicios</TabsTrigger>
            </TabsList>

            <TabsContent value="egresos">
              <EgresosTab
                egresos={filteredEgresos}
                servicios={servicios}
                isLoading={isLoading}
                onRefresh={refreshEgresos}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </TabsContent>

            <TabsContent value="servicios">
              <ServiciosTab servicios={servicios} isLoading={isLoading} onRefresh={refreshServicios} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
