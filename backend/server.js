const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const { sequelize } = require('./models');
const seedDatabase = require('./seeders/seedData');

const authRoutes = require('./routes/authRoutes');
const hiveRoutes = require('./routes/hiveRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const healthRoutes = require('./routes/healthRoutes');
const actionRoutes = require('./routes/actionRoutes');
const batchRoutes = require('./routes/batchRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const simulatorRoutes = require('./routes/simulatorRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({
    platform: 'HONEYCHAIN – Predictive Hive Health & Smart Beekeeping API',
    status: 'ONLINE',
    version: '1.0.0',
    web_app: 'http://localhost:5173',
    api_healthcheck: 'http://localhost:5000/api/healthcheck'
  });
});

const os = require('os');

function getLocalLanIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// Health check
app.get('/api/healthcheck', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'HONEYCHAIN – Predictive Hive Health & Honey Traceability Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Network Info Endpoint for Phone QR Scanning
app.get('/api/network-info', (req, res) => {
  const lanIp = getLocalLanIp();
  res.json({
    lanIp,
    frontendPort: 5173,
    backendPort: config.PORT,
    lanOrigin: `http://${lanIp}:5173`
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/hives', hiveRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/simulator', simulatorRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start server and synchronize DB
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('[Database] Connection established successfully.');
    
    // Sync models
    await sequelize.sync({ alter: false });
    console.log('[Database] Schema synchronized.');

    // Auto-seed if database is empty
    await seedDatabase(false);

    app.listen(config.PORT, () => {
      console.log(`[HoneyChain] Backend API running on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.error('[HoneyChain] Unable to start server:', error);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
