import { json, type RequestHandler } from '@sveltejs/kit';

import { database } from '$lib/database';

export const GET: RequestHandler = async ({ params }) => {
  const { roomId } = params;

  const messages = await database.message.findMany({
    where: { roomId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })
  
  if (!messages) {
    return json({ error: 'Sala não encontrada' }, { status: 404 });
  }
  
  return json({ messages });
}

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const { io } = locals;
  const { roomId } = params;
  
  const { content, userId } = await request.json();

  if (!roomId || !content || !userId) {
    return json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
  }
  
  try {
    const message = await database.message.create({
      data: { content, userId, roomId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    io.to(roomId).emit('message', message);
    
    return json({ message });
  } catch (err) {
    console.error(err)
    
    return json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}