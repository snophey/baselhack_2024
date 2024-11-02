import { useContext, useEffect } from "react";
import { AppContext, Message as TMessage } from "../../AppContext";
import { Flex, rem, Text, useComputedColorScheme } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useClient } from "@based/react";

function Message(msg: TMessage) {
  const colorScheme = useComputedColorScheme();

  const speechBubbleColor = colorScheme === 'dark' ? 'var(--mantine-color-gray-8)' : 'var(--mantine-color-gray-1)';

  return (<Flex direction={"column"}>
    <Text style={{
      fontWeight: 'bold',
    }} size={'sm'}>{!!msg.isAiMessage ? 'ChatAVB' : 'You'}</Text>
    <Text size={'md'} style={{
      padding: 'var(--mantine-spacing-sm)',
      borderRadius: 'var(--mantine-radius-lg)',
      width: 'fit-content',
      whiteSpace: 'pre-wrap',
      backgroundColor: speechBubbleColor,
      display: 'inline-block',
    }}>
      {msg.text}
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

  return (
    <Flex direction={"column"} gap={"md"} style={{ height: "100%", overflowY: "auto", paddingBottom: rem(paddingBottom) }}>
      {messages.map((message) => (
        <Message key={message.id} {...message} />
      ))}
    </Flex>
  )
}
