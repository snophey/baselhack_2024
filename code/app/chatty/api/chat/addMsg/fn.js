
import { addMessage } from "../../db/query/message.js"
import { createNewChat, sessionExists } from "../../db/query/chat.js"
import { generateNextMessage } from './../../ai/generateNextMessage.js'

/**
 * 
 * @type {import("@based/functions").BasedFunction<{message: string, chatId: string }>}
 */
export default async (_based, _payload, _ctx) => {
    console.debug("Add new message", "sessionId", _ctx.session.authState.token )
   
    let chatId = _payload.chatId;
    console.log(await sessionExists(_ctx.session.authState.token))
    if(!await sessionExists(_ctx.session.authState.token)) {
      chatId = await createNewChat(_ctx.session.authState.token)
    }
   
    if(!chatId) throw new Error("Failed to create new chat. ")
    const m = await addMessage(chatId, _payload.message, false)

    // getSubscriptions().publish(`${chatId}`)
    await generateNextMessage(chatId)
    return { chatId }
  }
