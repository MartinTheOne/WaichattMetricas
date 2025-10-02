'use client'

import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import type { Client, Plan } from "@/types/index"
import { ClientsTable } from "../admin/ClientsTable"
import { ClientForm } from "../admin/ClientForm"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface ClientsTabProps {
  clients: Client[]
  plans: Plan[]
  isFormOpen: boolean
  editingClient: Client | null
  onOpenForm: (client?: Client) => void
  onCloseForm: () => void
  onSubmit: (client: Partial<Client>) => void
  onDelete: (id: number) => void
  loading: boolean
  setLoading: (loading: boolean) => void
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
  loading,
  setLoading
}: ClientsTabProps) {
  return (
    // Removido flex-1 flex flex-col min-h-0 - solo mantenemos space-y-4
    <div className="space-y-4">
      {/* Removido flex-1 min-h-0 y simplificado las clases */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex justify-between lg:gap-0">
            <div>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>Gestiona todos los clientes registrados</CardDescription>
            </div>
            <div className="lg:ml-0">
              <Button onClick={() => onOpenForm()} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </div>
          </div>
        </CardHeader>
        {/* Simplificado a solo p-0 */}
        <CardContent className="p-0">
          <ClientsTable loading={loading} clients={clients} plans={plans} onEdit={onOpenForm} onDelete={onDelete} />
        </CardContent>
      </Card>
      <ClientForm
        setLoading={setLoading}
        loading={loading}
        isOpen={isFormOpen}
        onClose={onCloseForm}
        onSubmit={onSubmit}
        editingClient={editingClient}
        plans={plans}
      />
    </div>
  )
}