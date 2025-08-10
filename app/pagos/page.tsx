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

const MobilePaymentCardSkeleton = () => (
  <Card aria-busy="true" aria-live="polite">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-40" />
      <div className="pt-2">
        <Skeleton className="h-9 w-28" />
      </div>
    </CardContent>
  </Card>
)

export default function PagosPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<IFacturacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarFacturacion = async () => {
      if (payments.length > 0) return;
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
      <section className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader >
            <div className="flex justify-between">
              <div>
                <CardTitle>Historial de Pagos</CardTitle>
                <CardDescription>Todos los pagos y facturas en un solo lugar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
            {/* Mobile: lista de tarjetas */}
            <div className="md:hidden flex-1 overflow-y-auto px-4 pb-4 space-y-3">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <MobilePaymentCardSkeleton key={i} />)
              ) : payments.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-muted-foreground text-sm">No hay pagos registrados.</p>
                </div>
              ) : (
                payments.map((pago) => (
                  <Card key={pago.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm">AAA-{pago.id < 10 ? "0" : ""}{pago.id}</span>
                        {getStatusBadge(pago.estado)}
                      </div>

                      <div className="text-sm text-muted-foreground">{formatDate(pago.fecha)}</div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Monto</span>
                        <span className="font-medium">{formatAmount(pago.monto)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Plan</span>
                        <span className="font-medium truncate max-w-[60%]">
                          {pago.plan}
                        </span>
                      </div>

                      <div className="pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-center"
                          disabled={pago.estado !== "pagado" || isDownloading}
                          onClick={() => handleDownload(pago)}
                          aria-label={
                            pago.estado === "pagado"
                              ? "Descargar factura"
                              : "Descarga deshabilitada: factura no pagada"
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Descargar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Desktop/Tablet: tabla con header separado */}
            <div className="hidden md:flex md:flex-1 md:flex-col md:overflow-hidden">
              {/* Header fijo de la tabla */}
              <div className="border-b bg-muted/50">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[120px] font-semibold">Factura ID</TableHead>
                      <TableHead className="w-[140px] font-semibold">Fecha</TableHead>
                      <TableHead className="w-[100px] font-semibold">Monto</TableHead>
                      <TableHead className="w-[100px] font-semibold">Estado</TableHead>
                      <TableHead className="w-[100px] font-semibold">Plan</TableHead>
                      <TableHead className="w-[120px] text-center font-semibold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>

              {/* Body con scroll de la tabla */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <Table>
                    <TableBody>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <TableRowSkeleton key={index} />
                      ))}
                    </TableBody>
                  </Table>
                ) : payments.length === 0 ? (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-muted-foreground text-sm">No hay pagos registrados.</p>
                  </div>
                ) : (
                  <Table>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-muted/50">
                          <TableCell className="w-[120px] font-mono text-sm">
                            AAA-{payment.id < 10 ? "0" : ""}
                            {payment.id}
                          </TableCell>
                          <TableCell className="w-[140px] font-medium">{formatDate(payment.fecha)}</TableCell>
                          <TableCell className="w-[100px]">{formatAmount(payment.monto)}</TableCell>
                          <TableCell className="w-[100px]">{getStatusBadge(payment.estado)}</TableCell>
                          <TableCell className="w-[100px]">{payment.plan}</TableCell>
                          <TableCell className="text-center w-[100px]">
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
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}