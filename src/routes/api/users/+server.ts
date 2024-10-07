import { json, type RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcryptjs'

import { database } from '$lib/database';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { name, email, password } = await request.json();
  
  if (!name || !email || !password) {
    return json({ error: "Campos obrigatórios não preenchidos" }, { status: 422 });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
      
    const user = await database.user.create({
      data: { 
        name,
        email,
        password: hashedPassword
      },
      select: { id: true }
    });
    
    return json({ userId: user.id });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return json({ error: "Email já cadastrado" }, { status: 409 });
    }
    
    console.error(err);
    
    return json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}