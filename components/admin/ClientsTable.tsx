'use client'

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import type { Client, Plan } from "@/types/index"
import { DeleteClientDialog } from "@/components/delete-client-dialog"

interface ClientsTableProps {
  clients: Client[]
  plans: Plan[]
  onEdit: (client: Client) => void
  onDelete: (id: number) => void
}

export function ClientsTable({ clients, plans, onEdit, onDelete }: ClientsTableProps) {
  const getPlanName = (id_plan: number) => {
    return plans.find((plan) => plan.id === id_plan)?.nombre || "Plan no encontrado"
  }

  return (
    <Card className="flex flex-col overflow-hidden rounded-t-none md:h-[600px] ">
      {/* Vista de tabla para desktop y pantallas grandes */}
      <div className="hidden md:flex flex-col h-full">
        {/* Encabezado fijo de la tabla */}
        <div className="border-b bg-muted/50">
          <Table className="rounded-t-none">
            <TableHeader className="rounded-t-none">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[80px] font-semibold rounded-tl-none">ID</TableHead>
                <TableHead className="w-[200px] font-semibold">Nombre Completo</TableHead>
                <TableHead className="w-[140px] font-semibold">Teléfono</TableHead>
                <TableHead className="w-[200px] font-semibold">Email</TableHead>
                <TableHead className="w-[100px] font-semibold">Mensajes</TableHead>
                <TableHead className="w-[150px] font-semibold">Plan</TableHead>
                <TableHead className="w-[100px] font-semibold rounded-tr-none">Acciones</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        {/* Cuerpo con scroll de la tabla */}
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No hay clientes registrados
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell className="w-[80px] font-medium">#{client.id}</TableCell>
                    <TableCell className="w-[200px]">{client.nombre_completo}</TableCell>
                    <TableCell className="w-[140px]">{client.telefono}</TableCell>
                    <TableCell className="w-[200px] truncate" title={client.email}>
                      {client.email}
                    </TableCell>
                    <TableCell className="w-[100px]">
                      <Badge variant="secondary">{client.cantidad_mensajes.toLocaleString()}</Badge>
                    </TableCell>
                    <TableCell className="w-[150px]">
                      <Badge className="bg-green-100 text-green-800">{getPlanName(client.id_plan)}</Badge>
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
                          <DropdownMenuItem onClick={() => onEdit(client)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DeleteClientDialog name={client.nombre_completo} onDelete={() => onDelete(client.id)}>
                            <DropdownMenuItem
                              className="text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DeleteClientDialog>
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

      <div className="md:hidden overflow-y-auto px-4 space-y-3 ">
        {clients.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-muted-foreground text-sm">No hay clientes registrados</p>
          </div>
        ) : (
          clients.map((client) => (
            <Card key={client.id}>
              <CardContent className="p-4 space-y-2 ">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-lg">{client.nombre_completo}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú de acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(client)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DeleteClientDialog name={client.nombre_completo} onDelete={() => onDelete(client.id)}>
                        <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DeleteClientDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="text-sm text-muted-foreground">ID: #{client.id}</div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Teléfono</span>
                  <span className="font-medium">{client.telefono}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="font-medium truncate max-w-[60%]" title={client.email}>
                    {client.email}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mensajes</span>
                  <Badge variant="secondary">{client.cantidad_mensajes.toLocaleString()}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <Badge className="bg-green-100 text-green-800">{getPlanName(client.id_plan)}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Card>
  )
}
