
import { AppShell, Box, Burger } from '@mantine/core'
import { useDisclosure, useElementSize } from '@mantine/hooks';
import { ChatInput } from '../components/ChatInput/ChatInput';
import { MessageView } from '../components/MessageView/MessageView';
import { Logo } from '../components/Logo/Logo';

export function ChatPage() {
  const [opened, { toggle }] = useDisclosure();
  const { ref, height } = useElementSize();
  const { ref: logoRef, height: logoHeight, width: logoWidth } = useElementSize();

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
      <AppShell.Header display={"flex"} px='md' py='xs' style={{
        flexDirection: 'row',
      }}>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
          />
        <Box ref={logoRef}>
          <Logo width={logoWidth} height={logoHeight} />
        </Box>
      </AppShell.Header>

      <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

      <AppShell.Main>
        <MessageView paddingBottom={height} />
      </AppShell.Main>

      <AppShell.Footer ref={ref} withBorder={false}>
        <ChatInput />
      </AppShell.Footer>
    </AppShell>
  )
}
