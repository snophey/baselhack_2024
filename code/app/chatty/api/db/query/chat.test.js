import { describe } from "node:test";
import { getAllMessagesByChatId, addMessage } from "./message";
import { createNewChat, getAllChatsBySessionId } from "./chat";

describe('getAllMessagesByChatId', () => {
  it('should retrieve all messages by chat ID', async () => {

    const chatId = '123';
    const expectedMessages = [
      { id: 1, chat_id: 123, message: 'Hello', is_ai_message: 0 },
      { id: 2, chat_id: 123, message: 'Hi', is_ai_message: 0 },
    ];

    // insert some messages into the database
    await addMessage(expectedMessages[0].chat_id, expectedMessages[0].message, expectedMessages[0].is_ai_message, (err, lastId) => {
      expect(err).toBeNull();
    });

    await addMessage(expectedMessages[1].chat_id, expectedMessages[1].message, expectedMessages[1].is_ai_message, (err, lastId) => {
      expect(err).toBeNull();
    });

    // Call the function
    const messages = await getAllMessagesByChatId(chatId);

    // Verify the result
    expect(messages).toEqual(expectedMessages);
  });
});

describe('createNewChat', () => {
  it('should create a new chat', async () => {
    const sessionId = 'abc';
    const chatId1 = await createNewChat(sessionId);
    expect(chatId1).toBeGreaterThan(0);

    // create a new chat again and verify that the chat ID is different
    const chatId2 = await createNewChat(sessionId);
    expect(chatId2).toBeGreaterThan(chatId1);

    // get all chats for the session ID
    const chats = await getAllChatsBySessionId(sessionId);

    // verify that the chat IDs match
    expect(chats.length).toBe(2);
    expect(chats[0].id).toBe(chatId1);
    expect(chats[1].id).toBe(chatId2);
  });
});
