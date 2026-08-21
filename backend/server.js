import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initWebSocket } from './websocket/websocket.js';
import logMonitorService from './services/logMonitorService.js';
import { bootstrapAdmin } from './utils/bootstrap.js';

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    process.exit(1);
  }

  try {
    // 1. Connect to Database
    await connectDB();
    
    // 1.5 Bootstrap Admin
    await bootstrapAdmin();
    
    // 2. Create HTTP Server
    const server = http.createServer(app);
    
    // 3. Initialize WebSocket
    initWebSocket(server);
    
    // 4. Start listening
    server.listen(PORT, () => {
      console.log('\n=============================================');
      console.log('       SOC/IT Log Analyzer Backend           ');
      console.log('=============================================');
      console.log(`✅ Backend:        READY (Port ${PORT})`);
      console.log(`✅ MongoDB:        CONNECTED`);
      console.log(`✅ WebSocket:      READY (Endpoint /ws/logs)`);
      
      const mode = process.env.LOG_SOURCE_MODE || (process.platform === 'win32' ? 'windows' : 'linux');
      console.log(`✅ Monitor Mode:   ${mode.toUpperCase()}`);
      
      // 5. Start Log Monitor
      logMonitorService.start();
      console.log(`✅ Log Generation: RUNNING`);
      
      if (logMonitorService.monitoredSources.length > 0) {
        console.log(`✅ Sources:        ${logMonitorService.monitoredSources.join(', ')}`);
      } else {
        console.log(`❌ Sources:        UNAVAILABLE or NONE`);
      }
      console.log('=============================================\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      logMonitorService.stop();
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      logMonitorService.stop();
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
