"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Client, Plan } from "@/types/index"

interface ClientFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (client: Partial<Client>) => void
  editingClient: Client | null
  plans: Plan[]
  loading?: boolean
  setLoading: (loading: boolean) => void
}

export function ClientForm({ isOpen, onClose, onSubmit, editingClient, plans, loading, setLoading }: ClientFormProps) {
  const [formData, setFormData] = useState<Partial<Client>>(editingClient || {})

  useEffect(() => {
    if (editingClient) {
      setFormData({
        id: editingClient.id,
        nombre: editingClient.nombre,
        telefono: editingClient.telefono,
        email: editingClient.email,
        mensajes_disponibles: editingClient.mensajes_disponibles,
        plan_id: editingClient.plan_id,
        estado: editingClient.estado ?? true
      })
    } else {
      setFormData({ estado: true })
    }
  }, [editingClient])

  const handleSubmit = () => {
    if (formData.nombre?.trim() && formData.telefono?.trim() && formData.email?.trim() && formData.plan_id) {
      setLoading(true);
      onSubmit(formData)
    }
  }

  const handleClose = () => {
    setFormData({ estado: true });
    setLoading(false);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{editingClient ? "Editar Cliente" : "Crear Nuevo Cliente"}</DialogTitle>
          <DialogDescription className="text-sm">
            {editingClient ? "Modifica los datos del cliente" : "Completa los datos para crear un nuevo cliente"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre" className="text-sm">Nombre Completo</Label>
            <Input
              id="nombre"
              value={formData.nombre || ""}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ingresa el nombre completo"
              className="text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telefono" className="text-sm">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono || ""}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+54 9 11 1234-5678"
              className="text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="cliente@example.com"
              className="text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mensajes_disponibles" className="text-sm">Cantidad de Mensajes</Label>
            <Input
              id="mensajes_disponibles"
              type="number"
              value={formData.mensajes_disponibles || ""}
              onChange={(e) => setFormData({ ...formData, mensajes_disponibles: Number.parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="plan_id" className="text-sm">Plan</Label>
            <Select
              value={formData.plan_id?.toString() || ""}
              onValueChange={(value) => setFormData({ ...formData, plan_id: Number.parseInt(value) })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Selecciona un plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()} className="text-sm">
                    {plan.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="estado" className="text-sm">Estado</Label>
            <Select
              value={formData.estado !== undefined ? String(formData.estado) : "true"}
              onValueChange={(value) => setFormData({ ...formData, estado: value === "true" })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true" className="text-sm">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    Activo
                  </span>
                </SelectItem>
                <SelectItem value="false" className="text-sm">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                    Inactivo
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto text-sm">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-sm">
            {editingClient ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}