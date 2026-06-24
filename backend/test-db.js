require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not defined in the environment variables.');
    process.exit(1);
  }
  
  try {
    await mongoose.connect(uri);
    console.log('Successfully connected to MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

testConnection();
