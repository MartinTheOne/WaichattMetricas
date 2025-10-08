"use client"

import { useEffect, useMemo, useState } from "react"
import { DollarSign, Download, SearchIcon, Edit, Trash2, Plus, MoreHorizontal } from 'lucide-react'
import { PaymentForm } from "@/components/admin/ingresos/paymentForm"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { downloadInvoicePDF } from "@/components/admin/ingresos/download-invoice"
import { DeletePaymentDialog } from "@/components/admin/ingresos/delete-payments-dialog"
import { Cliente, Plan, IFacturacion } from '@/types/IFacturacionPage'
import { toast } from "sonner"


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
  return new Date(dateString).toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount)
}
// Skeleton de tarjetas de resumen
const SummaryCardSkeleton = () => (
  <Card aria-busy="true" aria-live="polite">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
)

// Skeleton de la tarjeta "Buscar Pagos"
const SearchCardSkeleton = () => (
  <Card aria-busy="true" aria-live="polite">
    <CardHeader className="pb-3">
      <Skeleton className="h-4 w-28" />
    </CardHeader>
    <CardContent>
      <div className="relative">
        <Skeleton className="absolute left-2 top-2.5 h-4 w-4 rounded" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </CardContent>
  </Card>
)

// Skeleton de filas en tabla (desktop)
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell className="w-[120px]">
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell className="w-[140px]">
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell className="w-[100px]">
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell className="w-[100px]">
      <Skeleton className="h-6 w-16 rounded-full" />
    </TableCell>
    <TableCell className="w-[180px]">
      <Skeleton className="h-4 w-28" />
    </TableCell>
    <TableCell className="w-[140px]">
      <Skeleton className="h-4 w-28" />
    </TableCell>
    <TableCell className="w-[120px] text-center">
      <Skeleton className="h-8 w-24" />
    </TableCell>
  </TableRow>
)

// Skeleton de tarjeta móvil
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
  // Client Component por uso de estado/efectos/interacción [^2]
  const [payments, setPayments] = useState<IFacturacion[]>([])
  const [clients, setCLiente] = useState<Cliente[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingPayment, setEditingPayment] = useState<IFacturacion | null>(null)

  useEffect(() => {
    const cargarFacturacion = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/admin/facturacion-total")
        const data = await response.json()

        setPayments(data.billing || [])
        setCLiente(data.clients || [])
        setPlans(data.plans || [])

      } catch (err) {
        console.error("Error al cargar facturación:", err)
        setError("Error al cargar los datos de facturación")
      } finally {
        setIsLoading(false)
      }
    }
    cargarFacturacion()
  }, [])


  const handleDownload = async (invoice: IFacturacion) => {
    if (invoice.estado !== "pagado") {
      alert("Solo se pueden descargar facturas pagadas")
      return
    }
    setIsDownloading(true)
    try {
      const meta = {
        email: invoice.cliente?.email || "Sin email",
        nombre: invoice.cliente?.nombre || "Sin nombre",
      }
      await downloadInvoicePDF({ ...invoice, facturaId: invoice.id, plan: invoice.plan.nombre }, meta)
    } catch (err) {
      console.error("Error al descargar:", err)
      alert("Error al generar el PDF")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleNewPayment = () => {
    setEditingPayment(null)
    setIsFormOpen(true)
  }

  const handleEditPayment = (payment: IFacturacion) => {
    setEditingPayment(payment)
    setIsFormOpen(true)
  }
  const handleDeletePayment = async (id: number) => {
    if (!id) return toast.error('ID de pago inválido', { position: 'top-center' })

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/facturacion-total?id=${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error(`Error al eliminar el pago`);
      }
      toast.success('Pago eliminado correctamente', { position: 'top-center' })
      setPayments(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar el pago:', error);
      toast.error('Error al eliminar el pago', { position: 'top-center' })
    } finally {
      setLoading(false);
    }
  }

  const handleFormSubmit = async (paymentData: Partial<IFacturacion>) => {
    try {
      if (editingPayment) {
        const response = await fetch('/api/admin/facturacion-total', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPayment.id, ...paymentData })
        })
        if (!response.ok) {
          throw new Error(`Error en la actualización del pago: ${response.statusText}`);
        }
        const data = await response.json();
        toast.success('Pago actualizado correctamente', { position: 'top-center' })
        setPayments(prev => prev.map(p => p.id === editingPayment.id ? { ...p, ...paymentData } as IFacturacion : p));

        console.log('Pago actualizado con ID:', data.id);
      } else {
        try {
          const response = await fetch('/api/admin/facturacion-total', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
          })
          if (!response.ok) {
            throw new Error(`Error en la creación del pago: ${response.statusText}`);
          }

          const data = await response.json();
          toast.success('Pago agregado correctamente', { position: 'top-center' })
          setPayments(prev => [...prev, { id: data.id, cliente: { nombre: clients.find(c => c.id == (paymentData as any).cliente_id)?.nombre }, plan: { nombre: plans.find(p => p.id == (paymentData as any).plan_id)?.nombre }, ...paymentData } as IFacturacion]);
          console.log('Pago creado con ID:', data.id);
        } catch (error) {
          console.error('Error al crear el pago:', error);
        }
      }
    } catch (error) {
      console.error('Error al guardar pago:', error)
    }
    finally {
      setIsFormOpen(false)
      setLoading(false)
    }
  }

  const totalPaid = useMemo(
    () => payments.filter((p) => p.estado === "pagado").reduce((sum, p) => sum + p.monto, 0),
    [payments]
  )

  const filteredPayments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return payments
    return payments.filter((payment) => {
      const facturaId = `AAA-${payment.id < 10 ? "0" : ""}${payment.id}`.toLowerCase()
      const cliente = payment.cliente?.nombre?.toLowerCase?.() || ""
      const monto = formatAmount(payment.monto).toLowerCase()
      const estado = payment.estado.toLowerCase()
      const plan = payment.plan?.nombre?.toLowerCase?.() || ""
      return (
        facturaId.includes(q) ||
        cliente.includes(q) ||
        monto.includes(q) ||
        estado.includes(q) ||
        plan.includes(q)
      )
    })
  }, [payments, searchTerm])

  if (error) {
    return (
      <main className="min-h-screen p-4 md:p-6 lg:p-8">

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="h-screen flex flex-col p-4 md:p-6 lg:p-8 gap-4 overflow-hidden">


      {/* Resumen + Buscar */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <SummaryCardSkeleton />
            <SearchCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(totalPaid)}</div>
                <p className="text-xs text-muted-foreground">En los últimos 12 meses</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Buscar Pagos</CardTitle>
                <CardDescription>Filtra por factura, cliente, monto, estado o plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <SearchIcon
                    className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    placeholder="Buscar por factura, cliente, monto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                    aria-label="Buscar pagos"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </section>

      {/* Historial de pagos */}
      <section className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader >
            <div className="flex justify-between">
              <div>
                <CardTitle>Historial de Pagos</CardTitle>
                <CardDescription>Todos los pagos y facturas en un solo lugar</CardDescription>
              </div>
              <div>
                <Button onClick={handleNewPayment} className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Pago
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
            {/* Mobile: lista de tarjetas */}
            <div className="md:hidden flex-1 overflow-y-auto px-4 pb-4 space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <MobilePaymentCardSkeleton key={i} />)
              ) : filteredPayments.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-muted-foreground text-sm">No hay pagos registrados.</p>
                </div>
              ) : (
                filteredPayments.map((pago) => (
                  <Card key={pago.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm">AAA-{pago.id < 10 ? "0" : ""}{pago.id}</span>
                        {getStatusBadge(pago.estado)}
                      </div>

                      <div className="text-sm text-muted-foreground">{pago.fecha}</div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Monto</span>
                        <span className="font-medium">{formatAmount(pago.monto)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Cliente</span>
                        <span className="font-medium truncate max-w-[60%]">
                          {pago.cliente?.nombre}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Plan</span>
                        <span className="font-medium truncate max-w-[60%]">
                          {pago.plan?.nombre}
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
                      <TableHead className="w-[180px] font-semibold">Cliente</TableHead>
                      <TableHead className="w-[140px] font-semibold">Plan</TableHead>
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
                      {Array.from({ length: 8 }).map((_, index) => (
                        <TableRowSkeleton key={index} />
                      ))}
                    </TableBody>
                  </Table>
                ) : filteredPayments.length === 0 ? (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-muted-foreground text-sm">No hay pagos registrados.</p>
                  </div>
                ) : (
                  <Table>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-muted/50">
                          <TableCell className="w-[120px] font-mono text-sm">
                            AAA-{payment.id < 10 ? "0" : ""}
                            {payment.id}
                          </TableCell>
                          <TableCell className="w-[140px] font-medium">{payment.fecha}</TableCell>
                          <TableCell className="w-[100px]">{formatAmount(payment.monto)}</TableCell>
                          <TableCell className="w-[100px]">{getStatusBadge(payment.estado)}</TableCell>
                          <TableCell className="w-[180px] truncate">{payment.cliente?.nombre}</TableCell>
                          <TableCell className="w-[140px] truncate">{payment.plan?.nombre}</TableCell>
                          <TableCell className="w-[120px] text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditPayment(payment)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DeletePaymentDialog name={payment.cliente.nombre} monto={payment.monto} loading={loading} onDelete={() => handleDeletePayment(payment.id!)}>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onSelect={(e) => e.preventDefault()} // ⬅️ evita que el menú se cierre
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DeletePaymentDialog>
                                <DropdownMenuItem
                                  className="text-green-600"
                                  onSelect={(e) => e.preventDefault()} // ⬅️ evita que el menú se cierre
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={payment.estado !== "pagado" || isDownloading}
                                    onClick={() => handleDownload(payment)}
                                  >
                                    <Download className="" />
                                    Descargar
                                  </Button>
                                </DropdownMenuItem>

                              </DropdownMenuContent>
                            </DropdownMenu>

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
      <PaymentForm
        setLoading={setLoading}
        loading={loading}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingPayment={editingPayment}
        clients={clients} // Pasar la lista de clientes real
        plans={plans} // Pasar la lista de planes real
      />
    </main>
  )
}
