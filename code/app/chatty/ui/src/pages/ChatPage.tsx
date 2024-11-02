
import { AppShell, Burger } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks';
import { ChatInput } from '../components/ChatInput/ChatInput';

export function ChatPage() {
  const [opened, { toggle }] = useDisclosure();

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
      </AppShell.Main>

      <AppShell.Footer>
        <ChatInput />
      </AppShell.Footer>
    </AppShell>
  )
}
