"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteEgresoDialog } from "@/components/admin/egresos/delete-egreso-dialog"

interface Servicio {
  id: number
  nombre: string
  tipo: string
  monto_default: number | null
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

interface EgresosTabProps {
  egresos: Egreso[]
  servicios: Servicio[]
  isLoading: boolean
  onRefresh: () => Promise<void>
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export function EgresosTab({ egresos, servicios, isLoading, onRefresh, filters, onFiltersChange }: EgresosTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEgreso, setEditingEgreso] = useState<Egreso | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    fecha: "",
    descripcion: "",
    monto: "",
    estado: "pendiente",
    servicio_id: "",
    moneda: "ARS",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = "/api/admin/egresos"
      const method = editingEgreso ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: editingEgreso?.id,
          monto: Number.parseFloat(formData.monto),
          servicio_id: Number.parseInt(formData.servicio_id),
        }),
      })

      if (response.ok) {
        toast.success(editingEgreso ? "Egreso actualizado" : "Egreso creado", {
          description: "La operación se realizó correctamente",position:"top-center"
        })
        await onRefresh()
        handleCloseDialog()
      }
    } catch (error) {
      console.error("Error saving egreso:", error)
      toast.error("Error", {
        description: "No se pudo guardar el egreso",position:"top-center"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)

    try {
      const response = await fetch(`/api/admin/egresos?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Egreso eliminado", {
          description: "El egreso se eliminó correctamente",position:"top-center"
        })
        await onRefresh()
      }
    } catch (error) {
      console.error("Error deleting egreso:", error)
      toast.error("Error", {
        description: "No se pudo eliminar el egreso",position:"top-center"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (egreso: Egreso) => {
    setEditingEgreso(egreso)
    setFormData({
      fecha: egreso.fecha,
      descripcion: egreso.descripcion || "",
      monto: egreso.monto.toString(),
      estado: egreso.estado,
      servicio_id: egreso.servicio_id.toString(),
      moneda: "ARS",
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingEgreso(null)
    setFormData({
      fecha: "",
      descripcion: "",
      monto: "",
      estado: "pendiente",
      servicio_id: "",
      moneda: "ARS",
    })
  }

  const handleOpenDialog = () => {
    setEditingEgreso(null)
    setFormData({
      fecha: "",
      descripcion: "",
      monto: "",
      estado: "pendiente",
      servicio_id: "",
      moneda: "ARS",
    })
    setIsDialogOpen(true)
  }

  const handleClearFilters = () => {
    onFiltersChange({
      servicio_id: "all",
      fecha: "",
      estado: "all",
    })
  }

  const hasActiveFilters =
    (filters.servicio_id && filters.servicio_id !== "all") ||
    filters.fecha ||
    (filters.estado && filters.estado !== "all")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Egresos</h2>
          <p className="text-sm text-muted-foreground">Gestiona tus gastos y servicios</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Egreso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEgreso ? "Editar Egreso" : "Nuevo Egreso"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="servicio_id">Servicio</Label>
                <Select
                  value={formData.servicio_id}
                  onValueChange={(value) => setFormData({ ...formData, servicio_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.map((servicio) => (
                      <SelectItem key={servicio.id} value={servicio.id.toString()}>
                        {servicio.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción del egreso"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monto">Monto</Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="moneda">Moneda</Label>
                  <Select
                    value={formData.moneda}
                    onValueChange={(value) => setFormData({ ...formData, moneda: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">ARS</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="pagado">Pagado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSaving}>
                  {isSaving ? "Guardando..." : editingEgreso ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Filtros</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="w-4 h-4 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="filter-servicio">Servicio</Label>
            <Select
              value={filters.servicio_id || "all"}
              onValueChange={(value) => onFiltersChange({ ...filters, servicio_id: value })}
            >
              <SelectTrigger id="filter-servicio">
                <SelectValue placeholder="Todos los servicios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los servicios</SelectItem>
                {servicios.map((servicio) => (
                  <SelectItem key={servicio.id} value={servicio.id.toString()}>
                    {servicio.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filter-fecha">Fecha</Label>
            <Input
              id="filter-fecha"
              type="date"
              value={filters.fecha}
              onChange={(e) => onFiltersChange({ ...filters, fecha: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="filter-estado">Estado</Label>
            <Select
              value={filters.estado || "all"}
              onValueChange={(value) => onFiltersChange({ ...filters, estado: value })}
            >
              <SelectTrigger id="filter-estado">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="pagado">Pagado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Servicio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
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
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : egresos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {hasActiveFilters
                    ? "No se encontraron egresos con los filtros aplicados"
                    : "No hay egresos registrados"}
                </TableCell>
              </TableRow>
            ) : (
              egresos.map((egreso) => (
                <TableRow key={egreso.id}>
                  <TableCell className="font-medium">{egreso.servicio?.nombre}</TableCell>
                  <TableCell>{egreso.fecha}</TableCell>
                  <TableCell>{egreso.descripcion}</TableCell>
                  <TableCell>${egreso.monto.toLocaleString("es-AR")}</TableCell>
                  <TableCell>
                    <Badge variant={egreso.estado === "pagado" ? "default" : "secondary"}>{egreso.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(egreso)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <DeleteEgresoDialog
                        onDelete={() => handleDelete(egreso.id)}
                        descripcion={egreso.descripcion || "Sin descripción"}
                        loading={deletingId === egreso.id}
                      >
                        <Button variant="ghost" size="icon" disabled={deletingId === egreso.id}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </DeleteEgresoDialog>
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
