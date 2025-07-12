"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const data = [
  { name: "Lun", enviados: 180, recibidos: 140 },
  { name: "Mar", enviados: 220, recibidos: 180 },
  { name: "Mié", enviados: 190, recibidos: 160 },
  { name: "Jue", enviados: 250, recibidos: 200 },
  { name: "Vie", enviados: 280, recibidos: 220 },
  { name: "Sáb", enviados: 160, recibidos: 120 },
  { name: "Dom", enviados: 140, recibidos: 100 },
]

export function MessagesChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="enviados" stroke="#268656" strokeWidth={2} name="Mensajes Enviados" />
        <Line type="monotone" dataKey="recibidos" stroke="#34d399" strokeWidth={2} name="Mensajes Recibidos" />
      </LineChart>
    </ResponsiveContainer>
  )
}
