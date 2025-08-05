import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.DATABASE_URL ?? '',
    process.env.PUBLIC_ANON_KEY ?? ''
);

export async function getClients() {
    const { data, error } = await supabase.from('waichatt_clientes').select('id,nombre_completo,cantidad_mensajes,id_planes');
    if (error) {
        console.error('[Supabase error]', error);
        throw new Error("Error al obtener clientes");
    }
    if (!data || data.length === 0) {
        console.warn("No se encontraron clientes");
        return [];
    }
    return data.map(client => ({
        id: client.id,
        nombre_completo: client.nombre_completo,
        cantidad_mensajes: client.cantidad_mensajes || 0,
        id_plan: client.id_planes,
        telefono: "Sin telefono",
        email:"Sin email",
    }));
}