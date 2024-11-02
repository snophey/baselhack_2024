import test from 'ava'
import { BasedClient } from '@based/client'


test('functions', async (t) => {
  const client = new BasedClient()
  await client.connect({
    url: 'ws://localhost:8000' 
  })
  


  const { chatId } = await client.call("chat:addMsg", { message: "First msg." })
  t.deepEqual(chatId, 1, "Chat Id must be defined.")
  t.teardown(() => {
    client.disconnect()
  })

})