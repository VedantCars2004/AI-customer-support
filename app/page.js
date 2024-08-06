"use client"
import {useState} from "react"
import {Box, Stack, TextField, Button} from "@mui/material"
export default function Home() {
  const[messages, setMessages] = useState([
    {role: "Assistant", content: "Hello, I am your personal assistant. What can I help you with today?"}
  ])

  const [message, setMessage] = useState("")
  const sendMessage = async() => {
    setMessage('')
    setMessages((messages) => [...messages, {role: 'user', content: message}])
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify([...messages, {role : 'user', content: message}])
      })
      const data = await response.json()
      if (data.error) {
        console.error("Error from API:", data.error)
      } else {
        setMessages((messages) => [...messages, {role: 'assistant', content: data.result}])
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }
  return (
   <Box width = "100vw" height = "100vh" display = "flex" flexDirection={'column'} justifyContent={'center'} alignItems="center">
    
    <Stack direction = "column" width = "500px" height = "700px" border = "1 px solid black" p = {2}>
      <Stack direction = "column" spacing = {2} flexGrow = {1}>
        {
          messages.map((message, index) => (
            <Box key = {index} display = "flex" justifyContent = {message.role === "user" ? "flex-end" : "flex-start"}>
              <Box bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'} color = 'white' borderRadius={16} p = {2}>
                {message.content}
              </Box>
            </Box>
          ))
        }
      </Stack>
      <Stack direction = "row" spacing = {2}>
        <TextField fullWidth label = "Message" value = {message} onChange={(e) => setMessage(e.target.value)}/>
        <Button variant = "contained" onClick={sendMessage}>Send</Button>
      </Stack>
    </Stack>
    </Box>
  )


}