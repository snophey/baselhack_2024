import React, { useState } from 'react'
import { render } from 'react-dom'
import based from '@based/client'
import { Provider, useQuery } from '@based/react'


let url = `ws://${window.location.host}`
if(window.location.hostname !== 'localhost') {
  url = `wss://${window.location.host}` 
}
export const client = based({
    url 
})



const App = () => {
  const { data: counter, loading } = useQuery('counter')
  const [x, setX] = useState(0)
  const { data: random, loading: lRandom } = useQuery('db:get', {x})
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


         {lRandom ? '....' : <div>Random value: {random}</div>}

         <button onClick={() => {console.log(x);setX(Math.random())}}>Update</button>
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