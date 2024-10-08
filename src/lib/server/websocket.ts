import { Server } from 'socket.io';

import { database } from '$lib/database';

export function startWebSocketServer(): { io: Server; clients: Map<string, string> } {
	const clients = new Map<string, string>();

	const io = new Server(Number(process.env.PUBLIC_SOCKET_PORT), {
		path: '/',
		cors: { origin: '*' }
	});

	io.on('connection', async (socket) => {
		const { userId, roomId } = socket.handshake.query as Record<string, string>;

		if (!userId || !roomId) {
			return;
		}

		const user = await database.user.findUnique({
			where: { id: userId },
			select: { id: true, name: true }
		});

		if (!user) {
			return;
		}

		const room = await database.room.findUnique({
			where: { id: roomId },
			select: { id: true }
		});

		if (!room) {
			return;
		}

		socket.join(roomId);

		clients.set(userId, roomId);

		const joinedMessage = await database.message.create({
			data: { content: `${user.name} entrou na sala.`, roomId },
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

		socket.to(roomId).emit('message', joinedMessage);

		console.log(`[ws] User connected to room ${roomId}`);

		socket.on('disconnect', async () => {
			socket.leave(roomId);

			clients.delete(userId);

			const leftMessage = await database.message.create({
				data: { content: `${user.name} saiu da sala.`, roomId },
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

			socket.to(roomId).emit('message', leftMessage);

			console.log(`[ws] User disconnected from room ${roomId}`);
		});
	});

	console.log(`[ws] Server started on port ${process.env.PUBLIC_SOCKET_PORT}`);

	return { io, clients };
}
