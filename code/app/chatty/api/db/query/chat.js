import { getDatabase } from '../db.js';


/**
 * Check if session exists 
 * @param {string} sessionId Session ID that this chat belongs to
 * @returns {Promise<boolean>} A promise that resolves to true if the session exists
 */
export async function sessionExists(sessionId) {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const query = 'SELECT 1 FROM chat WHERE session_id = ? LIMIT 1';

    db.get(query, [sessionId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(!!row); // true if a row is found, false otherwise
      }
    });
  });
}


  
/**
 * Create a new chat in the database
 * @param {string} sessionId Session ID that this chat belongs to
 * @returns {Promise<number>} A promise that resolves to the ID of the new chat
 */
export async function createNewChat(sessionId) {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO chat (session_id) VALUES (?)';
    db.run(query, [sessionId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

/**
 * Retrieve all chats for a given session ID
 * @param {string} sessionId 
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of chat objects
 */
export async function getAllChatsBySessionId(sessionId) {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM chat WHERE session_id = ? ORDER BY id ASC';
    db.all(query, [sessionId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export default {
  createNewChat,
  sessionExists,
  getAllChatsBySessionId,
}
