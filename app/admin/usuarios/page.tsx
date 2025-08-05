"use client"
import { ProtectedRouteAdmin } from "@/components/protected-route-admin"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCards } from "@/components/admin/StatsCards"
import { ClientsTab } from "@/components/admin/ClientsTab"
import { UsersTab } from "@/components/admin/UsersTab"
import type { Client, SystemUser } from "@/types/index"
import { plans, roles, initialClients, initialUsers } from "@/data/mocuck"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

// Componente Skeleton para las cards de resumen
const SummaryCardSkeleton = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-32" />
        </CardContent>
    </Card>
)

// Componente Skeleton para mostrar durante la carga
const LoadingSkeleton = () => (
    <div className="space-y-6">
        {/* Grid de cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <SummaryCardSkeleton key={i} />
            ))}
        </div>
        
        {/* Tabla skeleton */}
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell className="text-center">
                                    <Skeleton className="h-8 w-20" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
)

export default function Dashboard() {
    const [clients, setClients] = useState<Client[]>(initialClients)
    const [users, setUsers] = useState<SystemUser[]>([])
    const [loading, setLoading] = useState<boolean>(true) // Cambiar a true inicialmente


    useEffect(() => {
        if(users.length > 0) return // Evitar recargar si ya hay usuarios
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/clientes')
                const data = await res.json()
                setUsers(data.users || [])
                setClients(data.clients || [])
            } catch (error) {
                console.error('Error fetching users:', error)
                // Mantener array vacío en caso de error
                setUsers([])
                setClients([])
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, []) // Eliminar dependencia de users para evitar bucle infinito

    // Client state
    const [isClientFormOpen, setIsClientFormOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)

    // User state
    const [isUserFormOpen, setIsUserFormOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<SystemUser | null>(null)

    // Client handlers
    const handleOpenClientForm = (client?: Client) => {
        setEditingClient(client || null)
        setIsClientFormOpen(true)
    }

    const handleCloseClientForm = () => {
        setEditingClient(null)
        setIsClientFormOpen(false)
    }

    const handleSubmitClient = (clientData: Partial<Client>) => {
        if (editingClient) {
            // Update existing client
            setClients(clients.map((client) => (client.id === editingClient.id ? { ...client, ...clientData } : client)))
        } else {
            // Create new client
            const newClient: Client = {
                id: Math.max(...clients.map((c) => c.id), 0) + 1,
                nombre_completo: clientData.nombre_completo!,
                telefono: clientData.telefono!,
                cantidad_mensajes: clientData.cantidad_mensajes || 0,
                email: clientData.email!,
                id_plan: clientData.id_plan!,
            }
            setClients([...clients, newClient])
        }
    }

    const handleDeleteClient = (id: number) => {
        setClients(clients.filter((client) => client.id !== id))
        setUsers(users.filter((user) => user.id_cliente !== id))
    }

    // User handlers
    const handleOpenUserForm = (user?: SystemUser) => {
        setEditingUser(user || null)
        setIsUserFormOpen(true)
    }

    const handleCloseUserForm = () => {
        setEditingUser(null)
        setIsUserFormOpen(false)
    }

    const handleSubmitUser = (userData: Partial<SystemUser>) => {
        if (editingUser) {
            // Update existing user
            setUsers(users.map((user) => (user.id === editingUser.id ? { ...user, ...userData } : user)))
        } else {
            // Create new user
            const newUser: SystemUser = {
                id: Math.max(...users.map((u) => u.id), 0) + 1,
                email: userData.email!,
                password: userData.password!,
                url_base: userData.url_base || "https://api.waichatt.com",
                api_access_token: `wai_${Math.random().toString(36).substr(2, 9)}`,
                nombre: userData.nombre!,
                id_cliente: userData.id_cliente!,
                id_rol: userData.id_rol!,
            }
            setUsers([...users, newUser])
        }
    }

    const handleDeleteUser = (id: number) => {
        setUsers(users.filter((user) => user.id !== id))
    }

    return (
        <ProtectedRouteAdmin>
            <div className="min-h-screen bg-gray-50">
                <main className="p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes y Usuarios</h2>
                            <p className="text-gray-600">Administra todos tus clientes y usuarios en un solo lugar</p>
                        </div>

                        {loading ? (
                            <LoadingSkeleton />
                        ) : (
                            <>
                                <StatsCards clients={clients} users={users} plans={plans} />

                                <Tabs defaultValue="clients" className="space-y-4">
                                    <TabsList>
                                        <TabsTrigger value="clients">Clientes</TabsTrigger>
                                        <TabsTrigger value="users">Usuarios</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="clients">
                                        <ClientsTab
                                            clients={clients}
                                            plans={plans}
                                            isFormOpen={isClientFormOpen}
                                            editingClient={editingClient}
                                            onOpenForm={handleOpenClientForm}
                                            onCloseForm={handleCloseClientForm}
                                            onSubmit={handleSubmitClient}
                                            onDelete={handleDeleteClient}
                                        />
                                    </TabsContent>

                                    <TabsContent value="users">
                                        <UsersTab
                                            users={users}
                                            clients={clients}
                                            roles={roles}
                                            isFormOpen={isUserFormOpen}
                                            editingUser={editingUser}
                                            onOpenForm={handleOpenUserForm}
                                            onCloseForm={handleCloseUserForm}
                                            onSubmit={handleSubmitUser}
                                            onDelete={handleDeleteUser}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRouteAdmin>
    )
}