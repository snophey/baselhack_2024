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
  console.log(`Using database at ${dbPath}`);
  db = new sqlite3.Database(dbPath);
  // Create the message table if it doesn't exist
  await new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS message (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      is_ai_message BOOLEAN NOT NULL
  )`, (result, err) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  })

  // Create the chat table if it doesn't exist
  await new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS chat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL
  )`, (result, err) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  })

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
