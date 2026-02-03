const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

// AI API URL
const AI_API_URL = "https://your-ai-api-url.com/chat";

// USER MODE MEMORY
const userModes = {};
const DEFAULT_MODE = 2; // Chatbot

// MAIN API
app.post('/run-command', async (req, res) => {
  const userIP = req.ip;
  const message = (req.body.message || "").trim(); // <-- renamed

  if (!message) return res.json({ error: "Empty message" });

  // first time user → default mode
  if (!userModes[userIP]) userModes[userIP] = DEFAULT_MODE;

  // MODE SWITCH
  if (message === "1") {
    userModes[userIP] = 1;
    return res.json({ status: "Mode changed to CMD" });
  }
  if (message === "2") {
    userModes[userIP] = 2;
    return res.json({ status: "Mode changed to CHATBOT" });
  }

  const currentMode = userModes[userIP];

  // MODE 1 → CMD
  if (currentMode === 1) {
    exec(message, (err, stdout, stderr) => {
      if (err) return res.json({ output: err.message });
      const output = stdout || stderr;
      res.json({ output });
    });
  }
  // MODE 2 → CHATBOT
  else if (currentMode === 2) {
    try {
      // Node 18+ fetch
      const aiRes = await fetch(AI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }) // <-- message
      });

      const data = await aiRes.json();
      res.json({ reply: data.reply || data });
    } catch (err) {
      res.json({ error: "AI Server Error" });
    }
  }
});

// SERVER START
const PORT = process.env.PORT || 4041;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
