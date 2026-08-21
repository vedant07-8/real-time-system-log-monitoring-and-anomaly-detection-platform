import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

let wss = null;

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ 
    server, 
    path: '/ws/logs',
    verifyClient: (info, cb) => {
      const url = new URL(info.req.url, 'http://localhost');
      const token = url.searchParams.get('token');
      try {
        if (!token) throw new Error('Missing token');
        jwt.verify(token, process.env.JWT_SECRET);
        cb(true);
      } catch (error) {
        console.error(`Rejected unauthenticated WebSocket connection: ${error.message}`);
        cb(false, 401, 'Unauthorized');
      }
    }
  });

  wss.on('connection', (ws, request) => {

    const clientIp = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    console.log(`🔌 [WS] Client connected from ${clientIp}. Total connected: ${wss.clients.size}`);

    ws.on('message', (message) => {
      if (message.toString() === 'ping') {
        ws.send('pong');
      }
    });

    ws.on('close', () => {
      console.log(`🔌 [WS] Client disconnected (${clientIp}). Total connected: ${wss.clients.size}`);
    });

    ws.on('error', (error) => {
      console.error(`🔌 [WS] Client error (${clientIp}):`, error);
    });
  });

  return wss;
};

export const getConnectedClientsCount = () => {
  return wss ? wss.clients.size : 0;
};

export const broadcast = (type, data) => {
  if (!wss) return;

  const payload = JSON.stringify({ type, data });
  let recipientCount = 0;

  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = WebSocket.OPEN
      try {
        client.send(payload);
        recipientCount++;
      } catch (err) {
        console.error(`🔌 [WS] Error sending broadcast to client, closing connection:`, err);
        client.terminate();
      }
    }
  });

  // Only log if there were actually clients to broadcast to, to avoid spam if empty
  if (recipientCount > 0) {
    // console.log(`🔌 [WS] Broadcast '${type}' sent to ${recipientCount} client(s).`);
  }
};
