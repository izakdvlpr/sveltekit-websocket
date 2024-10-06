import { fail, redirect, type Actions } from '@sveltejs/kit';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { JWT_TOKEN } from "$env/static/private"

import { database } from '$lib/database';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
    
		const name = data.get('name') as string;
		const email = data.get('email') as string;
		const password = data.get('password') as string;
    
    if (!name || !email || !password) {
			return fail(400, { error: "Missing fields" });
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
      
      const token = jwt.sign({ userId: user.id }, JWT_TOKEN, { expiresIn: '1d' });
      
      cookies.set('access-token', token, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24,
      })
    } catch (err: any) {
      if (err.code === 'P2002') {
        return fail(400, { error: "Email already in use" });
      }
      
      return fail(500, { error: "Internal server error" });
    }
    
    throw redirect(303, '/');
	}
};