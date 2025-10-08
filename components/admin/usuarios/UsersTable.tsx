'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, User, Mail, Building, KeyRound, Link, Hash } from 'lucide-react'
import type { SystemUser, Client, Role } from "@/types/index"
import { DeleteUserDialog } from "@/components/admin/usuarios/delete-user-dialog" // Asegúrate de que la ruta sea correcta

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
    return clients.find((client) => client.id === id_cliente)?.nombre || "Cliente no encontrado"
  }

  return (
    <Card className="flex flex-col overflow-hidden rounded-t-none md:h-[600px]">
      {/* Vista de tabla para desktop y pantallas grandes */}
      <div className="hidden md:flex flex-col h-full">
        {/* Header fijo de la tabla */}
        <div className="border-b bg-muted/50 rounded-t-none">
          <Table className="rounded-t-none">
            <TableHeader className="rounded-t-none">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[60px] font-semibold">ID</TableHead>
                <TableHead className="w-[150px] font-semibold">Nombre</TableHead>
                <TableHead className="w-[180px] font-semibold">Email</TableHead>
                <TableHead className="w-[180px] font-semibold">Cliente</TableHead>
                <TableHead className="w-[100px] font-semibold">Rol</TableHead>
                <TableHead className="w-[180px] font-semibold">Url Base</TableHead>
                <TableHead className="w-[100px] font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        {/* Body con scroll de la tabla */}
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell className="w-[60px] font-medium">#{user.id}</TableCell>
                    <TableCell className="w-[150px]">{user.nombre}</TableCell>
                    <TableCell className="w-[180px] truncate" title={user.email}>
                      {user.email}
                    </TableCell>
                    <TableCell className="w-[180px] truncate" title={getClientName(user.id_cliente)}>
                      {getClientName(user.id_cliente)}
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <Badge variant="outline">{getRoleName(user.id_rol)}</Badge>
                    </TableCell>
                    <TableCell className="w-[180px]">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate" title={user.url_base}>
                        {user.url_base.slice(0, 23)}{user.url_base.length > 23 ? '...' : ''}
                      </code>
                    </TableCell>
                    <TableCell className="w-[100px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú de acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { onEdit(user) }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DeleteUserDialog email={user.email} onDelete={() => onDelete(user.id)}>
                            <DropdownMenuItem
                              className="text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DeleteUserDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Vista de tarjetas para móvil y pantallas pequeñas */}
      <div className="md:hidden flex-1 overflow-y-auto p-4 space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No hay usuarios registrados
          </div>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{user.nombre}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menú de acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { onEdit(user) }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DeleteUserDialog email={user.email} onDelete={() => onDelete(user.id)}>
                      <DropdownMenuItem
                        className="text-red-600"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DeleteUserDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center">
                  <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">ID:</span> #{user.id}
                </div>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span> <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center">
                  <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Cliente:</span> <span className="truncate">{getClientName(user.id_cliente)}</span>
                </div>
                <div className="flex items-center">
                  <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Rol:</span> <Badge variant="outline">{getRoleName(user.id_rol)}</Badge>
                </div>
                <div className="flex items-center">
                  <Link className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">URL Base:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate max-w-[calc(100%-80px)]" title={user.url_base}>
                    {user.url_base.slice(0, 23)}{user.url_base.length > 23 ? '...' : ''}
                  </code>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  )
}
