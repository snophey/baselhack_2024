import { Textarea, ActionIcon } from "@mantine/core";
import { useCallback, useContext, useState } from "react";
import { AppContext, Message, TONE_NEUTRAL, toneAtom } from "../../AppContext";
import { PiPaperPlaneBold } from "react-icons/pi";
import { useNavigate, useParams, useRevalidator } from "react-router-dom";
import { useClient } from "@based/react";
import { useDisclosure } from "@mantine/hooks";
import { useAtom } from "jotai";

export function ChatInput() {
  const [userInput, setUserInput] = useState("");
  const { onMessageSubmit, sessionId, setMessages, messages } = useContext(AppContext);
  const [tone] = useAtom(toneAtom);
  const { revalidate } = useRevalidator();
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [loading, { open: startLoading, close: stopLoading }] = useDisclosure();

  const client = useClient();

  const submit = useCallback(async() => {
    onMessageSubmit(userInput, chatId ? parseInt(chatId) : null, sessionId);
    setUserInput("");

    // optimistically update the messages
    setMessages([
      ...messages,
      {
        id: messages.length > 0 ? messages[messages.length - 1].id + 1 : 0,
        message: userInput,
        is_ai_message: 0,
      },
    ]);

    startLoading();
    try {
      const { chatId: newChatId } = await client.call("chat:addMsg", {
        message: userInput,
        chatId: chatId ? parseInt(chatId) : null,
        tone: tone ?? TONE_NEUTRAL,
      });
      navigate(`/${newChatId}`);
    } catch (e) {
      console.error(e);
    } finally {
      stopLoading();
      revalidate();
    }

    // refetch the messages from the server properly
    client.call("chat:getMsgs", { chatId }).then((msgs: Message[]) => {
      setMessages(msgs);
      console.log(`Got messages for chat ${chatId}`, msgs);
    }, (err: any) => {
      console.error(err);
    });
  }, [onMessageSubmit, sessionId, setUserInput, userInput]);

  // when the user presses enter inside the textarea, submit the message
  const handleKeyDown = useCallback((e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (!e.shiftKey) { // if shift is not pressed, then we are trying to submit the message
        if (userInput.trim().length > 0 && !loading) {
          submit();
        }
        e.preventDefault();
      }
    }
  }, [submit, loading]);


  return (
    <Textarea
      style={{
        paddingInlineStart: "calc(var(--app-shell-navbar-offset, 0rem)",
      }}
      rows={userInput.split("\n").length}
      placeholder="Type your message"
      m="md"
      radius="xl"
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
          loading={loading}
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
