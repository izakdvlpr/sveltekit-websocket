import { Server } from 'socket.io';

import { database } from '$lib/database';

export function startWebSocketServer(): { io: Server } {
  const io = new Server(3001, {
    path: '/',
    cors: { origin: '*' }
  })
  
  io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId as string;
    
    if (!userId) {
      return
    }
    
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, status: true }
    });
    
    if (!user) {
      return
    }
    
    await database.user.update({
      where: { id: userId },
      data: { status: 'online' }
    });
    
    console.log('a user connected');
    
    socket.on('disconnect', async () => {
      await database.user.update({
        where: { id: userId },
        data: { status: 'offline' }
      });
      
      console.log('user disconnected');
    });
  });
  
  console.log('WebSocket server started');
  
  return { io }
}