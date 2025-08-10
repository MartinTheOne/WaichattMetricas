"use client"

import { useState,useEffect } from "react"
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
}

export function ClientForm({ isOpen, onClose, onSubmit, editingClient, plans }: ClientFormProps) {
  const [formData, setFormData] = useState<Partial<Client>>(editingClient || {})

  useEffect(() => {
    if (editingClient) {
      setFormData({
        id: editingClient.id,
        nombre_completo: editingClient.nombre_completo,
        telefono: editingClient.telefono,
        email: editingClient.email,
        cantidad_mensajes: editingClient.cantidad_mensajes,
        id_plan: editingClient.id_plan
      })
    } else {
      setFormData({})
    }
  }, [editingClient])

  const handleSubmit = () => {
    if (formData.nombre_completo?.trim() && formData.telefono?.trim() && formData.email?.trim() && formData.id_plan) {
      onSubmit(formData)
    }
  }

  const handleClose = () => {
    setFormData({})
    onClose()
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
            <Label htmlFor="nombre_completo">Nombre Completo</Label>
            <Input
              id="nombre_completo"
              value={formData.nombre_completo || ""}
              onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
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
            <Label htmlFor="cantidad_mensajes">Cantidad de Mensajes</Label>
            <Input
              id="cantidad_mensajes"
              type="number"
              value={formData.cantidad_mensajes || ""}
              onChange={(e) => setFormData({ ...formData, cantidad_mensajes: Number.parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="id_plan">Plan</Label>
            <Select
              value={formData.id_plan?.toString() || ""}
              onValueChange={(value) => setFormData({ ...formData, id_plan: Number.parseInt(value) })}
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
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            {editingClient ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
