"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const data = [
  {
    name: "Lun",
    enviados: 180,
    recibidos: 140,
    contactos: 65,
  },
  {
    name: "Mar",
    enviados: 220,
    recibidos: 180,
    contactos: 78,
  },
  {
    name: "Mié",
    enviados: 190,
    recibidos: 160,
    contactos: 72,
  },
  {
    name: "Jue",
    enviados: 250,
    recibidos: 200,
    contactos: 85,
  },
  {
    name: "Vie",
    enviados: 280,
    recibidos: 220,
    contactos: 92,
  },
  {
    name: "Sáb",
    enviados: 160,
    recibidos: 120,
    contactos: 58,
  },
  {
    name: "Dom",
    enviados: 140,
    recibidos: 100,
    contactos: 45,
  },
]

export function MetricsChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <div className="mt-5">
          <Bar dataKey="enviados" fill="#268656" name="Mensajes Enviados" />
          <Bar dataKey="recibidos" fill="#34d399" name="Mensajes Recibidos" />
          <Bar dataKey="contactos" fill="#a7f3d0" name="Nuevos Contactos" />
        </div>
      </BarChart>
    </ResponsiveContainer>
  )
}
