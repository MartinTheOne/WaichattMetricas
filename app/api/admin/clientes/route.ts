import { getClients } from "@/lib/admin/getClients";
import { getUsers } from "@/lib/admin/getUsers";
import { getPlans } from "@/lib/admin/getplans";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.DATABASE_URL ?? '',
    process.env.PUBLIC_ANON_KEY ?? ''
);

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).rol !== 'admin') {
        return new Response("Unauthorized", { status: 403 });
    }
    const [users, clients,plans] = await Promise.all([
        getUsers(),
        getClients(),
        getPlans()
    ]);
    
    return Response.json({ users, clients,plans }, { status: 200 });
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).rol !== 'admin') {
        return new Response("Unauthorized", { status: 403 });
    }
    const dataReq = await request.json();
    if( !dataReq.nombre || !dataReq.telefono || !dataReq.email || !dataReq.plan_id || !dataReq.mensajes_disponibles) return new Response("Missing data", { status: 400 });

    const {data,error} = await supabase.from('waichatt_clientes').insert({
        nombre: dataReq.nombre,
        telefono: dataReq.telefono,
        email: dataReq.email,
        plan_id: dataReq.plan_id,
        mensajes_disponibles: dataReq.mensajes_disponibles
    }).select();

    if(error) {
        console.error('[Supabase error]', error);
        return new Response("Error creating client", { status: 500 });
    }

    return Response.json({id:data[0].id??0, message: "Data processed successfully" }, { status: 201 });
}

export async function PUT(request: Request) {

    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).rol !== 'admin') {
        return new Response("Unauthorized", { status: 403 });
    }
    const {id,...dataReq} = await request.json();
    if( !id) return new Response("Missing data", { status: 400 });

    const existingClientId = await findById(Number(id));
    if (!existingClientId) {
        return new Response("Client not found", { status: 404 });
    }

    const {data,error} = await supabase.from('waichatt_clientes').update(dataReq).eq('id', id).select();

    if(error) {
        console.error('[Supabase error]', error);
        return new Response("Error updating client", { status: 500 });
    }

    return Response.json({id:data[0].id??0, message: "Data processed successfully" }, { status: 200 });
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).rol !== 'admin') {
        return new Response("Unauthorized", { status: 403 });
    }
    const {searchParams}=new URL(request.url);
    const id=searchParams.get('id');

    if (!id) return new Response("Missing data", { status: 400 });

    const existingClientId = await findById(Number(id));
    if (!existingClientId) {
        return new Response("Client not found", { status: 404 });
    }

    const { error } = await supabase.from('waichatt_clientes').delete().eq('id', id);

    if (error) {
        console.error('[Supabase error]', error);
        return new Response("Error deleting client", { status: 500 });
    }

    return Response.json({ message: "Client deleted successfully" }, { status: 200 });
}

async function findById(id:number){
    const { data, error } = await supabase
        .from('waichatt_clientes')
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