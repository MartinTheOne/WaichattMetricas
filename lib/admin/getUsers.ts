import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
    process.env.DATABASE_URL ?? '',
    process.env.PUBLIC_ANON_KEY ?? ''
);

export async function getUsers() {
    const {data, error} = await supabase.from('waichatt_usuarios').select("id, name, email, id_cliente, rol, url_base, api_access_token").order('name', { ascending: true });

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
        nombre: user.name,
        email: user.email,
        id_cliente: user.id_cliente,
        id_rol: user.rol,
        url_base: user.url_base || "https://app.waichatt.com/api/v2/accounts/id_cuenta",
        api_access_token: user.api_access_token || "",
    })).sort((a, b) => a.id-b.id);
}