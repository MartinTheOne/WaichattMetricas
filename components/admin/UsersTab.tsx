"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { SystemUser, Client, Role } from "@/types/index"
import { UsersTable } from "./UsersTable"
import { UserForm } from "./UserForm"

interface UsersTabProps {
  users: SystemUser[]
  clients: Client[]
  roles: Role[]
  isFormOpen: boolean
  editingUser: SystemUser | null
  onOpenForm: (user?: SystemUser) => void
  onCloseForm: () => void
  onSubmit: (user: Partial<SystemUser>) => void
  onDelete: (id: number) => void
}

export function UsersTab({
  users,
  clients,
  roles,
  isFormOpen,
  editingUser,
  onOpenForm,
  onCloseForm,
  onSubmit,
  onDelete,
}: UsersTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Lista de Usuarios</h3>
          <p className="text-sm text-gray-600">Gestiona todos los usuarios del sistema</p>
        </div>
        <Button onClick={() => onOpenForm()} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <UsersTable users={users} clients={clients} roles={roles} onEdit={(user) => onOpenForm(user)} onDelete={onDelete} />

      <UserForm
        isOpen={isFormOpen}
        onClose={onCloseForm}
        onSubmit={onSubmit}
        editingUser={editingUser}
        clients={clients}
        roles={roles}
      />
    </div>
  )
}
