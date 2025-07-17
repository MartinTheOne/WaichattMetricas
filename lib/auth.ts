import { createClient } from '@supabase/supabase-js';
import {compare} from 'bcryptjs';

interface User {
  id: string;
  email: string;
  password: string;
}

const supabase = createClient(
  process.env.DATABASE_URL ?? '',
  process.env.PUBLIC_ANON_KEY ?? ''
);

export async function getUserByEmail(email: string, pass: string): Promise<User | null> {
  const { data, error } = await supabase.rpc('get_usuario_por_email', {
    email_arg: email
  });

  if (error) {
    console.error('[Supabase error]', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const user:User = data[0];
  console.log(user.password)

  const isValid = await compare(pass, user.password);
  console.log("isValid", isValid);
  if (!isValid) {
    return null;
  }
  
  return { id: user.id, email: user.email, password: '' };
}
