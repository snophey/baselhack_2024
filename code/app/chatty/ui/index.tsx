import React from 'react'
import { render } from 'react-dom'
import based from '@based/client'
import { Provider, useQuery } from '@based/react'

export const client = based({
    url: 'ws://localhost:8000'
})

const App = () => {
  const { data: counter, loading } = useQuery('counter')
  return (
    <div
      style={{
        background: '#131313',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <h2
        style={{
          color: '#bbbbbb',
          paddingTop: '60px',
          fontFamily: 'sans-serif',
          fontWeight: 800,
          fontSize: '20pt',
        }}
      >
        Hello Basel! {loading ? '-' : counter}
      </h2>
    </div>
  )
}


render(
  <Provider client={client}>
    <App />
  </Provider>,
  document.body
)