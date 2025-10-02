export interface Client {
  id: number
  nombre: string
  telefono: string
  mensajes_disponibles: number
  email: string
  plan_id: number
}

export interface Plan {
  id: number
  nombre: string
  precio: number
}

export interface Role {
  id: number
  nombre: string
}

export interface SystemUser {
  id: number
  email: string
  password: string
  url_base: string
  api_access_token: string
  nombre: string
  id_cliente: number
  id_rol: number
}
