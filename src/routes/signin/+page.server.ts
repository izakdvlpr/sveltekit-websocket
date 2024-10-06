import { fail, redirect, type Actions } from '@sveltejs/kit';
import { JWT_TOKEN } from "$env/static/private"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import { database } from '$lib/database';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
    
		const email = data.get('email') as string;
		const password = data.get('password') as string;
    
    if (!email || !password) {
			return fail(400, { error: "Missing fields" });
		}
    
    try {
      const user = await database.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        return fail(400, { error: "Invalid email or password" });
      }
      
      const valid = await bcrypt.compare(password, user.password);
      
      if (!valid) {
        return fail(400, { error: "Invalid email or password" });
      }
      
      const token = jwt.sign({ userId: user.id }, JWT_TOKEN, { expiresIn: '1d' });
      
      cookies.set('access-token', token, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24
      })
    } catch (err: any) {
      return fail(500, { error: "Internal server error" });
    }
    
    throw redirect(303, '/');
	}
};