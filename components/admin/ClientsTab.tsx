"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Client, Plan } from "@/types/index"
import { ClientsTable } from "./ClientsTable"
import { ClientForm } from "./ClientForm"

interface ClientsTabProps {
  clients: Client[]
  plans: Plan[]
  isFormOpen: boolean
  editingClient: Client | null
  onOpenForm: (client?: Client) => void
  onCloseForm: () => void
  onSubmit: (client: Partial<Client>) => void
  onDelete: (id: number) => void
}

export function ClientsTab({
  clients,
  plans,
  isFormOpen,
  editingClient,
  onOpenForm,
  onCloseForm,
  onSubmit,
  onDelete,
}: ClientsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Lista de Clientes</h3>
          <p className="text-sm text-gray-600">Gestiona todos los clientes registrados</p>
        </div>
        <Button onClick={() => onOpenForm()} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <ClientsTable clients={clients} plans={plans} onEdit={onOpenForm} onDelete={onDelete} />

      <ClientForm
        isOpen={isFormOpen}
        onClose={onCloseForm}
        onSubmit={onSubmit}
        editingClient={editingClient}
        plans={plans}
      />
    </div>
  )
}
