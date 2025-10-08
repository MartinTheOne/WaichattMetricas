import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserIcon, MessageSquare, CreditCard } from "lucide-react"
import type { Client, SystemUser, Plan } from "@/types/index"

interface StatsCardsProps {
  clients: Client[]
  users: SystemUser[]
  plans: Plan[]
}

export function StatsCards({ clients, users, plans }: StatsCardsProps) {
  const clientesActivos=clients.filter(c=>(c as any).estado === true).length
  const stats = [
    {
      title: "Total Clientes",
      value: clientesActivos,
      description: "Clientes activos",
      icon: Users,
    },
    {
      title: "Total Usuarios",
      value: users.length,
      description: "Usuarios registrados",
      icon: UserIcon,
    },
    {
      title: "Planes Activos",
      value: plans.length,
      description: "Planes disponibles",
      icon: CreditCard,
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full sm:gap-4 md:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground sm:h-4 sm:w-4 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="sm:text-2xl  truncate text-2xl font-bold">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}