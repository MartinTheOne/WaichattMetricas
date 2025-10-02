export type Cliente = {
  id: number
  nombre: string
  email?: string
}

export type Plan = {
  id: number
  nombre: string
  precio: number
}

export type IFacturacion = {
  id: number
  fecha: string
  monto: number
  estado: "pagado" | "pendiente" | "fallido" | string
  cliente: Cliente
  plan: Plan
}