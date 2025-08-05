"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SystemUser, Client, Role } from "@/types/index"

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (user: Partial<SystemUser>) => void
  editingUser: SystemUser | null
  clients: Client[]
  roles: Role[]
}

export function UserForm({ isOpen, onClose, onSubmit, editingUser, clients, roles }: UserFormProps) {
  const [formData, setFormData] = useState<Partial<SystemUser>>({ 
    url_base: "https://app.waichatt.com/api/v2/accounts/id_cuenta" 
  })

  useEffect(() => {
    if (editingUser) {
      setFormData({
        id: editingUser.id,
        email: editingUser.email,
        nombre: editingUser.nombre,
        password: "", // Password should not be pre-filled for security reasons
        id_cliente: editingUser.id_cliente,
        id_rol: editingUser.id_rol,
        url_base: editingUser.url_base || "https://app.waichatt.com/api/v2/accounts/id_cuenta",
        api_access_token: editingUser.api_access_token || "",
      })
    } else {
      // Reset form for new user
      setFormData({ 
        url_base: "https://app.waichatt.com/api/v2/accounts/id_cuenta",
        password: "",
        email: "",
        nombre: "",
        api_access_token: "",
        id_cliente: undefined,
        id_rol: undefined
      })
    }
  }, [editingUser, isOpen]) // Agregué isOpen como dependencia

  const handleSubmit = () => {
    // Validación mejorada
    const requiredFields = ['email', 'nombre', 'id_cliente', 'id_rol', 'url_base', 'api_access_token']
    const isValidForm = requiredFields.every(field => {
      const value = formData[field as keyof SystemUser]?.toString().trim()
      return value !== undefined && value !== null && value !== ""
    })

    // Para usuarios nuevos, también validar password
    const isPasswordValid = editingUser ? true : (formData.password && formData.password.trim() !== "")

    if (isValidForm && isPasswordValid) {
      console.log('Submitting form data:', formData)
      onSubmit(formData)
      
      // Reset form y cerrar modal
      setFormData({ 
        url_base: "https://app.waichatt.com/api/v2/accounts/id_cuenta",
        password: "",
        email: "",
        nombre: "",
        api_access_token: "",
        id_cliente: undefined,
        id_rol: undefined
      })
      onClose()
    } else {
      // Mostrar qué campos faltan
      const missingFields = requiredFields.filter(field => {
        const value = formData[field as keyof SystemUser]
        return value === undefined || value === null || value === ""
      })
      
      if (!isPasswordValid) missingFields.push('password')
      
      console.error('Campos requeridos faltantes:', missingFields)
      alert(`Por favor completa todos los campos requeridos: ${missingFields.join(', ')}`)
    }
  }

  const handleClose = () => {
    // Reset form data
    setFormData({ 
      url_base: "https://app.waichatt.com/api/v2/accounts/id_cuenta",
      password: "",
      email: "",
      nombre: "",
      api_access_token: "",
      id_cliente: undefined,
      id_rol: undefined
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {editingUser ? "Modifica los datos del usuario" : "Completa los datos para crear un nuevo usuario"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="user_nombre">Nombre *</Label>
            <Input
              id="user_nombre"
              value={formData.nombre || ""}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre del usuario"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user_email">Email *</Label>
            <Input
              id="user_email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user_password">Contraseña {!editingUser && '*'}</Label>
            <Input
              id="user_password"
              type="password"
              value={formData.password || ""}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? "Dejar vacío para mantener actual" : "Contraseña segura"}
              required={!editingUser}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url_base">URL Base *</Label>
            <Input
              id="url_base"
              value={formData.url_base || ""}
              onChange={(e) => setFormData({ ...formData, url_base: e.target.value })}
              placeholder="https://app.waichatt.com/api/v2/accounts/id_cuenta"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="api_access_token">API Access Token *</Label>
            <Input
              id="api_access_token"
              value={formData.api_access_token || ""}
              onChange={(e) => setFormData({ ...formData, api_access_token: e.target.value })}
              placeholder="API Access Token"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="id_cliente">Cliente *</Label>
            <Select
              value={formData.id_cliente?.toString() || ""}
              onValueChange={(value) => setFormData({ ...formData, id_cliente: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.nombre_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="id_rol">Rol *</Label>
            <Select
              value={formData.id_rol?.toString() || ""}
              onValueChange={(value) => setFormData({ ...formData, id_rol: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.nombre}
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
            {editingUser ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}