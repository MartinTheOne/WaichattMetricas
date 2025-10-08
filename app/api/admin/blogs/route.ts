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
        const { data: blogs, error } = await supabase
            .from("waichatt_blogs")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) throw error

        return NextResponse.json({ blogs: blogs || [] })
    } catch (error) {
        console.error("Error fetching blogs:", error)
        return NextResponse.json({ error: "Error al obtener los blogs" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol !== "admin") {
        return new Response("No autorizado", { status: 401 });
    }
    try {
        const body = await request.json()
        const { slug, title, subtitle, description, main_image, sections, status, recommendations } = body

        const { data, error } = await supabase
            .from("waichatt_blogs")
            .insert([
                {
                    slug,
                    title,
                    subtitle,
                    description,
                    main_image,
                    sections:sections||[],
                    status: status || "draft",
                    recommendations: recommendations || [],
                },
            ])
            .select()
        if (error) throw error

        return NextResponse.json({ blog: data[0] }, { status: 201 })
    } catch (error) {
        console.error("Error creating blog:", error)
        return NextResponse.json({ error: "Error al crear el blog" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol !== "admin") {
        return new Response("No autorizado", { status: 401 });
    }
    try {
        const body = await request.json()
        const { id, slug, title, subtitle, description, main_image, sections, status, recommendations } = body

        const { data, error } = await supabase
            .from("waichatt_blogs")
            .update({
                slug,
                title,
                subtitle,
                description,
                main_image,
                sections,
                status,
                recommendations: recommendations || [],
            })
            .eq("id", id)
            .select()

        if (error) throw error

        return NextResponse.json({ blog: data[0] })
    } catch (error) {
        console.error("Error updating blog:", error)
        return NextResponse.json({ error: "Error al actualizar el blog" }, { status: 500 })
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
            return NextResponse.json({ error: "ID requerido" }, { status: 400 })
        }

        const { error } = await supabase.from("waichatt_blogs").delete().eq("id", id)

        if (error) throw error

        return NextResponse.json({ message: "Blog eliminado exitosamente" })
    } catch (error) {
        console.error("Error deleting blog:", error)
        return NextResponse.json({ error: "Error al eliminar el blog" }, { status: 500 })
    }
}
