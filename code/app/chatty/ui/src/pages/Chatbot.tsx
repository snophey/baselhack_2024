import React, { useState } from 'react';
import { Button, Container, Group, Paper, TextInput, ScrollArea } from '@mantine/core';

export function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Simulates a response from the bot
  const getBotResponse = (message) => {
    return `Bot: I received your message - "${message}"`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = { sender: 'User', text: input };
    const botMessage = { sender: 'Bot', text: getBotResponse(input) };
    
    setMessages([...messages, userMessage, botMessage]);
    setInput('');
  };

  return (
    <Container size="sm" style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      {/* Message display area */}
      <ScrollArea style={{ flex: 1, marginBottom: '1rem', padding: '1rem', backgroundColor: '#f7f9fc' }}>
        {messages.map((message, index) => (
          <Group key={index} style={{ marginBottom: '1rem' }}>
            <Paper
              shadow="xs"
              radius="md"
              style={{
                backgroundColor: message.sender === 'User' ? '#4dabf7' : '#e9ecef',
                color: message.sender === 'User' ? 'white' : 'black',
                maxWidth: '60%',
              }}
            >
              {message.text}
            </Paper>
          </Group>
        ))}
      </ScrollArea>

      {/* Input area */}
      <Group>
        <TextInput
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1 }}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} color="blue">
          Send
        </Button>
      </Group>
    </Container>
  );
}

