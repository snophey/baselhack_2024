import { createContext } from "react";

export type Message = {
  id: number;
  message: string;
  is_ai_message: number;
}

export type onMessageSubmit = (message: string, chatId: number | null, sessionId: string) => void;

export type AppContext = {
  sessionId: string;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  onMessageSubmit: onMessageSubmit;
}

// create react context
export const AppContext = createContext<AppContext>({
  sessionId: '',
  messages: [],
  setMessages: () => {},
  onMessageSubmit: () => {},
});
