const express = require('express');
const { getUserBookingState } = require('./RL/query');
const app = express();
const port = 3000;

// interface 1：provide user status data to the RL environment
app.get('/api/rl-state', async (req, res) => {
  const { userId } = req.query;
  const state = await getUserBookingState(Number(userId));
  res.json(state);
});

// Interface 2: Receives the RL decision results and returns them to the front end
app.get('/api/rl-decision', async (req, res) => {
  const { userId } = req.query;
  try {
    const response = await axios.get(`http://localhost:8000/decision?user_id=${userId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'The decision to obtain RL failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});