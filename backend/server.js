const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production and development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000', // Development frontend
      'http://localhost:3001', // Alternative dev port
    ];
    
    // In production, allow Railway domains and your custom domain
    if (process.env.NODE_ENV === 'production') {
      allowedOrigins.push(
        process.env.FRONTEND_URL,
        /^https:\/\/.*\.up\.railway\.app$/
      );
    }
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
const dbConfig = require('./config/database');
dbConfig.initializeDatabase();

// Health check endpoint (moved before API routes)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Employee Management System API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/analytics', require('./routes/analytics'));

// API Health check (keep both for compatibility)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Employee Management API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing - return all requests to React app
  // This must come after API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // Development mode - show API info
  app.get('/', (req, res) => {
    res.json({
      message: 'Employee Management System API',
      version: '1.0.0',
      environment: 'development',
      endpoints: {
        health: '/health or /api/health',
        auth: '/api/auth/*',
        employees: '/api/employees/*',
        analytics: '/api/analytics/*'
      }
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404 for API routes only (not in production for React routing)
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'API route not found',
    availableRoutes: ['/api/auth', '/api/employees', '/api/analytics', '/api/health']
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Frontend served from: ${path.join(__dirname, '../frontend/build')}`);
  } else {
    console.log(`🛠️  Development mode - Frontend should run separately on port 3000`);
  }
  
  console.log(`🔄 Database initialized successfully`);
});