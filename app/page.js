"use client"
import { useState, useEffect, useRef } from "react"
import { Box, Stack, TextField, Button, Paper, Typography } from "@mui/material"
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', 
    },
    secondary: {
      main: '#ffffff', 
    },
  },
})

const parseResponse = (text) => {
  try {
    const parsed = JSON.parse(text);
    if (parsed.result) {
      const innerParsed = JSON.parse(parsed.result);
      if (innerParsed.result) {
        return innerParsed.result.replace(/^(Assistant: |assistant: )/i, '').trim();
      }
    }
    return text;
  } catch (e) {
    return text;
  }
}

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "Assistant", content: "Hello! I'm your assistant for Vedant's Tutoring. How can I help you today?" }
  ]) 
  const [message, setMessage] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const sendMessage = async () => {
    if (!message.trim()) return
  
    setMessage('')
    setMessages((prevMessages) => [...prevMessages, { role: 'user', content: message }])
    setIsStreaming(true)
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([...messages, { role: 'user', content: message }])
      })
  
      if (!response.ok) throw new Error('Network response was not ok')
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedResponse = ''
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
  
        accumulatedResponse += decoder.decode(value, { stream: true })
        const parsedResponse = parseResponse(accumulatedResponse)
        
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages]
          if (newMessages[newMessages.length - 1].role === 'assistant') {
            newMessages[newMessages.length - 1].content = parsedResponse
          } else {
            newMessages.push({ role: 'assistant', content: parsedResponse })
          }
          return newMessages
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: "I'm sorry, there was an error processing your request." }])
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" bgcolor="#f5f5f5">
        <Paper elevation={3} sx={{ width: "500px", height: "700px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Typography variant="h6" sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
            Vedant's Tutoring Assistant
          </Typography>
          <Box flexGrow={1} overflow="auto" p={2}>
            <Stack direction="column" spacing={2}>
              {messages.map((message, index) => (
                <Box key={index} display="flex" justifyContent={message.role === "user" ? "flex-end" : "flex-start"}>
                  <Paper elevation={1} sx={{
                    maxWidth: "70%",
                    p: 1,
                    bgcolor: message.role === 'assistant' ? 'primary.light' : 'secondary.main',
                    color: message.role === 'assistant' ? 'white' : 'black',
                    borderRadius: message.role === 'assistant' ? '20px 20px 20px 5px' : '20px 20px 5px 20px'
                  }}>
                    <Typography variant="body1">{message.content}</Typography>
                  </Paper>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Stack>
          </Box>
          <Stack direction="row" spacing={1} p={2} bgcolor="white">
            <TextField 
              fullWidth 
              variant="outlined" 
              placeholder="Type your message..." 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button variant="contained" onClick={sendMessage} disabled={isStreaming}>
              Send
            </Button>
          </Stack>
        </Paper>
      </Box>
    </ThemeProvider>
  )
}
