import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
    process.env.DATABASE_URL ?? '',
    process.env.PUBLIC_ANON_KEY ?? ''
);

export async function getUsers() {
    const {data, error} = await supabase.from('waichatt_usuarios').select("id, nombre, email, cliente_id, waichatt_roles(id), url_chatwoot, api_access_token").order('nombre', { ascending: true });

    if(error) {
        console.error('[Supabase error]', error);
        return [];
    }
    if(!data || data.length === 0) {
        console.warn("No se encontraron usuarios");
        return [];
    }
    return data.map(user => ({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        id_cliente: user.cliente_id,
        id_rol:( user.waichatt_roles as any)?.id || 0,
        url_base: user.url_chatwoot || "https://app.waichatt.com/api/v2/accounts/id_cuenta",
        api_access_token: user.api_access_token || "",
    })).sort((a, b) => a.id-b.id);
}