import { compare } from 'bcryptjs';
import {UserDB, User} from '../types/IGetUserByEmail'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.DATABASE_URL ?? '',
  process.env.PUBLIC_ANON_KEY ?? ''
);

export async function getUserByEmail(email: string, pass: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('waichatt_usuarios').select('cliente_id,email,clave,nombre,waichatt_roles(id,rol)').eq('email',email).single()
  console.log(data)
  if (error) {
    console.error('[Supabase error]', error);
    return null;
  }
  if (!data) {
    return null;
  }

  const dbUser = data
  const user: UserDB = {
    id_cliente: dbUser.cliente_id,
    email: dbUser.email,
    password: dbUser.clave,
    name: dbUser.nombre,
    rol: (dbUser.waichatt_roles as any)?.rol
  };

  const isValid = await compare(pass, user.password);
  if (!isValid) {
    return null;
  }
  const rol = user.rol
  if (!rol) {
    return null;
  }

  return { id: String(user.id_cliente), email: user.email, name: user.name, rol: rol };
}
