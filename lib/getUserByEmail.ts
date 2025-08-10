import { createClient } from '@supabase/supabase-js';
import { compare } from 'bcryptjs';

interface UserDB {
  id_cliente: string;
  email: string;
  password: string;
  name: string;
  rol: string;
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
  const { data, error } = await supabase
    .from('waichatt_usuarios_rol').select('id_cliente,email,password,name,rol').eq('email',email).single()
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
    id_cliente: dbUser.id_cliente,
    email: dbUser.email,
    password: dbUser.password,
    name: dbUser.name,
    rol: dbUser.rol
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
