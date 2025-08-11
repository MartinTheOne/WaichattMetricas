import { DailyData } from "@/types/Imetric"
export interface ChartData {
  name: string;
  enviados: number;
  recibidos: number;
  fecha: string;
}

export interface MessagesChartProps {
  dailyData?: DailyData[];
}
