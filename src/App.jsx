import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [question, setquestion] = useState('')
  const payload={
    "contents": [
      {
        "parts": [
          {
            "text": "Explain how AI works in a few words"
          }
        ]
      }
    ]
  }
  const askQ=async()=>{
    let response = await fetch(URL,{
      method: 'POST',
      body: JSON.stringify(payload),
    })
    response = await response.json()

  }

  return (
    <div className='grid grid-cols-5 h-screen'>
      <div className='col-span-1 bg-zinc-800'>

      </div>

      <div className='col-span-4 p-10'>
        <div className='container h-150'>

        </div>
        <div className='bg-zinc-800 w-1/2 p-1 text-center m-auto text-white rounded-2xl border border-zinc-700 flex'>
        <input type='text' value={question} onChange={(event)=>setquestion(event.target.value)} placeholder='Ask me anything' className='w-full h-full p-3 outline-none ' />
        <button onClick={askQ}>Ask</button>
        </div>

      </div>
    </div>
  )
}

export default App
