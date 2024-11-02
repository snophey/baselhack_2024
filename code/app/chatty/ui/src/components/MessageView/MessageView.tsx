import { useContext, useEffect, useRef } from "react";
import { AppContext, Message as TMessage } from "../../AppContext";
import { Flex, rem, Text, useComputedColorScheme } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useClient } from "@based/react";
import Markdown from 'react-markdown'
import classes from './MessageView.module.css';

function Message({ msg }: { msg: TMessage }) {
  const colorScheme = useComputedColorScheme();

  let speechBubbleColor = colorScheme === 'dark' ? 'var(--mantine-color-gray-8)' : 'var(--mantine-color-gray-1)';
  if (!!msg.is_ai_message) {
    speechBubbleColor = colorScheme === 'dark' ? 'var(--mantine-color-gray-8)' : 'var(--mantine-color-lime-0)';
  } else {
    speechBubbleColor = colorScheme === 'dark' ? 'var(--mantine-color-gray-8)' : 'var(--mantine-color-gray-1)';
  }


  console.log(`Message: ${JSON.stringify(msg)}`);

  return (<Flex direction={"column"} style={{
    alignSelf: !!msg.is_ai_message ? 'flex-start' : 'flex-end',
  }}>
    <Text style={{
      fontWeight: 'bold',
    }} size={'sm'}>{!!msg.is_ai_message ? 'ChatAVB' : 'You'}</Text>
    <Text size={'md'} style={{
      padding: 'var(--mantine-spacing-sm)',
      borderRadius: 'var(--mantine-radius-lg)',
      width: 'fit-content',
      whiteSpace: 'pre-wrap',
      backgroundColor: speechBubbleColor,
      display: 'inline-block',
    }}>
      <Markdown className={classes.message}>
        {msg.message}
      </Markdown>
    </Text>
  </Flex>);
}

export function MessageView({ paddingBottom }: {paddingBottom: number}) {
  const { messages, setMessages } = useContext(AppContext);
  const { chatId } = useParams();
  const client = useClient();


  useEffect(() => {
    if (chatId) {
      client.call("chat:getMsgs", { chatId }).then((msgs: TMessage[]) => {
        setMessages(msgs);
        console.log(`Got messages for chat ${chatId}`, msgs);
      }, (err: any) => {
        console.error(err);
      });
    }
  }, [chatId]);

  // smooth scroll to the bottom of the chat if the messages change
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [messages]);

  return (
    <Flex direction={"column"} gap={"md"} style={{ height: "100%", overflowY: "auto", paddingBottom: rem(paddingBottom) }}>
      {messages.map((message) => (
        <Message key={message.id} msg={message} />
      ))}
    </Flex>
  )
}
