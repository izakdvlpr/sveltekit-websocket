import { json, type RequestHandler } from '@sveltejs/kit';

import { database } from '$lib/database';

export const GET: RequestHandler = async () => {
  const rooms = await database.room.findMany({
    select: {
      id: true,
      name: true
    }
  });
  
  return json({ rooms });
}

export const POST: RequestHandler = async ({ request }) => {
  const { name } = await request.json();

  if (!name) {
    return json({ error: 'Missing fields' }, { status: 422 });
  }

  try {
    const room = await database.room.create({
      data: { name },
      select: { id: true }
    });
    
    return json({ roomId: room.id });
  } catch (err) {
    console.error(err);
    
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}