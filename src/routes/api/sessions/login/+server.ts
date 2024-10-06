import { json, type RequestHandler } from '@sveltejs/kit';
import { JWT_TOKEN } from "$env/static/private"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import { database } from '$lib/database';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { email, password } = await request.json();
  
  if (!email || !password) {
    return json({ error: "Missing fields" }, { status: 422 });
  }
  
  try {
    const user = await database.user.findUnique({
      where: { email },
      select: { id: true, password: true }
    });
    
    if (!user) {
      return json({ error: "Invalid email or password" }, { status: 400 });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      return json({ error: "Invalid email or password" }, { status: 400 });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_TOKEN, { expiresIn: '1d' });
    
    cookies.set('access-token', token, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24
    })
    
    return json({ success: true });
  } catch (err) {
    console.error(err);
    
    return json({ error: "Internal server error" }, { status: 500 });
  }
}