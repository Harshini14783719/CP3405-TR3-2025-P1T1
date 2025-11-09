// db/query.js
const pool = require('./pool');

/**
 * Query the user's booking history, role, booking purpose and other information
 * @param {number} userId
 * @returns {Promise<{bookingHistory: number, role: string, bookName: string, room: string, hour: number}>}
 */
async function getUserBookingState(userId) {
  const [userRows] = await pool.query(
    'SELECT role FROM users WHERE id = ?',
    [userId]
  );
  const [bookingRows] = await pool.query(
    'SELECT COUNT(*) as history, book_name, room, HOUR(start_time) as hour FROM bookings WHERE book_id = ? GROUP BY book_id',
    [userId]
  );

  return {
    bookingHistory: bookingRows[0]?.history || 0, # ??? need add

    role: userRows[0]?.role || 'student',
    bookName: bookingRows[0]?.book_name || 'study',
    room: bookingRows[0]?.room || 'A1-01',
    hour: bookingRows[0]?.hour || new Date().getHours()
  };
}

module.exports = { getUserBookingState };


// app.js
const express = require('express');
const { getUserBookingState } = require('./db/query');
const app = express();
const port = 3000;

// interface 1：provide user status data to the RL environment
app.get('/api/rl-state', async (req, res) => {
  const { userId } = req.query;
  const state = await getUserBookingState(Number(userId));
  res.json(state);
});

