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
    if (!session || (session.user as any).rol !== "admin") {
        return new Response("No autorizado", { status: 401 });
    }
    const users = await getUsers();
    return NextResponse.json(users, { status: 200 });
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol !== "admin") {
        return new Response("No autorizado", { status: 401 });
    }

    const dataReq: SystemUser = await request.json();
    if (!dataReq.nombre || !dataReq.email || !dataReq.id_cliente || !dataReq.id_rol || !dataReq.url_base || !dataReq.api_access_token || !dataReq.password) {
        return new Response("Faltan datos", { status: 400 });
    }
    const existingUser = await findByEmail(dataReq.email);
    if (existingUser) {
        return new Response("El email ya está en uso", { status: 409 });
    }
    // Aquí puedes manejar la creación de un nuevo usuario
    const passEncode = await hash(dataReq.password, 10);
    const { data, error } = await supabase.from('waichatt_usuarios').insert({
        email: dataReq.email,
        password: passEncode,
        url_base: dataReq.url_base,
        api_access_token: dataReq.api_access_token,
        name: dataReq.nombre,
        id_cliente: dataReq.id_cliente,
        rol: dataReq.id_rol
    }).select();


    if (error) {
        console.error('[Supabase error]', error);
        return new Response("Error al crear usuario", { status: 500 });
    }

    return NextResponse.json({ id: data[0].id ?? 0, message: "Usuario creado" }, { status: 201 });
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol !== "admin") {
        return new Response("No autorizado", { status: 401 });
    }

    const { id, ...dataReq } = await request.json();
    if (!id) {
        return new Response("Faltan ID", { status: 400 });
    }
    let nuevaData = { ...dataReq };
    if (dataReq.nombre) {
        nuevaData.name= dataReq.nombre;
        delete nuevaData.nombre;
    }

    const existingUser = await findById(id);
    if (!existingUser) {
        return new Response("Usuario no encontrado", { status: 404 });
    }
    if (dataReq.password) {
        nuevaData.password = await hash(dataReq.password, 10);
    }

    const { data, error } = await supabase.from('waichatt_usuarios')
        .update(nuevaData).eq('id', id)
        .select();

    if (error) {
        console.error('[Supabase error]', error);
        return new Response("Error al actualizar usuario", { status: 500 });
    }
    return NextResponse.json({ id: data[0].id ?? 0, message: "Usuario actualizado" }, { status: 200 });

}


export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol !== "admin") {
        return new Response("No autorizado", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return new Response("Falta ID", { status: 400 });
    }

    const existingUser = await findById(Number(id));
    if (!existingUser) {
        return new Response("Usuario no encontrado", { status: 404 });
    }

    const { error } = await supabase.from('waichatt_usuarios')
        .delete().eq('id', Number(id));

    if (error) {
        return new Response("Error al eliminar usuario", { status: 500 });
    }

    return NextResponse.json({ message: "Usuario eliminado" }, { status: 200 });
}


async function findById(id: number) {
    const { data, error } = await supabase
        .from('waichatt_usuarios')
        .select('id')
        .eq('id', id)
        .single();

    if (error) {
        console.error('[Supabase error]', error);
        return null;
    }
    const res = data?.id || null;
    return res;
}

async function findByEmail(email: string) {
    const { data, error } = await supabase
        .from('waichatt_usuarios')
        .select('id, email')
        .eq('email', email)
        .single();

    if (error) {
        console.error('[Supabase error]', error);
        return null;
    }
    return data;
}