import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { building } from '$app/environment';
import { WEB_PORT, JWT_TOKEN } from '$env/static/private';

import { startWebSocketServer } from '$lib/server/websocket';
import { database } from '$lib/database';

const webSocketMiddleware: Handle = async ({ event, resolve }) => {
	if (!building && !globalThis.io) {
		const { io, clients } = startWebSocketServer();

		globalThis.io = io;
		globalThis.clients = clients;
	}

	if (globalThis.io && !event.locals.io) {
		event.locals.io = globalThis.io;
		event.locals.clients = globalThis.clients;
	}

	return resolve(event);
};

const PUBLIC_PATHS = [/^\/login$/, /^\/register$/];
const PROTECTED_PATHS = [/^\/rooms$/, /^\/rooms\/[a-zA-Z0-9]+?$/];

function isValidToken(accessToken: string) {
	try {
		jwt.verify(accessToken, JWT_TOKEN);

		return true;
	} catch {
		return false;
	}
}

async function getUserId(accessToken: string) {
	try {
		const decoded = jwt.decode(accessToken) as { userId: string };

		return decoded.userId;
	} catch {
		return null;
	}
}

async function isValidUser(userId: string) {
	try {
		const user = await database.user.findUnique({
			where: { id: userId },
			select: { id: true }
		});

		if (!user) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
}

const authenticationMiddleware: Handle = async ({ event, resolve }) => {
	const requestedPath = event.url.pathname;
	const accessToken = event.cookies.get('access-token');

	const isPublicPath = PUBLIC_PATHS.some((path) => path.test(requestedPath));

	if (isPublicPath && accessToken) {
		throw redirect(303, '/');
	}

	const isProtectedPath = PROTECTED_PATHS.some((path) => path.test(requestedPath));

	if (isProtectedPath) {
		if (!accessToken) {
			throw redirect(303, '/login');
		}

		if (!isValidToken(accessToken)) {
			throw redirect(303, '/login');
		}

		const userId = await getUserId(accessToken);

		if (!userId) {
			throw redirect(303, '/login');
		}

		const validUser = await isValidUser(userId);

		if (!validUser) {
			await axios.post(`http://localhost:${WEB_PORT}/api/sessions/logout`).catch(() => {});

			throw redirect(303, '/login');
		}

		event.locals.userId = userId;
	}

	return resolve(event);
};

export const handle = sequence(webSocketMiddleware, authenticationMiddleware);
