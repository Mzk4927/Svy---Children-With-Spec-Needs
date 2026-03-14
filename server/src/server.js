const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const prisma = require('./config/database');
const { corsOptions, socketCorsOptions } = require('./config/cors');

const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const statsRoutes = require('./routes/statsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Express ko batao ke wo Railway ke load balancer (proxy) par trust kare
app.set('trust proxy', 1);

const server = http.createServer(app);
const io = socketIO(server, {
  cors: socketCorsOptions
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.get('/uploads/:filename', (req, res, next) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);

  fs.readFile(filePath, (err, data) => {
    if (err) return next();

    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.jfif') {
      res.type('image/jpeg');
    } else if (ext === '.png') {
      res.type('image/png');
    } else if (ext === '.gif') {
      res.type('image/gif');
    } else {
      // Handle legacy files saved without extension by sniffing magic bytes.
      if (data.length >= 4 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
        res.type('image/jpeg');
      } else if (data.length >= 8 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) {
        res.type('image/png');
      } else if (data.length >= 4 && data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x38) {
        res.type('image/gif');
      }
    }

    res.sendFile(filePath);
  });
});
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.jfif') {
      res.setHeader('Content-Type', 'image/jpeg');
    }
    if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    }
    if (ext === '.gif') {
      res.setHeader('Content-Type', 'image/gif');
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join-room', (userId) => {
    socket.join(userId);
  });
  
  socket.on('record-updated', (data) => {
    // Broadcast to all users in the same organization
    socket.to(data.orgId).emit('records-changed', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), corsConfigured: Boolean(process.env.CLIENT_URL) });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.initDatabase();
    console.log('✅ Connected to PostgreSQL');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err);
    process.exit(1);
  }
};

const shutdown = async () => {
  await prisma.closeDatabase();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();