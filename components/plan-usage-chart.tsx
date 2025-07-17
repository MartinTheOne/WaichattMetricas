"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface PlanUsageChartProps {
  used: number
  total: number
}

export function PlanUsageChart({ used, total }: PlanUsageChartProps) {
  const remaining = total - used

  const data = [
    { name: "Utilizados", value: used, color: "#268656" },
    { name: "Disponibles", value: remaining, color: "#a7f3d9" },
  ]

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => value.toLocaleString()} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
