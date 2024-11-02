import { getAllMessagesByChatId } from "../../db/query/message.js"
import { getSubscriptions } from "../../db/subscription.js"



/**
 * 
 * @type {import("@based/functions").BasedQueryFunction<{chatId: string}, {messages: []}>}
 */
export default async (_based, _payload, update) => {
  console.log(_payload)
  console.debug("Get message with chatId", _payload.chatId)
  if (!_payload.chatId) {
    throw new Error("Invalid payload. Please provide a chatId.")
  }
  

  update(await getAllMessagesByChatId(_payload.chatId))

  // const subscriptions = getSubscriptions()
 
  const cb = () => {
    getAllMessagesByChatId(_payload.chatId).then(console.log) 
    getAllMessagesByChatId(_payload.chatId).then(update)
  } 
  
 //  subscriptions.subscribe(`${chatId}`, cb)

  return () => {
    console.log("unsub")
 //   subscriptions.unsubscribe(cb)
  }
}
