import { useContext } from "react";
import { AppContext, Message as TMessage } from "../../AppContext";
import { Flex, rem, Text } from "@mantine/core";

function Message(msg: TMessage) {
  return (<Flex direction={"column"}>
    <Text style={{
      fontWeight: 'bold',
    }} size={'sm'}>{!!msg.isAiMessage ? 'ChatAVB' : 'You'}</Text>
    <Text size={'md'} style={{
      padding: 'var(--mantine-spacing-sm)',
      borderRadius: 'var(--mantine-radius-lg)',
      width: 'fit-content',
      whiteSpace: 'pre-wrap',
      backgroundColor: !!msg.isAiMessage ? 'var(--mantine-color-grape-1)' : 'var(--mantine-color-lime-1)',
      display: 'inline-block',
    }}>
      {msg.text}
    </Text>
  </Flex>);
}

export function MessageView({ paddingBottom }: {paddingBottom: number}) {
  const { messages } = useContext(AppContext);

  return (
    <Flex direction={"column"} gap={"md"} style={{ height: "100%", overflowY: "auto", paddingBottom: rem(paddingBottom) }}>
      {messages.map((message) => (
        <Message key={message.id} {...message} />
      ))}
    </Flex>
  )
}
