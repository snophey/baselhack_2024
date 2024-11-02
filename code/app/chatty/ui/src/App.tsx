import { useState } from 'react'
import './App.css'
import { MantineProvider } from '@mantine/core'
import { Chatbot } from './pages/Chatbot'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <MantineProvider>
    <Chatbot></Chatbot>
    </MantineProvider>
    </>
  )
}

export default App
