"use client"
import { ProtectedRouteAdmin } from "@/components/admin/protected-route-admin"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCards } from "@/components/admin/StatsCards"
import { ClientsTab } from "@/components/admin/ClientsTab"
import { UsersTab } from "@/components/admin/UsersTab"
import type { Client, Plan, SystemUser } from "@/types/index"
import { roles } from "@/data/mocuck"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner";

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
    const [clients, setClients] = useState<Client[]>([])
    const [users, setUsers] = useState<SystemUser[]>([])
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState<boolean>(true) // Cambiar a true inicialmente
    const [loadingForm, setLoadingForm] = useState<boolean>(false)


    useEffect(() => {
        if (users.length > 0) return // Evitar recargar si ya hay usuarios
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/clientes')
                const data = await res.json()
                setUsers(data.users || [])
                setClients(data.clients || [])
                setPlans(data.plans || [])
            } catch (error) {
                console.error('Error fetching users:', error)
                // Mantener array vacío en caso de error
                setUsers([])
                setClients([])
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const [isClientFormOpen, setIsClientFormOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)

    const [isUserFormOpen, setIsUserFormOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<SystemUser | null>(null)

    const handleOpenClientForm = (client?: Client) => {
        setEditingClient(client || null)
        setIsClientFormOpen(true)
    }

    const handleCloseClientForm = () => {
        setEditingClient(null)
        setIsClientFormOpen(false)
    }

    const handleSubmitClient = async (clientData: Partial<Client>) => {

        if (editingClient) {

            try {
                type ClientValue = Client[keyof Client];
                const updatedFields: Partial<Record<keyof Client, ClientValue>> = {};

                for (const key in clientData) {
                    const typedKey = key as keyof Client;

                    const newValue = clientData[typedKey];
                    if (newValue !== undefined && newValue !== editingClient[typedKey]) {
                        updatedFields[typedKey] = newValue;
                    }
                }

                if (Object.keys(updatedFields).length === 0) {
                    console.log('No changes detected, skipping update')
                    toast.warning('No se detectaron cambios para actualizar', { position: 'top-center' })
                    return
                }

                const res = await fetch('/api/admin/clientes', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingClient.id,
                        ...updatedFields
                    })
                })
                if (res.status !== 200) {
                    const errorData = await res.json()
                    toast.error('Error al actualizar cliente', { position: 'top-center' })
                    console.error('Error updating client:', errorData)
                    return
                }
                setClients(clients.map((client) => (client.id === editingClient.id ? { ...client, ...clientData } : client)))

                toast.success('Cliente actualizado correctamente', { position: 'top-center' })
                setEditingClient(null)
                handleCloseClientForm()
            } catch (error) {
                toast.error('Error al actualizar cliente', { position: 'top-center' })
            }

        } else {
            try {
                const res = await fetch('/api/admin/clientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clientData)
                })

                if (res.status !== 201) {
                    const errorData = await res.json()
                    toast.error('Error al crear cliente', { position: 'top-center' })
                    console.error('Error creating client:', errorData)
                    return
                }
                const data = await res.json()
                // Create new client
                const newClient: Client = {
                    id: data.id ?? 0,
                    nombre: clientData.nombre!,
                    telefono: clientData.telefono!,
                    mensajes_disponibles: clientData.mensajes_disponibles || 0,
                    email: clientData.email!,
                    plan_id: clientData.plan_id!,
                }
                setClients([...clients, newClient].sort((a, b) => a.id - b.id))
                toast.success('Cliente creado correctamente', { position: 'top-center' })
                handleCloseClientForm();
            } catch (error) {
                toast.error('Error al crear cliente', { position: 'top-center' })
            }

        }
        setLoadingForm(false);
    }

    const handleDeleteClient = async (id: number) => {
        setLoadingForm(true);
        try {
            const res = await fetch(`/api/admin/clientes?id=${id}`, {
                method: 'DELETE',
            })
            if (res.status !== 200) {
                const errorData = await res.json()
                toast.error('Error al eliminar cliente', { position: 'top-center' })
                console.error('Error deleting client:', errorData)
                return
            }
            setClients(clients.filter((client) => client.id !== id))
            setUsers(users.filter((user) => user.id_cliente !== id))
            toast.success('Cliente eliminado correctamente', { position: 'top-center' })
        } catch (error) {
            toast.error('Error al eliminar cliente', { position: 'top-center' })
        } finally {
            setLoadingForm(false);
        }
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

    const handleSubmitUser = async (userData: Partial<SystemUser>) => {
        if (editingUser) {
            type userValue = SystemUser[keyof SystemUser];
            const updatedFields: Partial<Record<keyof SystemUser, userValue>> = {};

            for (const key in userData) {
                const typedKey = key as keyof SystemUser;

                const newValue = userData[typedKey];
                if (newValue !== undefined && newValue !== editingUser[typedKey]) {
                    updatedFields[typedKey] = newValue;
                }
            }
            if (userData?.password?.trim() === "") {
                delete updatedFields.password;
            }
            if (Object.keys(updatedFields).length === 0) {
                console.log('No changes detected, skipping update')
                toast.warning('No se detectaron cambios para actualizar', { position: 'top-center' })
                return
            }
            const res = await fetch('/api/admin/usuarios', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingUser.id,
                    ...updatedFields
                })
            })
            if (res.status !== 200) {
                const errorData = await res.json();
                toast.error('Error al actualizar usuario', { position: 'top-center' });
                console.error('Error updating client:', errorData);
                return
            }
            setUsers(users.map((user) => (user.id === editingUser.id ? { ...user, ...userData } : user)))
            toast.success('Usuario actualizado correctamente', { position: 'top-center' })
            setEditingUser(null)
            handleCloseUserForm()
        } else {
            // Create new user
            const res = await fetch('/api/admin/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            })
            if (res.status === 409) {
                toast.error('El email ya está en uso', { position: 'top-center' });
                return
            }
            if (res.status !== 201) {
                const errorData = await res.json();
                toast.error('Error al crear usuario', { position: 'top-center' });
                console.error('Error creating user:', errorData);
                return
            }
            const data = await res.json()
            const newUser: SystemUser = {
                id: data.id ?? 0,
                email: userData.email!,
                password: "",
                url_base: userData.url_base || "https://api.waichatt.com",
                api_access_token: userData.api_access_token || "",
                nombre: userData.nombre!,
                id_cliente: userData.id_cliente!,
                id_rol: userData.id_rol!,
            }
            setUsers([...users, newUser].sort((a, b) => a.id - b.id))
            toast.success('Usuario creado correctamente', { position: 'top-center' })
            handleCloseUserForm()
        }
        setLoadingForm(false);

    }

    const handleDeleteUser = async (id: number) => {
        setLoadingForm(true);
        const res = await fetch(`/api/admin/usuarios?id=${id}`, {
            method: 'DELETE',
        })
        if (res.status !== 200) {
            const errorData = res.json()
            toast.error('Error al eliminar usuario', { position: 'top-center' })
            console.log('Error deleting user:', errorData)
            return
        }
        setUsers(users.filter((user) => user.id !== id))
        toast.success('Usuario eliminado correctamente', { position: 'top-center' })
        setLoadingForm(false);
    }

    return (
        <ProtectedRouteAdmin>
            <div className="min-h-screen bg-gray-50">
                <main className="p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes y Usuarios</h2>
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
                                            loading={loadingForm}
                                            setLoading={setLoadingForm}
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
                                            loading={loadingForm}
                                            setLoading={setLoadingForm}
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