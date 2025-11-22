import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { setupWebSocket } from './ws.js';
import { initDB } from './db.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Route imports
import dailyRouter from './routes/daily.js';
import assignRouter from './routes/assign.js';
import completeRouter from './routes/complete.js';
import studentRouter from './routes/student.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from server directory
dotenv.config({ path: join(__dirname, '../.env') });

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize WebSocket
const io = setupWebSocket(httpServer);

// Make io available to all routes via app.locals
app.locals.io = io;

console.log('🚀 Starting SparkWorks Server...');

// ============================================
// Middleware
// ============================================
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📥 ${req.method} ${req.path} - ${timestamp}`);
  next();
});

// ============================================
// Database Initialization
// ============================================
try {
  await initDB();
  console.log('✅ Database initialized successfully');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}

// ============================================
// Health & Status Routes
// ============================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/ping', (req, res) => {
  res.json({ 
    message: 'pong', 
    timestamp: new Date().toISOString() 
  });
});

// ============================================
// API Routes
// ============================================
app.use('/api/daily', dailyRouter);
app.use('/api/interventions/assign', assignRouter);
app.use('/api/interventions/complete', completeRouter);
app.use('/api/student', studentRouter);

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Server error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    path: req.path
  });
});

// ============================================
// Server Startup
// ============================================
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
  console.log('');
  console.log('✅ SparkWorks Server Ready!');
  console.log(`🌐 HTTP Server: http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket: ws://${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});

// ============================================
// Graceful Shutdown
// ============================================
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️ ${signal} received. Starting graceful shutdown...`);
  
  httpServer.close(async () => {
    console.log('🔌 HTTP server closed');
    
    try {
      // Close database connections
      if (global.db) {
        await global.db.end();
        console.log('💾 Database connections closed');
      }
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
export { httpServer, io };
