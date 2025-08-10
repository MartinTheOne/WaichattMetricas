import {createClient} from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.DATABASE_URL ?? '',
  process.env.PUBLIC_ANON_KEY ?? ''
);


export async function GET(){
    const { data, error } = await supabase.from('waichatt_usuarios_rol').select('id_cliente,email,password,name,rol')
    
    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        });
    }
    
    return NextResponse.json(data,{status:200});
}