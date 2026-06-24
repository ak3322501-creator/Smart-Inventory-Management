const mongoose = require('mongoose');

let cachedConnection = null;

async function connect() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME || 'smart-inventory';
  if (!uri) {
    throw new Error('MONGO_URI is not defined in the environment variables.');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }
  
  cachedConnection = mongoose.connect(uri, { dbName })
    .then(() => {
    console.log(`Successfully connected to MongoDB database "${dbName}".`);
      return mongoose.connection;
    })
    .catch((err) => {
      cachedConnection = null;
      console.error('Error connecting to MongoDB:', err);
      throw err;
    });

  return cachedConnection;
}

function generateId() {
  // We may not need this as Mongoose generates ObjectIds automatically,
  // but keeping it for potential backward compatibility if needed in UI temporarily.
  return new mongoose.Types.ObjectId().toString();
}

module.exports = { connect, generateId };
