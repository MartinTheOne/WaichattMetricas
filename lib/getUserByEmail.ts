import { createClient } from '@supabase/supabase-js';
import {compare} from 'bcryptjs';

interface UserDB {
  id_cliente: string;
  email: string;
  password: string;
  name: string ;
  rol: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  rol: string;
}
const supabase = createClient(
  process.env.DATABASE_URL ?? '',
  process.env.PUBLIC_ANON_KEY ?? ''
);

export async function getUserByEmail(email: string, pass: string): Promise<User | null> {
  const { data, error } = await supabase.from('waichatt_usuarios').select('id_cliente,email,password,name,rol').eq('email', email).limit(1);

  if (error) {
    console.error('[Supabase error]', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const user:UserDB = data[0];

  const isValid = await compare(pass,user.password);
  if (!isValid) {
    return null;
  }
  const rol=await getRole(user.rol);

  if(!rol) {
    return null;
  }

  return { id: String(user.id_cliente), email: user.email, name: user.name,rol: rol };
}

async function getRole(id_rol: number):Promise<string | null> {
  const {data,error}= await supabase.rpc('get_role', { id_rol });

  if( error) {
    console.error('[Supabase error]', error);
    return null;
  }
  if (!data || data.length === 0) {
    return null;
  }
  return data[0].rol ?? null;
}
