// RL/query.js
const pool = require('../db/pool'); // ✅ ../db/pool.js

/**
 * Query the user's booking history, role, booking purpose and other information
 * @param {number} userId
 * @returns {Promise<{bookingHistory: number, role: string, book_purpose: string, room: string, hour: number}>}
 */
async function getUserBookingState(userId) {
  // 获取用户角色
  const [userRows] = await pool.query(
    'SELECT role FROM users WHERE id = ?',
    [userId]
  );

  // ✅ 改成用子查询方式，不触发 ONLY_FULL_GROUP_BY
  const [bookingRows] = await pool.query(
    `
      SELECT
        COUNT(*) AS history,
        (SELECT book_name FROM bookings WHERE book_id = ? ORDER BY start_time DESC LIMIT 1) AS book_name,
        (SELECT room FROM bookings WHERE book_id = ? ORDER BY start_time DESC LIMIT 1) AS room,
        (SELECT HOUR(start_time) FROM bookings WHERE book_id = ? ORDER BY start_time DESC LIMIT 1) AS hour
      FROM bookings
      WHERE book_id = ?
    `,
    [userId, userId, userId, userId]
  );

  return {
    bookingHistory: bookingRows[0]?.history || 0,
    role: userRows[0]?.role || 'student',
    book_purpose: bookingRows[0]?.book_name || 'study',
    room: bookingRows[0]?.room || 'A1-01',
    hour: bookingRows[0]?.hour || new Date().getHours(),
  };
}

module.exports = { getUserBookingState };
