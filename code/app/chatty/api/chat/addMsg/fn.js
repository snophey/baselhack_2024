
import { addMessage, getAllMessagesByChatId } from "../../db/query/message.js"
import { createNewChat, sessionExists } from "../../db/query/chat.js"
import { getSubscriptions } from "../../db/subscription.js"


/**
 * Takes an array of messages representing a conversation and returns a response from the AI.
 * 
 * @param {Array<string>} messages Messages in the conversation
 */
const getAiResponse = async (messages) => {
  console.log("Waiting for 5 seconds") // TODO: remove
  await sleep(5000) // simulate long response generation time (TOOD: remove)
  // for now, simply echo the last message
  return messages[messages.length - 1];
}

/**
 * 
 * @type {import("@based/functions").BasedFunction<{message: string, chatId: string }>}
 */
export default async (_based, _payload, _ctx) => {
    console.debug("Add new message", "sessionId", _ctx.session.id )
   
    let chatId = _payload.chatId;
    console.log(await sessionExists(_ctx.session.id))
    if(!await sessionExists(_ctx.session.id)) {
      chatId = await createNewChat(_ctx.session.id)
    }
   
    if(!chatId) throw new Error("Failed to create new chat. ")
    const m = await addMessage(chatId, _payload.message, false)

<<<<<<< HEAD
    // get the conversation so far
    const messages =  await getAllMessagesByChatId(chatId);
    const resp = await getAiResponse(messages.map(m => m.message));

    // add the AI response to the chat
    await addMessage(chatId, resp, true);

    getSubscriptions().publish(`${chatId}`)
    console.log(m)
    console.log(chatId)
=======
    // getSubscriptions().publish(`${chatId}`)
    await generateNextMessage(chatId)
>>>>>>> 04ce64d (lets see)
    return { chatId }
  }
