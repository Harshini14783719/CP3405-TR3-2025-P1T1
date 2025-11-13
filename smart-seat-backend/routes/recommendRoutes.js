const express = require('express');
const router = express.Router();
const axios = require('axios');

const PREDICTION_SERVICE_URL = 'http://127.0.0.1:5002/api/predict-seat';

const axiosInstance = axios.create({
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

router.post('/seat', async (req, res) => {
  try {
    const { room_id, time_slot, booked_seats, user_mood } = req.body;

    if (!room_id || !time_slot || !user_mood) {
      return res.status(400).json({ msg: 'miss: room_id、time_slot、user_mood' });
    }

    console.log('=== recive ===');
    console.log({ room_id, time_slot, booked_seats, user_mood });

    const flaskResponse = await axiosInstance.post(PREDICTION_SERVICE_URL, {
      room_id: room_id.trim(),
      time_slot: time_slot.trim(),
      booked_seats: (booked_seats || '').trim(),
      user_mood: user_mood.trim()
    });

    console.log('=== Flask return ===');
    console.log(flaskResponse.data);
    res.json(flaskResponse.data);

  } catch (err) {
    console.error('=== error ===');
    console.error('Flask address：', PREDICTION_SERVICE_URL);
    console.error('error type:', err.name);
    console.error('detail:', err.response?.data || err.message || err);

    const errorMsg = err.response?.data?.error || 'fail';
    res.status(err.response?.status || 500).json({ msg: errorMsg });
  }
});

module.exports = router;