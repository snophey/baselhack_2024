import { createContext } from "react";

type Message = {
  id: number;
  text: string;
  isAiMessage: boolean;
}

type onMessageSubmit = (message: string, sessionId: string) => void;

type AppContext = {
  sessionId: string;
  messages: Message[];
  onMessageSubmit: onMessageSubmit;
}

// create react context
export const AppContext = createContext<AppContext>({
  sessionId: '',
  messages: [],
  onMessageSubmit: () => {},
});
