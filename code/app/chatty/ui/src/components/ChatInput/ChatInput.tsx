import { Textarea, ActionIcon } from "@mantine/core";
import { useCallback, useContext, useState } from "react";
import { AppContext } from "../../AppContext";
import { PiPaperPlaneBold } from "react-icons/pi";
import { useParams, useRevalidator } from "react-router-dom";

export function ChatInput() {
  const [userInput, setUserInput] = useState("");
  const { onMessageSubmit, sessionId, setMessages, messages } = useContext(AppContext);
  const { revalidate } = useRevalidator();
  const { chatId } = useParams();
  const submit = useCallback(() => {
    onMessageSubmit(userInput, chatId ? parseInt(chatId) : null, sessionId);
    setUserInput("");
    revalidate();
  }, [onMessageSubmit, sessionId, setUserInput, userInput]);

  // when the user presses enter inside the textarea, submit the message
  const handleKeyDown = useCallback((e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (!e.shiftKey) { // if shift is not pressed, then we are trying to submit the message
        if ( userInput.trim().length > 0) {
          submit();
        }
        e.preventDefault();
      }
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
      radius="lg"
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
