const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

// =====================
// AI API URL
// =====================
const AI_API_URL = "https://eng-quizzes-webpage-medal.trycloudflare.com/run-command"; // replace with your AI API URL

// =====================
// USER MODE MEMORY (IP based)
// =====================
const userModes = {};
const DEFAULT_MODE = 2; // default = Chatbot

// =====================
// MAIN API
// =====================
app.post('/run-command', async (req, res) => {
  const userIP = req.ip;

  // 🔹 use "command" key for both CMD & Chatbot
  const command = (req.body.command || "").trim();

  if (!command) return res.json({ error: "Empty command" });

  // first time user → set default mode
  if (!userModes[userIP]) userModes[userIP] = DEFAULT_MODE;

  // =====================
  // MODE SWITCH
  // =====================
  if (command === "1") {
    userModes[userIP] = 1;
    return res.json({ status: "Mode changed to vercel CMD" });
  }
  if (command === "2") {
    userModes[userIP] = 2;
    return res.json({ status: "Mode changed to termux" });
  }

  const currentMode = userModes[userIP];

  // =====================
  // MODE 1 → CMD
  // =====================
  if (currentMode === 1) {
    exec(command, (err, stdout, stderr) => {
      if (err) return res.json({ output: err.message });
      const output = stdout || stderr;
      res.json({ output });
    });
  }

  // =====================
  // MODE 2 → CHATBOT
  // =====================
  else if (currentMode === 2) {
    try {
      // Node 18+ fetch
      const aiRes = await fetch(AI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: command }) // use same 'command' key
      });

      const data = await aiRes.json();
      res.json({ reply: data.reply || data });
    } catch (err) {
      res.json({ error: "AI Server Error" });
    }
  }
});

// =====================
// SERVER START
// =====================
const PORT = process.env.PORT || 4041;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
