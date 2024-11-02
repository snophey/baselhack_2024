import { getDatabase } from '../db.js';

/**
 * Create a new chat in the database
 * @param {string} sessionId Session ID that this chat belongs to
 * @returns {Promise<number>} A promise that resolves to the ID of the new chat
 */
export async function createNewChat(sessionId) {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO chat (session_id) VALUES (?)';
    db.run(query, [sessionId], function(err) {
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
  getAllChatsBySessionId,
}
