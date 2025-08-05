import obtenerMetricas from "@/lib/obtenerMetricas";
import { hash } from "bcryptjs";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.DATABASE_URL ?? '',
    process.env.PUBLIC_ANON_KEY ?? ''
);
export async function GET(req:Request) {
    try {

        const { data, error } = await supabase
            .rpc('get_rol', {
                id_rol:1,
            })
        if (error) {
            console.error('[Supabase error]', error);
            //return new Response(error.message, { status: 500 });
        }
        console.log(data)
        return new Response(JSON.stringify({data}), { status: 200 });


        const { searchParams } = new URL(req.url);
        const passurl = searchParams.get('pass');
        const pass=await hash(passurl||"", 10);


        //const { data, error } = await supabase
        //    .rpc('get_usuario_por_email_2', {
       //         email_arg:'gonzalezmartinnatanael@gmail.com',
        //    })
        //if (error) {
            console.error('[Supabase error]', error);
            //return new Response(error.message, { status: 500 });
      //  }
        if (!data || data.length === 0) {
            return new Response('No se encontró el usuario', { status: 404 });
        }
        return new Response(JSON.stringify(data[0]), { status: 200 });
        const metrics = await obtenerMetricas()

        return new Response(JSON.stringify(metrics))
    }
    catch (error) {
        console.error('Error obteniendo métricas:', error);
        return new Response('Error obteniendo métricas', { status: 500 });
    }
}