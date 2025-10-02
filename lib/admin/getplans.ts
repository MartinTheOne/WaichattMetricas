import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.DATABASE_URL ?? '',
    process.env.PUBLIC_ANON_KEY ?? ''
);

export async function getPlans() {
    const { data, error } = await supabase.from('waichatt_planes').select('*');

    if (error) {
        console.error('[Supabase error]', error);
        return [];
    }

    return data.map(plan => ({
        id: plan.id,
        nombre: plan.plan,
        precio: plan.precio,
        cantidad_mensajes: plan.cant_mensajes
    })).sort((a, b) => a.id - b.id).filter(plan => plan.id !== 4); 
}


export async function getPlansComplete() {
    const { data, error } = await supabase.from('waichatt_planes').select('*');

    if (error) {
        console.error('[Supabase error]', error);
        return [];
    }

    return data.map(plan => ({
        id: plan.id,
        nombre: plan.plan,
        precio: plan.precio,
        cantidad_mensajes: plan.cant_mensajes
    })).sort((a, b) => a.id - b.id); 
}
