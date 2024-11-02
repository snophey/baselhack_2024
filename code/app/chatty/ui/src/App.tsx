import { useState } from 'react'
import './App.css'
import { Button, MantineProvider } from '@mantine/core'
import { Chatbot } from './pages/Chatbot'
import { useQuery } from '@based/react'




function App() {
  const { data: counter, loading } = useQuery('counter')
  const [x, setX] = useState(0)
  const { data: random, loading: lRandom } = useQuery('db:get', { x })

  return (
    <>
      <MantineProvider>
        {lRandom ? '....' : <div>Random value: {random}</div>}
        <Button onClick={() => { console.log(x); setX(Math.random()) }}>Update</Button>
        <Chatbot></Chatbot>
      </MantineProvider>
    </>
  )
}

export default App
