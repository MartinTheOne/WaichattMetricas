import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

const supabase = createClient(process.env.DATABASE_URL ?? "", process.env.PUBLIC_ANON_KEY ?? "")

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== "admin") {
    return new Response("No autorizado", { status: 401 });
  }
  try {
    const { data: pagos, error: pagosError } = await supabase.from("waichatt_pagos").select("monto").eq("estado","pagado")

    if (pagosError) throw pagosError

    const { data: egresos, error: egresosError } = await supabase.from("waichatt_egresos").select("monto")

    if (egresosError) throw egresosError

    const totalIngresos = pagos?.reduce((sum, pago) => sum + (pago.monto || 0), 0) || 0
    const totalEgresos = egresos?.reduce((sum, egreso) => sum + (egreso.monto || 0), 0) || 0
    const balance = totalIngresos - totalEgresos

    return NextResponse.json({
      totalIngresos,
      totalEgresos,
      balance,
    })
  } catch (error) {
    console.error("Error calculating balance:", error)
    return NextResponse.json({ error: "Error calculating balance" }, { status: 500 })
  }
}
