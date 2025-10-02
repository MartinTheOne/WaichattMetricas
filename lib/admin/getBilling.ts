import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.DATABASE_URL ?? '',
  process.env.PUBLIC_ANON_KEY ?? ''
);


export default async function getBilling() {
  const { data, error } = await supabase
    .from('waichatt_pagos')
    .select(`
    id,
    fecha,
    monto,
    estado,
    waichatt_planes(
      id,
      plan,
      precio
    ),
    waichatt_clientes(
      id,
      nombre,
      email,
      telefono
    )
  `).order('fecha', { ascending: false });

  if (error) {
    console.error('[Supabase error]', error);
    throw new Error("Error al obtener la facturación");
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(item => ({
    id: item.id,
    plan: {
      id: (item.waichatt_planes as any).id,
      nombre: (item.waichatt_planes as any).plan,
    },
    cliente: item.waichatt_clientes,
    fecha: item.fecha,
    monto: item.monto,
    estado: item.estado,
  }));

}