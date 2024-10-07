import { json, type RequestHandler } from '@sveltejs/kit';

import { database } from '$lib/database';

export const GET: RequestHandler = async ({ params }) => {
  const { roomId } = params;

  const room = await database.room.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      name: true
    }
  });
  
  if (!room) {
    return json({ error: 'Sala não encontrada' }, { status: 404 });
  }
  
  return json({ room });
}