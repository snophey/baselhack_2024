import test from 'ava'
import { BasedClient } from '@based/client'


test('functions', async (t) => {
  const client = new BasedClient()
  await client.connect({
    url: 'ws://localhost:8000' 
  })
  
  


  const { chatId } = await client.call("chat:addMsg", { message: "First msg." })
  t.deepEqual(chatId, 1, "Chat Id must be defined.")
  
  const { chatId: chatIdSecondCall } = await client.call("chat:addMsg", { message: "First msg.", chatId })
  t.deepEqual(chatIdSecondCall, 1, "Chat Id should not change.")

  let messages =  await client.call("chat:getMsgs", { chatId })
  console.log(messages)
  t.deepEqual(messages.length, 2, "Messages")




  t.teardown(() => {
    client.disconnect()
  })

})