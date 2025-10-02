import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import getBilling from "@/lib/admin/getBilling";
import { getClients } from "@/lib/admin/getClients";
import { getPlansComplete } from "@/lib/admin/getplans";
import { NextResponse } from "next/server";
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
    const [billing, clients, plans] = await Promise.all([
        getBilling(),
        getClients(),
        getPlansComplete()
    ]);
    return NextResponse.json({ billing, clients, plans }, { status: 200 });
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol !== "admin") {
        return new Response("No autorizado", { status: 401 });
    }

    const { cliente_id, plan_id, monto, estado, fecha } = await request.json();

    if (!cliente_id || !plan_id || !monto || !estado || !fecha) {
        return new Response("Faltan datos obligatorios", { status: 400 });
    }

    const { data, error } = await supabase.from('waichatt_pagos').insert({
        cliente_id,
        plan_id,
        monto,
        estado,
        fecha
    }).select();

    if (error) {
        console.error('[Supabase error]', error);
        return new Response("Error al crear la factura", { status: 500 });
    }

    return NextResponse.json({ id: data[0].id ?? 0, message: "Factura creada exitosamente" }, { status: 201 });

}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol !== "admin") {
        return new Response("No autorizado", { status: 401 });
    }

    const { id, ...payment } = await request.json();
    if (!id) {
        return new Response("Faltan id", { status: 400 });
    }
    const { data, error } = await supabase.from('waichatt_pagos').update({
        ...payment
    }).eq('id', id).select();

    if (error) {
        console.error('[Supabase error]', error);
        return new Response("Error al actualizar la factura", { status: 500 });
    }
    return NextResponse.json({ message: "Factura actualizada exitosamente" }, { status: 200 });
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol !== "admin") {
        return new Response("No autorizado", { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
        return new Response("Faltan id", { status: 400 });
    }
    const { data, error } = await supabase.from('waichatt_pagos').delete().eq('id', id).select();

    if (error) {
        console.error('[Supabase error]', error);
        return new Response("Error al eliminar la factura", { status: 500 });
    }
    return NextResponse.json({ message: "Factura eliminada exitosamente" }, { status: 200 });
}