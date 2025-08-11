export type Cliente = {
  id: number
  nombre_completo: string
  email?: string
}

export type Plan = {
  id: number
  nombre_plan: string
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