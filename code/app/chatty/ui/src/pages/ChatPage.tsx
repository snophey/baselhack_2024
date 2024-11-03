
import { AppShell, Box, Burger } from '@mantine/core'
import { useDisclosure, useElementSize } from '@mantine/hooks';
import { ChatInput } from '../components/ChatInput/ChatInput';
import { MessageView } from '../components/MessageView/MessageView';
import { Logo } from '../components/Logo/Logo';
import ColorModeToggle from '../components/ColorModeToggle/ColorModeToggle';
import { useParams } from 'react-router-dom';
import { Hero } from '../components/Hero/Hero';
import { ChatConfig } from '../components/ChatConfig/ChatConfig';

export function ChatPage() {
  const [opened, { toggle }] = useDisclosure();
  const { ref, height } = useElementSize();
  const { ref: logoRef, height: logoHeight, width: logoWidth } = useElementSize();
  const { chatId } = useParams();

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
        justifyContent: 'space-between',
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
        <ColorModeToggle />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ChatConfig />
      </AppShell.Navbar>

      <AppShell.Main>
        {
          chatId ? <MessageView paddingBottom={height} /> : <Hero />
        }
      </AppShell.Main>

      <AppShell.Footer ref={ref} withBorder={false}>
        <ChatInput />
      </AppShell.Footer>
    </AppShell>
  )
}
