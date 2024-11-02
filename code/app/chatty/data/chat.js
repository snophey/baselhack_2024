import { getDatabase } from './db.js';

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
