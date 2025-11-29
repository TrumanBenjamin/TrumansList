const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

let client;
let db;

async function connectToDb() {
  if (db) return db;

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(process.env.DB_NAME);
  console.log('✅ Connected to MongoDB Atlas');
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not connected. Try again!');
  }
  return db;
}

module.exports = { connectToDb, getDb };
