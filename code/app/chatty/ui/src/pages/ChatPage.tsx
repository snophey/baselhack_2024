
import { AppShell, Burger } from '@mantine/core'
import { useDisclosure, useElementSize } from '@mantine/hooks';
import { ChatInput } from '../components/ChatInput/ChatInput';
import { MessageView } from '../components/MessageView/MessageView';

export function ChatPage() {
  const [opened, { toggle }] = useDisclosure();
  const { ref, height } = useElementSize();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
        <div>Logo</div>
      </AppShell.Header>

      <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

      <AppShell.Main>
        <MessageView paddingBottom={height} />
      </AppShell.Main>

      <AppShell.Footer ref={ref}>
        <ChatInput />
      </AppShell.Footer>
    </AppShell>
  )
}
