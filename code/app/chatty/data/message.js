import { getDatabase } from './db.js';

/**
 * Retrieve all messages by chat ID
 * @param {string} chatId The chat ID to retrieve messages for
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of message objects
 */
export async function getAllMessagesByChatId(chatId) {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM message WHERE chat_id = ? ORDER BY id ASC';
    db.all(query, [chatId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Add a message to the database
 * @param {string} chatId The chat ID to add the message to
 * @param {string} message The message text to add
 * @param {boolean} isAiMessage Whether the message is from the AI
 * @param {function(Error, number)} callback The callback function that receives the error and the last inserted row ID (if failed or successful respectively)
 */
export async function addMessage(chatId, message, isAiMessage, callback) {
  const db = await getDatabase();
  const query = 'INSERT INTO message (chat_id, message, is_ai_message) VALUES (?, ?, ?)';
  db.run(query, [chatId, message, isAiMessage], function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, this.lastID);
    }
  });
}

// Export the functions
export default {
  getAllMessagesByChatId,
  addMessage,
}
