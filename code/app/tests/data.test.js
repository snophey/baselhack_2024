import { getAllMessagesByChatId, addMessage } from "../chatty/data/message";

describe('getAllMessagesByChatId', () => {
  it('should retrieve all messages by chat ID', async () => {

    const chatId = '123';
    const expectedMessages = [
      { id: 1, chat_id: '123', message: 'Hello', is_ai_message: 0 },
      { id: 2, chat_id: '123', message: 'Hi', is_ai_message: 0 },
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
