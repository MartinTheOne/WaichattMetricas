"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { DailyData } from "@/types/Imetric"


interface ChartData {
  name: string;
  enviados: number;
  recibidos: number;
  fecha: string;
}

interface MessagesChartProps {
  dailyData?: DailyData[];
}

export function MessagesChart({ dailyData }: MessagesChartProps) {
  // Datos de fallback si no hay datos reales
  const fallbackData: ChartData[] = [
    { name: "Lun", enviados: 180, recibidos: 140, fecha: "2024-07-15" },
    { name: "Mar", enviados: 220, recibidos: 180, fecha: "2024-07-16" },
    { name: "Mié", enviados: 190, recibidos: 160, fecha: "2024-07-17" },
    { name: "Jue", enviados: 250, recibidos: 200, fecha: "2024-07-18" },
    { name: "Vie", enviados: 280, recibidos: 220, fecha: "2024-07-19" },
    { name: "Sáb", enviados: 160, recibidos: 120, fecha: "2024-07-20" },
    { name: "Dom", enviados: 140, recibidos: 100, fecha: "2024-07-21" },
  ];

  // Función para obtener el nombre del día abreviado en español
  const obtenerNombreDia = (fecha: string): string => {
    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const fechaObj = new Date(fecha);
    return diasSemana[fechaObj.getDay()];
  };

  // Función para formatear fecha para mostrar en tooltip
  const formatearFechaTooltip = (fecha: string): string => {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Transformar datos reales al formato del gráfico
  const transformarDatos = (datos: DailyData[]): ChartData[] => {
    return datos.map(dia => ({
      name: obtenerNombreDia(dia.fecha),
      enviados: dia.mensajesEnviados,
      recibidos: dia.mensajesRecibidos,
      fecha: dia.fecha
    }));
  };

  // Usar datos reales si están disponibles, sino usar fallback
  const chartData = dailyData && dailyData.length > 0 
    ? transformarDatos(dailyData)
    : fallbackData;

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{`${label} - ${formatearFechaTooltip(data.fecha)}`}</p>
          <p className="text-green-600">
            {`Enviados: ${payload[0].value}`}
          </p>
          <p className="text-emerald-400">
            {`Recibidos: ${payload[1].value}`}
          </p>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="w-full">


      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="enviados" 
            stroke="#268656" 
            strokeWidth={2} 
            name="Mensajes Enviados"
            dot={{ fill: '#268656', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#268656', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="recibidos" 
            stroke="#34d399" 
            strokeWidth={2} 
            name="Mensajes Recibidos"
            dot={{ fill: '#34d399', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#34d399', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}