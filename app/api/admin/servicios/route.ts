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
    const { data, error } = await supabase
      .from("waichatt_servicios")
      .select("*")
      .order("nombre", { ascending: false })

    if (error) throw error

    return NextResponse.json({ servicios: data })
  } catch (error) {
    console.error("Error fetching servicios:", error)
    return NextResponse.json({ error: "Error fetching servicios" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== "admin") {
    return new Response("No autorizado", { status: 401 });
  }
  try {
    const body = await request.json()
    const { nombre, tipo, monto_default, activo, descripcion } = body

    const { data, error } = await supabase
      .from("waichatt_servicios")
      .insert([
        {
          nombre,
          tipo,
          monto_default,
          activo,
          descripcion,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({ servicio: data[0] })
  } catch (error) {
    console.error("Error creating servicio:", error)
    return NextResponse.json({ error: "Error creating servicio" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== "admin") {
    return new Response("No autorizado", { status: 401 });
  }
  try {
    const body = await request.json()
    const { id, nombre, tipo, monto_default, activo, descripcion } = body

    const { data, error } = await supabase
      .from("waichatt_servicios")
      .update({
        nombre,
        tipo,
        monto_default,
        activo,
        descripcion,
      })
      .eq("id", id)
      .select()

    if (error) throw error

    return NextResponse.json({ servicio: data[0] })
  } catch (error) {
    console.error("Error updating servicio:", error)
    return NextResponse.json({ error: "Error updating servicio" }, { status: 500 })
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

    const { error } = await supabase.from("waichatt_servicios").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting servicio:", error)
    return NextResponse.json({ error: "Error deleting servicio" }, { status: 500 })
  }
}
