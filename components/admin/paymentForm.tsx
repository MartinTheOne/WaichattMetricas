"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Cliente, IFacturacion, Plan } from '@/types/IFacturacionPage'
import { toast } from "sonner"
// Tipos para el formulario de pagos
interface PaymentFormData {
  id?: number
  cliente_id: number
  plan_id: number
  monto: number
  estado: "pagado" | "pendiente" | "fallido"
  fecha: string
}

interface PaymentFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payment: Partial<PaymentFormData>) => void
  editingPayment: IFacturacion | null
  clients: Cliente[]
  plans: Plan[]
  loading?: boolean
  setLoading: (loading: boolean) => void
}

export function PaymentForm({ isOpen, onClose, onSubmit, editingPayment, clients, plans, loading, setLoading }: PaymentFormProps) {
  const [formData, setFormData] = useState<Partial<PaymentFormData>>({
    estado: "pendiente",
    fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
  })

  useEffect(() => {
    if (editingPayment) {
      setFormData({
        id: editingPayment.id,
        cliente_id: editingPayment.cliente.id,
        plan_id: editingPayment.plan.id,
        monto: editingPayment.monto,
        estado: editingPayment.estado as "pagado" | "pendiente" | "fallido",
        fecha: editingPayment.fecha.split('T')[0], // Convertir a formato YYYY-MM-DD
      })
    } else {
      // Reset form para nuevo pago
      setFormData({
        estado: "pendiente",
        fecha: new Date().toISOString().split('T')[0],
        monto: 0,
        cliente_id: undefined,
        plan_id: undefined,
      })
    }
  }, [editingPayment, isOpen])

  // Actualizar monto cuando se selecciona un plan
  const handlePlanChange = (planId: string) => {
    const selectedPlan = plans.find(plan => plan.id === Number.parseInt(planId))
    setFormData({
      ...formData,
      plan_id: Number.parseInt(planId),
      monto: selectedPlan?.precio || 0
    })
  }

  const handleSubmit = () => {
    // Validación
    setLoading(true)
    const requiredFields = ['cliente_id', 'plan_id', 'monto', 'estado', 'fecha']
    const isValidForm = requiredFields.every(field => {
      const value = formData[field as keyof PaymentFormData]
      return value !== undefined && value !== null && value !== ""
    })

    if (isValidForm && formData.monto! > 0) {
      onSubmit(formData)
    } else {
      const missingFields = requiredFields.filter(field => {
        const value = formData[field as keyof PaymentFormData]
        return value === undefined || value === null || value === ""
      })

      if (formData.monto! <= 0) missingFields.push('monto válido')

      toast.warning(`Por favor completa todos los campos requeridos: ${missingFields.join(', ')}`, { position: "top-center" });
    }
  }

  const handleClose = () => {
    // Reset form data
    setFormData({
      estado: "pendiente",
      fecha: new Date().toISOString().split('T')[0],
      monto: 0,
      cliente_id: undefined,
      plan_id: undefined,
    })
    onClose()
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingPayment ? "Editar Pago" : "Crear Nuevo Pago"}</DialogTitle>
          <DialogDescription>
            {editingPayment ? "Modifica los datos del pago" : "Completa los datos para registrar un nuevo pago"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="cliente_id">Cliente *</Label>
            <Select
              value={formData.cliente_id?.toString() || ""}
              onValueChange={(value) => setFormData({ ...formData, cliente_id: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="plan_id">Plan *</Label>
            <Select
              value={formData.plan_id?.toString() || ""}
              onValueChange={handlePlanChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()}>
                    {(plan as any).nombre} - ${plan.precio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="monto">Monto *</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              min="0"
              value={formData.monto || ""}
              onChange={(e) => setFormData({ ...formData, monto: Number.parseFloat(e.target.value) })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="estado">Estado *</Label>
            <Select
              value={formData.estado || ""}
              onValueChange={(value) => setFormData({ ...formData, estado: value as "pagado" | "pendiente" | "fallido" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="pagado">Pagado</SelectItem>
                <SelectItem value="fallido">Fallido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fecha">Fecha *</Label>
            <Input
              id="fecha"
              type="date"
              value={formData.fecha || ""}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {editingPayment ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
