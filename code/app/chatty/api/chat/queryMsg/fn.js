import { getAllMessagesByChatId } from "../../db/query/message.js"



/**
 * 
 * @type {import("@based/functions").BasedQueryFunction<{chatId: string}, {messages: []}>}
 */
export default async (_based, _payload, update) => {
  console.debug("Get message with chatId", _payload.chatId)
  if (!_payload.chatId) {
    throw new Error("Invalid payload. Please provide a chatId.")
  }
  
  update(await getAllMessagesByChatId(_payload.chatId))


  return () => {

  }
}
