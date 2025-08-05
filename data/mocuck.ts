import type { Client, Plan, Role, SystemUser } from "@/types/index"

export const plans: Plan[] = [
    { id: 1, nombre: "Plan Inicial", precio: 29.99 },
    { id: 2, nombre: "Plan Pro", precio: 59.99 },
    { id: 3, nombre: "Plan Empresarial", precio: 99.99 },
    { id: 4, nombre: "Integracion", precio: 99.99 },
]

export const roles: Role[] = [
    { id: 1, nombre: "user" },
    { id: 2, nombre: "admin" },
]

export const initialClients: Client[] = [
    {
        id: 1,
        nombre_completo: "Emilio Cristaldo",
        telefono: "+54 9 11 1234-5678",
        cantidad_mensajes: 1250,
        email: "emilio@example.com",
        id_plan: 2,
    },
    {
        id: 2,
        nombre_completo: "María González",
        telefono: "+54 9 11 8765-4321",
        cantidad_mensajes: 850,
        email: "maria@example.com",
        id_plan: 1,
    },
]

export const initialUsers: SystemUser[] = [
    {
        id: 1,
        email: "emilio@waichatt.com",
        password: "********",
        url_base: "https://app.waichatt.com/api/v2/accounts/id_cuenta",
        api_access_token: "wai_123456789",
        nombre: "Emilio Cristaldo",
        id_cliente: 1,
        id_rol: 1,
    },
    {
        id: 2,
        email: "maria@waichatt.com",
        password: "********",
        url_base: "https://api.waichatt.com",
        api_access_token: "wai_987654321",
        nombre: "María González",
        id_cliente: 2,
        id_rol: 2,
    },
]
