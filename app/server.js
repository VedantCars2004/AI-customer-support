const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

app.post('/api/message', async (req, res) => {
  const userMessage = req.body.message;
  try {
    const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      contents: [{
        parts: [{
          text: userMessage
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      params: {
        key: process.env.GEMINI_API_KEY
      }
    });

    const reply = response.data.candidates[0].content.parts[0].text;
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error communicating with Google Gemini API');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});