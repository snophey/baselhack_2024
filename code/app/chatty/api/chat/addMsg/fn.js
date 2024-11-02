import chat, { createNewChat, sessionExists } from "../../db/query/chat.js"
import message, { addMessage } from "../../db/query/message.js"
import { getSubscriptions } from "../../db/subscription.js"

/**
 * 
 * @type {import("@based/functions").BasedFunction<{messages: string, chatId: string }>}
 */
export default async (_based, _payload, _ctx) => {
    console.debug("Add new message", "sessionId", _ctx.session.id )
   
    let chatId = _payload.chatId;
    console.log(await sessionExists(_ctx.session.id))
    if(!await sessionExists(_ctx.session.id)) {
      chatId = await createNewChat(_ctx.session.id)
    }
   
    if(!chatId) throw new Error("Failed to create new chat. ")
    const m = await addMessage(chatId, message, false)

    getSubscriptions().publish(`${chatId}`)
    console.log(m)
    console.log(chatId)
    return { chatId }
  }
