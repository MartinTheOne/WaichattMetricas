import { getUsers } from "@/lib/admin/getUsers";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { SystemUser } from "@/types";
import { hash } from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.DATABASE_URL ?? '',
    process.env.PUBLIC_ANON_KEY ?? ''
);

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol == "user") {
        return new Response("No autorizado", { status: 401 });
    }

    const users = await getUsers();
    return NextResponse.json(users, { status: 200 });
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol == "user") {
        return new Response("No autorizado", { status: 401 });
    }

    const data: SystemUser = await request.json();
    if (!data.nombre || !data.email || !data.id_cliente || !data.id_rol || !data.url_base || !data.api_access_token || !data.password) {
        return new Response("Faltan datos", { status: 400 });
    }
    // Aquí puedes manejar la creación de un nuevo usuario
    const passEncode = await hash(data.password, 10);
    const { data: userData, error } = await supabase.rpc('usuarios_sistema', {
        nombre: data.nombre,
        email: data.email,
        password: passEncode,
        url_base: data.url_base,
        api_access_token: data.api_access_token,
        id_cliente: data.id_cliente,
        rol: data.id_rol,
    });

    if (error) {
        console.error('[Supabase error]', error);
        return new Response("Error al crear usuario", { status: 500 });
    }

    return NextResponse.json({ message: "Usuario creado" }, { status: 201 });
}