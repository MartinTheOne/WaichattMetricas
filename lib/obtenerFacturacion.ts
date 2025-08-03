import { IFacturacion } from "@/types/IFacturacion";
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
const supabase = createClient(
    process.env.DATABASE_URL ?? '',
    process.env.PUBLIC_ANON_KEY ?? ''
);

export async function obtenerFacturacion(): Promise<IFacturacion[]> {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("No se ha iniciado sesión");
    if (!session.user?.email) throw new Error("no se encuentra el email del usuario");
    if (!(session.user as any).id) throw new Error("no se encuentra el id del usuario");

    const { data, error } = await supabase
        .from('waichatt_facturacion')
        .select('id, id_planes, fecha_facturacion, monto, estado')
        .eq('id_clientes', (session.user as any).id);

    if (error) {
        console.error('[Supabase error]', error);
        return [];
    }
    if (!data || data.length === 0) {
        console.warn("No se encontraron registros de facturación para el cliente");
        return [];
    }

    const response: IFacturacion[] = data.map(item => ({
        id: item.id,
        plan: item.id_planes === 1 ? "Plan Básico" : item.id_planes === 2 ? "Plan Pro" : item.id_planes === 3 ? "Plan Empresarial" : "Integración",
        fecha: item.fecha_facturacion,
        monto: item.monto,
        estado: item.estado
    }));
    response.sort((a, b) => {
        const date1 = new Date(a.fecha).getTime();
        const date2 = new Date(b.fecha).getTime();
        return date2 - date1; // reciente primero
    });

    return response;
}


