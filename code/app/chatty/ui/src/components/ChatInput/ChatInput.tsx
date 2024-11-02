import { Textarea, ActionIcon } from "@mantine/core";
import { useCallback, useContext, useRef, useState } from "react";
import { AppContext } from "../../AppContext";
import { PiPaperPlaneBold } from "react-icons/pi";
import { useRevalidator } from "react-router-dom";

export function ChatInput() {
  const [userInput, setUserInput] = useState("");
  const { onMessageSubmit, sessionId, setMessages, messages } = useContext(AppContext);
  const { revalidate } = useRevalidator();


  const submit = useCallback(() => {
    onMessageSubmit(userInput, sessionId);
    setMessages([...messages, { id: messages.length, text: userInput, isAiMessage: false }]);
    setUserInput("");
    revalidate();
  }, [onMessageSubmit, sessionId, setUserInput, userInput]);

  // when the user presses enter inside the textarea, submit the message
  const handleKeyDown = useCallback((e: any) => {
    if (e.key === "Enter" && !e.shiftKey && userInput.trim().length > 0) {
      e.preventDefault();
      submit();
    }
  }, [submit]);


  return (
    <Textarea
      style={{
        paddingInlineStart: "calc(var(--app-shell-navbar-offset, 0rem)",
      }}
      rows={userInput.split("\n").length}
      placeholder="Type your message"
      m="md"
      radius="md"
      size="lg"
      variant="filled"
      onKeyDown={handleKeyDown}
      value={userInput}
      onChange={(e) => setUserInput(e.currentTarget.value)}
      rightSectionProps={{
        style: {
          display: "flex",
          alignItems: "flex-end",
          paddingBottom: "md",
        },
      }}
      rightSection={
        <ActionIcon
          onClick={submit}
          color="black"
          size={"lg"}
          radius="xl"
          disabled={!userInput}
          mx={"md"}
          aria-label="send message"
          mb={"0.5rem"}
        >
          <PiPaperPlaneBold size="var(--mantine-font-size-lg)" />
        </ActionIcon>
      }
    />
  );
}
