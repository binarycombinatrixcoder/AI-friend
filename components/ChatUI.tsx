'use client'

import { useEffect, useState, KeyboardEvent } from 'react'

//import ChatSession type from '@google/generative-ai'

import classes from './index.module.css'

// interface of type message
type Message = { text: string; role: 'user' | 'bot'; timestamp: Date }

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  // const [chat, setChat] = useState<ChatSession | null>(null)
  const [theme, setTheme] = useState('dark')
  const [error, setError] = useState<null | string>(null)

  const handleGetAudio = async (aiMessage: Message) => {
    try {
      const response = await fetch('https://afd6-35-226-115-133.ngrok-free.app/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify({ message: aiMessage.text })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Error sending message')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Create an audio element and play it
      const audio = new Audio(audioUrl)
      audio.play()
    } catch (e) {
      alert('Failed to send message, please refresh the page and try again : ')
      setError('Failed to send message: ' + e)
    }
  }

  const handleSendMessage = async () => {
    try {
      const userMessage: Message = {
        text: userInput,
        role: 'user',
        timestamp: new Date()
      }

      const response = await fetch('https://afd6-35-226-115-133.ngrok-free.app/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify({ message: userMessage.text })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Error sending message')
      }

      const botMessage: Message = {
        text: data.response,
        role: 'bot',
        timestamp: new Date()
      }

      setUserInput('')
      setMessages((prevMessages) => [...prevMessages, userMessage, botMessage])

      handleGetAudio(botMessage)
      console.log('Response from AI:', data.response)
    } catch (e) {
      alert('Failed to send message, please refresh the page and try again : ')
      setError('Failed to send message: ' + e)
    }
  }

  // const handleThemeChange = event => {
  //   setTheme(event.target.value)
  // }

  const getThemeColors = () => {
    switch (theme) {
      case 'dark':
        return {
          primary: 'bg-gray-900',
          secondary: 'bg-gray-800',
          accent: 'bg-yellow-500',
          text: 'text-gray-100'
        }
      case 'light':
        return {
          primary: 'bg-white',
          secondary: 'bg-gray-100',
          accent: 'bg-blue-500',
          text: 'text-gray-800'
        }
      default:
        return {
          primary: 'bg-white',
          secondary: 'bg-gray-100',
          accent: 'bg-blue-500',
          text: 'text-gray-800'
        }
    }
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const { primary, secondary, accent, text } = getThemeColors()

  return (
    <>
      <img src="/AI.webp" alt="Chat Header" className={classes.chatHeaderImage} />

      <div className={classes.container}>
        <div className={classes.msgHeader}>
          <h2 className={classes.title}>Gemini Chat</h2>
        </div>

        <div className={classes.chatPage}>
          <div className={classes.msgInbox}>
            <div className={classes.chats}>
              <div className={classes.msgPage}>
                {messages.map((msg, index) => (
                  <div key={index} className={msg.role === 'bot' ? classes.receivedChats : classes.outgoingChats}>
                    <div className={msg.role === 'bot' ? classes.receivedChatsImg : classes.outgoingChatsImg}>
                      <p>{msg.role === 'bot' ? 'Bot' : 'You'}</p>
                    </div>

                    <div className={msg.role === 'bot' ? classes.receivedMsg : classes.outgoingMsg}>
                      <div className={msg.role === 'bot' ? classes.receivedMsgInbox : classes.outgoingChatsMsg}>
                        <p className={classes.overflowWrap}>{msg.text}</p>
                        <span className={classes.time}>{msg.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* {error && <div className="text-red-500 text-sm mb-4">{error}</div>} */}
              </div>
            </div>

            <div className={classes.msgBottom}>
              <div className={classes.inputGroup}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className={classes.input + ' ' + classes.formControl}
                />
                <div className={classes.inputGroupAppend}>
                  <button onClick={handleSendMessage} className={classes.inputGroupText + ' ' + classes.sendIcon}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
