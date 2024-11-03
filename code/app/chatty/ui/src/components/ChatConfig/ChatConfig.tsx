import { Flex, Group, Radio, Stack, Text } from "@mantine/core";
import classes from "./ChatConfig.module.css";
import { TONE_CASUAL, TONE_CHILD, TONE_FORMAL, TONE_NEUTRAL, toneAtom } from "../../AppContext";
import { useAtom } from "jotai";

const data = [
  {
    name: "Casual",
    value: TONE_CASUAL,
    description: "Als ob die Erklärungen von einem Kumpel kommen würden",
  },
  {
    name: "Neutral",
    value: TONE_NEUTRAL,
    description: "Neutraler Ton, wie in einer Nachrichtensendung.",
  },
  {
    name: "Formal",
    value: TONE_FORMAL,
    description:
      "Als ob die Erklärung für den König von England bestimmt wäre.",
  },
  {
    name: "Kindgerecht 👶",
    value: TONE_CHILD,
    description: "Ich bin noch ein Kind, also alles bitte möglichst einfach erklären!",
  },
];

export function ChatConfig() {
  const [tone, setTone] = useAtom(toneAtom);

  const cards = data.map((item) => (
    <Radio.Card
      className={classes.root}
      radius="md"
      value={item.value}
      key={item.value}
    >
      <Group wrap="nowrap" align="flex-start">
        <Radio.Indicator />
        <div>
          <Text className={classes.label}>{item.name}</Text>
          <Text className={classes.description}>{item.description}</Text>
        </div>
      </Group>
    </Radio.Card>
  ));

  return (
    <Flex direction={"column"} gap={"md"}>
      <Radio.Group
        value={tone}
        onChange={setTone}
        label="Wähle den Ton des Chats"
        description="Möchtest du, dass der Chat freundlich oder formell klingt? Willst du präzisere aber komplexere Antworten oder lieber etwas vereinfachte Erklärungen?"
      >
        <Stack pt="md" gap="xs">
          {cards}
        </Stack>
      </Radio.Group>
    </Flex>
  );
}
