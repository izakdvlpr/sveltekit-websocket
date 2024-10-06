import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { database } from '$lib/database';

export const load: PageServerLoad = async ({ depends }) => {
  const rooms = await database.room.findMany();
  
  depends('rooms');
  
  return { rooms }
}

export const actions: Actions = {
  createRoom: async ({ request }) => {
    const data = await request.formData();
    
		const name = data.get('name') as string;
    
    if (!name) {
			return fail(400, { error: "Missing fields" });
		}
    
    try {
      const room = await database.room.create({
        data: { name },
        select: { id: true }
      });
      
      return { roomId: room.id };
    } catch {
      return fail(500, { error: "Internal server error" });
    }
  },
	logout: async ({ cookies, locals }) => {
		cookies.delete('access-token', {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24
    })
    
    locals.userId = null;
    
    throw redirect(303, '/signin');
	}
};