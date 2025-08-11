export interface InvoiceData {
  fecha: string;
  monto: number;
  estado: string;
  facturaId: number;
  plan: string;
  id: number;
}

export interface CompanyData {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

export interface ClientData {
  nombre: string;
  email: string;
}
