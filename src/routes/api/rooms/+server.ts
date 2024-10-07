import { json, type RequestHandler } from '@sveltejs/kit';

import { database } from '$lib/database';

export const GET: RequestHandler = async () => {
  const rooms = await database.room.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: { id: 'desc' }
  });
  
  return json({ rooms });
}

export const POST: RequestHandler = async ({ request }) => {
  const { name } = await request.json();

  if (!name) {
    return json({ error: 'Campo obrigatório não preenchido' }, { status: 400 });
  }

  try {
    const room = await database.room.create({
      data: { name },
      select: { id: true }
    });
    
    return json({ roomId: room.id });
  } catch (err) {
    console.error(err);
    
    return json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}