import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.DATABASE_URL ?? '',
    process.env.PUBLIC_ANON_KEY ?? ''
);


export default async function getBilling() {
    const { data, error } = await supabase
        .from('waichatt_facturacion')
        .select(`
    id,
    fecha_facturacion,
    monto,
    estado,
    waichatt_planes(
      id_planes,
      nombre_plan,
      precio
    ),
    waichatt_clientes(
      id,
      nombre_completo,
      email,
      telefono
    )
  `).order('fecha_facturacion', { ascending: false });

    if (error) {
        console.error('[Supabase error]', error);
        throw new Error("Error al obtener la facturación");
    }

    if (!data || data.length === 0) {
        return [];
    }

    return data.map(item => ({
        id: item.id,
        plan: item.waichatt_planes,
        cliente: item.waichatt_clientes,
        fecha: item.fecha_facturacion,
        monto: item.monto,
        estado: item.estado,
    }));

}