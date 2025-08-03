"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, Calendar, DollarSign } from "lucide-react"
import { IFacturacion } from "@/types/IFacturacion"
import { downloadInvoicePDF } from "@/components/download-invoice"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

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

// Componente Skeleton para las tarjetas de resumen
const SummaryCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-20 mb-1" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
)

// Componente Skeleton para las filas de la tabla
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    <TableCell className="text-center">
      <Skeleton className="h-8 w-20" />
    </TableCell>
  </TableRow>
)

export default function PagosPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<IFacturacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarFacturacion = async () => {
      if(payments.length > 0) return; 
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/facturacion');
        const data = await response.json();
        console.log('Facturación cargada:', data.facturacion);
        if (!data.facturacion || data.facturacion.length === 0) {
          setError("No se encontraron registros de facturación.");
          return;
        }
        setPayments(data.facturacion);
      } catch (err) {
        console.error('Error al cargar facturación:', err);
        setError('Error al cargar los datos de facturación');
      } finally {
        setIsLoading(false);
      }
    };

    cargarFacturacion();
  }, []);

  const handleDownload = async (invoice: any) => {
    if (invoice.estado !== "pagado") return alert("Solo se pueden descargar facturas pagadas");
    setIsDownloading(true);
    try {
      return downloadInvoicePDF(invoice, { email: session?.user?.email || "Sin email", nombre: session?.user?.name || "Sin nombre" });
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al generar el PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const totalPaid = payments.filter((p) => p.estado === "pagado").reduce((sum, p) => sum + p.monto, 0)
  const nextPayment = payments.find((p) => p.estado === "pendiente")

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Pagos</h2>
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
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pagos</h2>
      </div>

      {/* Resumen de pagos */}
      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
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
                <div className="text-2xl font-bold">{nextPayment ? formatAmount(nextPayment.monto) : "$0.00"}</div>
                <p className="text-xs text-muted-foreground">
                  {nextPayment ? formatDate(nextPayment.fecha) : "No hay pagos pendientes"}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Historial de pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>Todos tus pagos y facturas en un solo lugar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Factura ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))}
                </TableBody>
              </Table>
            ) : payments.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No hay pagos registrados.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Factura ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">AAA-{payment.id < 10 ? '0' : ''}{payment.id}</TableCell>
                      <TableCell className="font-medium">{formatDate(payment.fecha)}</TableCell>
                      <TableCell>{formatAmount(payment.monto)}</TableCell>
                      <TableCell>{getStatusBadge(payment.estado)}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={payment.estado !== "pagado" || isDownloading}
                          onClick={() => handleDownload({ ...payment, facturaId: payment.id })}
                        >
                          <Download className="" />
                          Descargar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}