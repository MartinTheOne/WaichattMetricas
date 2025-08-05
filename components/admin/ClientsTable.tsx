"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import type { Client, Plan } from "@/types/index"

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
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mensajes</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">#{client.id}</TableCell>
              <TableCell>{client.nombre_completo}</TableCell>
              <TableCell>{client.telefono}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{client.cantidad_mensajes.toLocaleString()}</Badge>
              </TableCell>
              <TableCell>
                <Badge className="bg-green-100 text-green-800">{getPlanName(client.id_plan)}</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(client)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(client.id)} className="text-red-600">
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
