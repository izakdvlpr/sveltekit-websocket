import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import jwt from 'jsonwebtoken'

import { startWebSocketServer } from '$lib/server/ws';
import { database } from '$lib/database';

const webSocketMiddleware: Handle = async ({ event, resolve }) => {
  if (!building && !globalThis.io && !event.locals.io) {
    const { io } = startWebSocketServer()
    
    globalThis.io = io
    event.locals.io = io
  }

  return resolve(event);
}

const PUBLIC_PATHS = [/^\/signin$/, /^\/signup$/];
const PROTECTED_PATHS = [/^\/$/, /^\/rooms\/(?:[a-zA-Z0-9]+)?$/];

const authenticationMiddleware: Handle = async ({ event, resolve }) => {
  const requestedPath = event.url.pathname;
	const accessToken = event.cookies.get('access-token');
  
  if (PUBLIC_PATHS.some((path) => path.test(requestedPath)) && accessToken) {
		throw redirect(303, '/');
	}
  
  if (PROTECTED_PATHS.some((path) => path.test(requestedPath))) {
    if (!accessToken) {
			throw redirect(303, '/signin');
		}
    
    try {
      const decoded = jwt.decode(accessToken) as { userId: string };
      
      const user = await database.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true }
      });
      
      if (!user) {
        throw redirect(303, '/signin');
      }
      
      event.locals.userId = decoded.userId;
    } catch {
      throw redirect(303, '/signin');
    }
  }
  
  return resolve(event);
}

export const handle = sequence(webSocketMiddleware, authenticationMiddleware);