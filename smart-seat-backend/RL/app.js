const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { getUserBookingState } = require('./query');
const app = express();
const port = 4000;

// Enable CORS
app.use(cors());

// Interface 1: provide user status data to the RL environment
app.get('/api/rl-state', async (req, res) => {
  const { userId } = req.query;
  const state = await getUserBookingState(Number(userId));
  res.json(state);
});

// Interface 2: RL decision
app.get('/api/rl-decision', async (req, res) => {
  const { userId } = req.query;

  try {
    // 🚀 修复 IPv6 (::1) 拒绝连接的问题：强制使用 IPv4 地址 127.0.0.1
    const response = await axios.get(`http://127.0.0.1:8000/decision?user_id=${userId}`);

    res.json(response.data);

  } catch (error) {
    console.error("❌ RL decision error:", error.message);

    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }

    res.status(500).json({
      error: 'The decision to obtain RL failed',
      detail: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
