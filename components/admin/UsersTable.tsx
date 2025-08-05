"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import type { SystemUser, Client, Role } from "@/types/index"

interface UsersTableProps {
  users: SystemUser[]
  clients: Client[]
  roles: Role[]
  onEdit: (user: SystemUser) => void
  onDelete: (id: number) => void
}

export function UsersTable({ users, clients, roles, onEdit, onDelete }: UsersTableProps) {
  const getRoleName = (id_rol: number) => {
    return roles.find((role) => role.id === id_rol)?.nombre || "Rol no encontrado"
  }

  const getClientName = (id_cliente: number) => {
    return clients.find((client) => client.id === id_cliente)?.nombre_completo || "Cliente no encontrado"
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Url Base</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">#{user.id}</TableCell>
              <TableCell>{user.nombre}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getClientName(user.id_cliente)}</TableCell>
              <TableCell>
                <Badge variant="outline">{getRoleName(user.id_rol)}</Badge>
              </TableCell>
              <TableCell>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{user.url_base}</code>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {onEdit(user)}}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
