require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { sequelize } = require('./models');
const { webhook } = require('./controllers/paymentController');

const app = express();

// After deploying, set CLIENT_URL to your website link (Vercel). Several links can be separated by commas.
const origins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
  : true;
app.use(cors({ origin: origins }));

// Must come BEFORE express.json(), Stripe needs the raw body to verify the signature
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), webhook);

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

app.get('/', (req, res) => res.send('E-commerce API running'));

// Creates the database on first run, so you do not have to do it by hand in MySQL
async function ensureDatabase() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await conn.end();
}

const PORT = process.env.PORT || 5000;

ensureDatabase()
  .catch((err) => console.log('Could not auto-create the database (fine if it already exists):', err.message))
  .then(() => sequelize.sync({ alter: process.env.NODE_ENV !== 'production' }))
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => console.error('DB connection failed:', err.message));
