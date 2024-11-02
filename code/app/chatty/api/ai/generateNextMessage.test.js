import test from 'ava'
import { generateNextMessage } from './generateNextMessage.js'
import { createNewChat } from '../db/query/chat.js'
import { addMessage } from '../db/query/message.js'


test('test ai', async (t) => {

  const chatId =  await createNewChat(1)
  await addMessage(chatId, "Bitte listen Sie alle Versicherungspläne auf, die PAX anbietet?", 0)
  await generateNextMessage(chatId)
  t.assert(true)
})