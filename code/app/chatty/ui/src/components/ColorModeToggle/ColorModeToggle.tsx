import {
  useMantineColorScheme,
  ActionIcon as Button,
  useComputedColorScheme,
  ActionIconProps
} from '@mantine/core';
import { ReactNode } from 'react';
import { PiSunBold as Sun } from "react-icons/pi";
import { PiMoonBold as Moon } from "react-icons/pi";


export function ColorModeToggle({
  sunIcon = <Sun size={20} />,
  moonIcon = <Moon size={20} />,
  ...buttonProps
}: { sunIcon?: ReactNode; moonIcon?: ReactNode } & ActionIconProps) {
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme();

  const toggleColorMode = () => {
    setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      size="lg"
      aria-label="Toggle Color Mode"
      onClick={toggleColorMode}
      variant='default'
      radius="md"
      {...buttonProps}
    >
      {colorScheme === 'light' ? moonIcon : sunIcon}
    </Button>
  );
}

export default ColorModeToggle;
