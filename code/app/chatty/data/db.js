import sqlite3 from 'sqlite3';
import os from 'os';
  
let db = null;

const randomFilename = () => {
  return Math.random().toString(36).substring(7);
}

// sleep for a given number of milliseconds
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const initDatabase = async () => {
  const dbPath = process.env.DB_PATH || `${os.tmpdir()}/${randomFilename()}.db`;
  db = new sqlite3.Database(dbPath);
  // Create the message table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT NOT NULL,
    message TEXT NOT NULL,
    is_ai_message BOOLEAN NOT NULL
  )`);

  // Create the chat table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS chat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT NOT NULL,
    session_id TEXT NOT NULL
  )`);

  // Wait for the database to be ready
  await sleep(1000);

  return db;
}

export const getDatabase = async () => {
  if (!db) {
    await initDatabase();
  }
  return db;
}

export const closeDatabase = () => {
  if (db) {
    db.close();
  }
}

export default getDatabase;
