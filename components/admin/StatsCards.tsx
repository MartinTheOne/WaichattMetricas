import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserIcon, MessageSquare, CreditCard } from "lucide-react"
import type { Client, SystemUser, Plan } from "@/types/index"

interface StatsCardsProps {
  clients: Client[]
  users: SystemUser[]
  plans: Plan[]
}

export function StatsCards({ clients, users, plans }: StatsCardsProps) {
  const totalMessages = clients.reduce((sum, client) => sum + client.cantidad_mensajes, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clients.length}</div>
          <p className="text-xs text-muted-foreground">Clientes activos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users.length}</div>
          <p className="text-xs text-muted-foreground">Usuarios registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mensajes Totales</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Mensajes enviados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Planes Activos</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{plans.length}</div>
          <p className="text-xs text-muted-foreground">Planes disponibles</p>
        </CardContent>
      </Card>
    </div>
  )
}
