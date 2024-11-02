import "@mantine/core/styles.css";
import "./App.css";
//import { useState } from 'react'
import { MantineProvider } from "@mantine/core";
//import { useQuery } from '@based/react'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ChatPage } from "./pages/ChatPage";
import { AppContext } from "./AppContext";
import { useEffect, useState } from "react";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ChatPage></ChatPage>,
  },
  {
    path: "/:chatId",
    element: <ChatPage></ChatPage>,
  },
]);

function App() {
  /*const { data: counter, loading } = useQuery('counter')
  const [x, setX] = useState(0)
  const { data: random, loading: lRandom } = useQuery('db:get', { x })*/
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const ssid = localStorage.getItem("sessionId") || crypto.randomUUID();
    localStorage.setItem("sessionId", ssid);
    setSessionId(ssid);
  }, []);
  
  return (
    <>
        <AppContext.Provider value={{
          sessionId: sessionId,
          messages,
          setMessages,
          onMessageSubmit: (msg, sessId) => {
            console.log(`User ${sessId} sent message: ${msg}`);
          }
        }}>
      <MantineProvider>
          <RouterProvider router={router} />
      </MantineProvider>
        </AppContext.Provider>
    </>
  );
}

export default App;
