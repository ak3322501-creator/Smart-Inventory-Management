require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connect } = require('./db');
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const suppliersRouter = require('./routes/suppliers');
const salesRouter = require('./routes/sales');
const alertsRouter = require('./routes/alerts');
const predictionRouter = require('./routes/prediction');
const uploadRouter = require('./routes/upload');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', async (req, res, next) => {
  try {
    await connect();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed.' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/products', requireAuth, productsRouter);
app.use('/api/suppliers', requireAuth, suppliersRouter);
app.use('/api/sales', requireAuth, salesRouter);
app.use('/api/alerts', requireAuth, alertsRouter);
app.use('/api/prediction', requireAuth, predictionRouter);
app.use('/api/upload', requireAuth, uploadRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', database: 'connected', time: new Date() }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON request body.' });
  }

  if (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Server error.' });
  }

  next();
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Smart Inventory API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
