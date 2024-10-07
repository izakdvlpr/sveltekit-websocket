import { json, type RequestHandler } from '@sveltejs/kit';

import { database } from '$lib/database';

export const GET: RequestHandler = async ({ params }) => {
  const { userId } = params;

  const user = await database.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true
    }
  });
  
  if (!user) {
    return json({ error: 'Usuário não encontrado' }, { status: 404 });
  }
  
  return json({ user });
}