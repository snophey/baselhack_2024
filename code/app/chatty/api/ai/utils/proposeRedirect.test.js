import test from 'ava'
import { isReadyToProposeRedirect } from './proposeRedirect.js'
import { getAllMessagesByChatId } from "../../db/query/message.js";

test('propose redirect ', async (t) => {

  let isread = await isReadyToProposeRedirect([
    {
      content: "Hallo Ich bin neu hier was gibs?",
      role: 'user'
    }
  ])

  t.false(isread)

  isread = await isReadyToProposeRedirect([

    {
      content: "Hallo Ich bin neu hier was gibs?",
      role: 'user'
    },
    {
      content: "Wir verkaufen 3 Produkte.",
      role: 'assistant'
    },
    {
      content: "Das erste Produkt ist interessant!",
      role: 'user'
    },
  ])

  t.true(isread)
})