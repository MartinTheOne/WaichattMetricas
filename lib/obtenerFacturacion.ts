import { IFacturacion } from "@/types/IFacturacion";
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth";
const supabase = createClient(
    process.env.DATABASE_URL ?? '',
    process.env.PUBLIC_ANON_KEY ?? ''
);


export async function obtenerFacturacion(): Promise<IFacturacion[]> {
    const session = await getServerSession();
    if (!session) throw new Error("No se ha iniciado sesión");
    if (!session.user.email) throw new Error("no se encuentra el email del usuario");


    const email = session.user.email;
    const clienteId = await getEmail(email);

    if (!clienteId) throw new Error("No se encontró el cliente para el email: " + email);

    const { data, error } = await supabase
        .from('waichatt_facturacion')
        .select('id, id_planes, fecha_facturacion, monto, estado')
        .eq('id_clientes', clienteId);

    if (error) {
        console.error('[Supabase error]', error);
        return [];
    }
    if (!data || data.length === 0) {
        console.warn("No se encontraron registros de facturación para el cliente:", clienteId);
        return [];
    }

    const response: IFacturacion[] = data.map(item => ({
        id: item.id,
        plan: item.id_planes === 1 ? "Plan Básico" : item.id_planes === 2 ? "Plan Pro" : "Plan Empresarial",
        fecha: item.fecha_facturacion,
        monto: item.monto,
        estado: item.estado
    }));
    return response;
}


async function getEmail(email: String) {
    let { data, error } = await supabase
        .from('waichatt_clientes')
        .select('id')
        .eq('email', email).limit(1);

    if (error) {
        console.error('[Supabase error]', error);
        return null;
    }
    if (!data || data.length === 0) {
        console.warn("No se encontró el cliente para el email:", email);
        return null;
    }

    return data[0].id;
}