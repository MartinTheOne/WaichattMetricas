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
        plan_id: editingClient.plan_id
      })
    } else {
      setFormData({})
    }
  }, [editingClient])

  const handleSubmit = () => {
    setLoading(true);
    if (formData.nombre?.trim() && formData.telefono?.trim() && formData.email?.trim() && formData.plan_id) {
      onSubmit(formData)
    }
  }

  const handleClose = () => {
    setFormData({});
    setLoading(false);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingClient ? "Editar Cliente" : "Crear Nuevo Cliente"}</DialogTitle>
          <DialogDescription>
            {editingClient ? "Modifica los datos del cliente" : "Completa los datos para crear un nuevo cliente"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre Completo</Label>
            <Input
              id="nombre"
              value={formData.nombre || ""}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ingresa el nombre completo"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono || ""}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+54 9 11 1234-5678"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="cliente@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mensajes_disponibles">Cantidad de Mensajes</Label>
            <Input
              id="mensajes_disponibles"
              type="number"
              value={formData.mensajes_disponibles || ""}
              onChange={(e) => setFormData({ ...formData, mensajes_disponibles: Number.parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="plan_id">Plan</Label>
            <Select
              value={formData.plan_id?.toString() || ""}
              onValueChange={(value) => setFormData({ ...formData, plan_id: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()}>
                    {plan.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {editingClient ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
