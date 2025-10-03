import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

const supabase = createClient(process.env.DATABASE_URL ?? "", process.env.PUBLIC_ANON_KEY ?? "")

async function getDolarBlue() {

  try {
    const response = await fetch("https://dolarapi.com/v1/dolares/blue")
    const data = await response.json()
    return data.venta
  } catch (error) {
    console.error("Error fetching dolar blue:", error)
    return null
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== "admin") {
    return new Response("No autorizado", { status: 401 });
  }
  try {
    const { data, error } = await supabase
      .from("waichatt_egresos")
      .select(
        `
        *,
        servicio:waichatt_servicios(id, nombre, tipo, monto_default)
      `,
      )
      .order("fecha", { ascending: false })

    if (error) throw error

    return NextResponse.json({ egresos: data })
  } catch (error) {
    console.error("Error fetching egresos:", error)
    return NextResponse.json({ error: "Error fetching egresos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== "admin") {
    return new Response("No autorizado", { status: 401 });
  }
  try {
    const body = await request.json()
    const { fecha, descripcion, monto, estado, servicio_id, moneda } = body

    let montoFinal = monto

    if (moneda === "USD") {
      const dolarBlue = await getDolarBlue()
      if (dolarBlue) {
        montoFinal = monto * dolarBlue
      }
    }

    const { data, error } = await supabase
      .from("waichatt_egresos")
      .insert([
        {
          fecha,
          descripcion,
          monto: montoFinal,
          estado,
          servicio_id,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({ egreso: data[0] })
  } catch (error) {
    console.error("Error creating egreso:", error)
    return NextResponse.json({ error: "Error creating egreso" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== "admin") {
    return new Response("No autorizado", { status: 401 });
  }
  try {
    const body = await request.json()
    const { id, fecha, descripcion, monto, estado, servicio_id, moneda } = body

    let montoFinal = monto

    if (moneda === "USD") {
      const dolarBlue = await getDolarBlue()
      if (dolarBlue) {
        montoFinal = monto * dolarBlue
      }
    }

    const { data, error } = await supabase
      .from("waichatt_egresos")
      .update({
        fecha,
        descripcion,
        monto: montoFinal,
        estado,
        servicio_id,
      })
      .eq("id", id)
      .select()

    if (error) throw error

    return NextResponse.json({ egreso: data[0] })
  } catch (error) {
    console.error("Error updating egreso:", error)
    return NextResponse.json({ error: "Error updating egreso" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== "admin") {
    return new Response("No autorizado", { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("waichatt_egresos").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting egreso:", error)
    return NextResponse.json({ error: "Error deleting egreso" }, { status: 500 })
  }
}
