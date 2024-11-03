import { atom } from "jotai";
import { createContext } from "react";

export type Message = {
  id: number;
  message: string;
  is_ai_message: number;
}

export const TONE_NEUTRAL = 'neutral';
export const TONE_CASUAL = 'casual';
export const TONE_CHILD = 'child';
export const TONE_FORMAL = 'formal';

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

export const toneAtom = atom<string>(TONE_NEUTRAL);
