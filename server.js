const express = require('express');
const { exec } = require('child_process');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// =====================
// AI API
// =====================

const AI_API_URL = "hhttps://feeds-collectors-changelog-promises.trycloudflare.com/run-command";

// =====================
// USER MODE STORAGE
// =====================

// IP based mode memory
const userModes = {};

// Default mode = chatbot
const DEFAULT_MODE = 2;

// =====================
// MAIN API
// =====================

app.post('/run-command', async (req, res) => {

  const userIP = req.ip;
  const input = (req.body.input || "").trim();

  if (!input) {
    return res.json({ error: "Empty input" });
  }

  // If user new → set default mode
  if (!userModes[userIP]) {
    userModes[userIP] = DEFAULT_MODE;
  }

  // =====================
  // MODE SWITCH
  // =====================

  if (input === "1") {
    userModes[userIP] = 1;
    return res.json({
      status: "Mode changed to CMD"
    });
  }

  if (input === "2") {
    userModes[userIP] = 2;
    return res.json({
      status: "Mode changed to CHATBOT"
    });
  }

  const currentMode = userModes[userIP];

  // =====================
  // MODE 1 → CMD
  // =====================

  if (currentMode === 1) {

    exec(input, (err, stdout, stderr) => {

      if (err) {
        return res.json({
          output: err.message
        });
      }

      const output = stdout || stderr;

      res.json({
        output: output
      });

    });

  }

  // =====================
  // MODE 2 → CHATBOT
  // =====================

  else if (currentMode === 2) {

    try {

      const aiRes = await axios.post(AI_API_URL, {
        message: input
      });

      res.json({
        reply: aiRes.data.reply || aiRes.data
      });

    } catch (err) {

      res.json({
        error: "AI Server Error"
      });

    }

  }

});


// =====================
// SERVER START
// =====================

const PORT = 4041;
app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
