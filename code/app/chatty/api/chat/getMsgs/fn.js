import { getAllMessagesByChatId } from "../../db/query/message.js"

/**
 * 
 * @type {import("@based/functions").BasedFunction<{chatId: string }, {id: string, message: {}, is_ai_message: 0 | 1}[]>}
 */
export default async (_based, _payload, _ctx) => {
    console.debug("Get all messages", "chatId", _payload.chatId )
    const messages =  await getAllMessagesByChatId(_payload.chatId) 
    return messages 
  }
