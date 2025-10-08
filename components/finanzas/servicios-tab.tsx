"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteServicioDialog } from "@/components/admin/egresos/delete-servicio-dialog"

interface Servicio {
  id: number
  nombre: string
  tipo: string
  monto_default: number | null
  activo: string
  descripcion: string | null
}

interface ServiciosTabProps {
  servicios: Servicio[]
  isLoading: boolean
  onRefresh: () => Promise<void>
}

export function ServiciosTab({ servicios, isLoading, onRefresh }: ServiciosTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "fijo",
    monto_default: "",
    activo: "true",
    descripcion: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = "/api/admin/servicios"
      const method = editingServicio ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: editingServicio?.id,
          monto_default: formData.monto_default ? Number.parseFloat(formData.monto_default) : null,
        }),
      })

      if (response.ok) {
        toast.success(editingServicio ? "Servicio actualizado" : "Servicio creado", {
          description: "La operación se realizó correctamente",position:"top-center"
        })
        await onRefresh()
        handleCloseDialog()
      }
    } catch (error) {
      console.error("Error saving servicio:", error)
      toast.error("Error", {
        description: "No se pudo guardar el servicio",position:"top-center"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)

    try {
      const response = await fetch(`/api/admin/servicios?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Servicio eliminado", {
          description: "El servicio se eliminó correctamente",position:"top-center"
        })
        await onRefresh()
      }
    } catch (error) {
      console.error("Error deleting servicio:", error)
      toast.error("Error", {
        description: "No se pudo eliminar el servicio",position:"top-center"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (servicio: Servicio) => {
    setEditingServicio(servicio)
    setFormData({
      nombre: servicio.nombre,
      tipo: servicio.tipo,
      monto_default: servicio.monto_default?.toString() || "",
      activo: servicio.activo,
      descripcion: servicio.descripcion || "",
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingServicio(null)
    setFormData({
      nombre: "",
      tipo: "fijo",
      monto_default: "",
      activo: "true",
      descripcion: "",
    })
  }

  const handleOpenDialog = () => {
    setEditingServicio(null)
    setFormData({
      nombre: "",
      tipo: "fijo",
      monto_default: "",
      activo: "true",
      descripcion: "",
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Servicios</h2>
          <p className="text-sm text-muted-foreground">Administra los servicios disponibles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingServicio ? "Editar Servicio" : "Nuevo Servicio"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del servicio"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fijo">Fijo</SelectItem>
                    <SelectItem value="variable">Variable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.tipo === "fijo" && (
                <div>
                  <Label htmlFor="monto_default">Monto por defecto</Label>
                  <Input
                    id="monto_default"
                    type="number"
                    step="0.01"
                    value={formData.monto_default}
                    onChange={(e) => setFormData({ ...formData, monto_default: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="activo">Estado</Label>
                <Select value={formData.activo} onValueChange={(value) => setFormData({ ...formData, activo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción del servicio"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSaving}>
                  {isSaving ? "Guardando..." : editingServicio ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Monto por defecto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : servicios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay servicios registrados
                </TableCell>
              </TableRow>
            ) : (
              servicios.map((servicio) => (
                <TableRow key={servicio.id}>
                  <TableCell className="font-medium">{servicio.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{servicio.tipo}</Badge>
                  </TableCell>
                  <TableCell>
                    {servicio.monto_default ? `$${servicio.monto_default.toLocaleString("es-AR")}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={servicio.activo === "true" ? "default" : "secondary"}>
                      {servicio.activo === "true" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{servicio.descripcion || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(servicio)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <DeleteServicioDialog
                        onDelete={() => handleDelete(servicio.id)}
                        nombre={servicio.nombre}
                        loading={deletingId === servicio.id}
                      >
                        <Button variant="ghost" size="icon" disabled={deletingId === servicio.id}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </DeleteServicioDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
