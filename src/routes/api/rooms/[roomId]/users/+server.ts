import { json, type RequestHandler } from '@sveltejs/kit';

import { database } from '$lib/database';

export const GET: RequestHandler = async ({ locals, params }) => {
  const { clients } = locals;
  const { roomId } = params;
  
  const users = await database.user
    .findMany({ select: { id: true, name: true } })
    .then(users => users.map(user => ({
      ...user,
      status: clients.has(user.id) && clients.get(user.id) === roomId ? 'online' : 'offline'
    })))

  return json({ users: users.sort((a, b) => b.status.localeCompare(a.status)) });
}