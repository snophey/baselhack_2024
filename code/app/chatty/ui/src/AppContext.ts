import { createContext } from "react";

export type Message = {
  id: number;
  text: string;
  isAiMessage: boolean;
}

export type onMessageSubmit = (message: string, sessionId: string) => void;

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
