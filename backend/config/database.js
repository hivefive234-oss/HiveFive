const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase();
let sequelize;

if (dialect === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'honeychain',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? false : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
  console.log('[Database] Configured for MySQL connection.');
} else {
  // SQLite fallback for frictionless local execution
  const storagePath = path.resolve(__dirname, '../../database/honeychain.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
  });
  console.log(`[Database] Configured for SQLite storage at: ${storagePath}`);
}

module.exports = sequelize;
