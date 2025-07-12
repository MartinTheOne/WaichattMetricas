"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, CreditCard, Calendar, DollarSign } from "lucide-react"

// Datos simulados de pagos
const payments = [
  {
    id: "1",
    date: "2024-01-15",
    amount: 79.0,
    method: "Tarjeta •••• 4242",
    status: "pagado",
    invoice: "INV-2024-001",
  },
  {
    id: "2",
    date: "2023-12-15",
    amount: 79.0,
    method: "Tarjeta •••• 4242",
    status: "pagado",
    invoice: "INV-2023-012",
  },
  {
    id: "3",
    date: "2023-11-15",
    amount: 79.0,
    method: "Tarjeta •••• 4242",
    status: "pagado",
    invoice: "INV-2023-011",
  },
  {
    id: "4",
    date: "2023-10-15",
    amount: 29.0,
    method: "Tarjeta •••• 4242",
    status: "pagado",
    invoice: "INV-2023-010",
  },
  {
    id: "5",
    date: "2024-02-15",
    amount: 79.0,
    method: "Tarjeta •••• 4242",
    status: "pendiente",
    invoice: "INV-2024-002",
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pagado":
      return <Badge className="bg-green-100 text-green-800">Pagado</Badge>
    case "pendiente":
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
    case "fallido":
      return <Badge className="bg-red-100 text-red-800">Fallido</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export default function PagosPage() {
  const totalPaid = payments.filter((p) => p.status === "pagado").reduce((sum, p) => sum + p.amount, 0)

  const nextPayment = payments.find((p) => p.status === "pendiente")

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pagos</h2>
      </div>

      {/* Resumen de pagos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">En los últimos 12 meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Pago</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nextPayment ? formatAmount(nextPayment.amount) : "$0.00"}</div>
            <p className="text-xs text-muted-foreground">
              {nextPayment ? formatDate(nextPayment.date) : "No hay pagos pendientes"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Método de Pago</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">•••• 4242</div>
            <p className="text-xs text-muted-foreground">Visa terminada en 4242</p>
          </CardContent>
        </Card>
      </div>

      {/* Historial de pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>Todos tus pagos y facturas en un solo lugar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Factura</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{formatDate(payment.date)}</TableCell>
                    <TableCell>{formatAmount(payment.amount)}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="font-mono text-sm">{payment.invoice}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled={payment.status !== "pagado"}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información de Facturación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Dirección de Facturación</h4>
              <p className="text-sm text-muted-foreground">
                Empresa Waichatt
                <br />
                Calle Principal 123
                <br />
                Ciudad, Estado 12345
                <br />
                País
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Email de Facturación</h4>
              <p className="text-sm text-muted-foreground">facturacion@waichatt.com</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Pagos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Facturación Automática</h4>
                <p className="text-sm text-muted-foreground">Se cobra automáticamente cada mes</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Activa</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Notificaciones por Email</h4>
                <p className="text-sm text-muted-foreground">Recibe recordatorios de pago</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Activa</Badge>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Actualizar Método de Pago
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
