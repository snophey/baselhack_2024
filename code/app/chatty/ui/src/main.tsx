import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@mantine/core/styles.css';
import App from './App.tsx'
import based from '@based/client'

import { Provider, useQuery } from '@based/react'

let url = `ws://localhost:8000`
if (window.location.hostname !== 'localhost') {
  url = `wss://${window.location.hostname}/api`
}
export const client = based({
  url
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider  client={client}>
      <App />
    </Provider>
  </StrictMode>,
)
