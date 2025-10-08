import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.DATABASE_URL ?? '',
    process.env.PUBLIC_ANON_KEY ?? ''
);

export async function getClients() {
    const { data, error } = await supabase.from('waichatt_clientes').select('id,nombre,mensajes_disponibles,plan_id,telefono,email,estado').order('id', { ascending: true });
    if (error) {
        console.error('[Supabase error]', error);
        throw new Error("Error al obtener clientes");
    }
    if (!data || data.length === 0) {
        console.warn("No se encontraron clientes");
        return [];
    }
    return data
}