import { createClient } from '@supabase/supabase-js';
import {compare} from 'bcryptjs';

interface User {
  id: string;
  email: string;
  name: string ;
}

const supabase = createClient(
  process.env.DATABASE_URL ?? '',
  process.env.PUBLIC_ANON_KEY ?? ''
);

export async function getUserByEmail(email: string, pass: string): Promise<User | null> {
  const { data, error } = await supabase.from('waichatt_usuarios').select('id_cliente,email,password,name').eq('email', email).limit(1);

  if (error) {
    console.error('[Supabase error]', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const user:User = data[0];

  const isValid = await compare(pass, (user as any).password);
  if (!isValid) {
    return null;
  }

  return { id: String((user as any).id_cliente), email: user.email, name: user.name };
}
