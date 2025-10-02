"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { SystemUser, Client, Role } from "@/types/index"
import { UsersTable } from "./UsersTable"
import { UserForm } from "./UserForm"
import { CardHeader, Card, CardTitle, CardDescription, CardContent } from "../ui/card"

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
  loading?: boolean
  setLoading: (loading: boolean) => void
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
  loading,
  setLoading
}: UsersTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">

        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Lista de Usuarios</CardTitle>
                <CardDescription>Gestiona todos los usuarios registrados</CardDescription>
              </div>
              <div>
                <Button onClick={() => onOpenForm()} className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Usuario
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden p-0 ">
            <UsersTable users={users} clients={clients} roles={roles} onEdit={(user) => onOpenForm(user)} onDelete={onDelete} />
          </CardContent>
        </Card>
      </div>
      <UserForm
        setLoading={setLoading}
        loading={loading}
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
