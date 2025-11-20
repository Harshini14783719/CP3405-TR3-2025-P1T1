const pool = require('../db/pool');
const QRCode = require('qrcode');

// ==================== 基础 CRUD ====================

// 获取所有预订（可选按 userId 过滤）
exports.getAllBookings = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const userId = req.query.userId;

    let query = `
      SELECT b.id, b.book_id, b.book_name, b.room, b.seat_number, b.date, b.start_time, b.end_time, b.status
      FROM bookings b
    `;
    const params = [];

    if (userId) {
      query += ' WHERE b.book_id = ?';
      params.push(userId);
    }

    const [bookings] = await connection.execute(query, params);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// 根据 id 获取单个预订
exports.getBookingById = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [bookings] = await connection.execute(`
      SELECT b.id, b.book_id, b.book_name, b.room, b.seat_number, b.date, b.start_time, b.end_time, b.status
      FROM bookings b
      WHERE b.id = ?
    `, [req.params.id]);
    if (bookings.length === 0) return res.status(404).json({ message: 'booking not found' });
    res.json(bookings[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// 创建预订
exports.createbooking = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const { book_id, book_name, room, seat_number, date, start_time, end_time, status } = req.body;

    // 默认 status = 1（例如：Booked）
    const bookingStatus = (status !== undefined) ? status : 1;

    if (!book_id || !book_name || !room || seat_number === undefined || !date || !start_time || !end_time) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 🟢 优化：冲突检测改为“重叠检测”，防止不同时间段的重复预订
    // 原逻辑: start_time = ? (只能防完全一样的开始时间)
    // 新逻辑: 只要有时间重叠就算冲突
    const [conflicts] = await connection.execute(
      `SELECT * FROM bookings
       WHERE room = ? AND seat_number = ?
         AND date = ?
         AND start_time < ?
         AND end_time > ?
         AND status != 2`, // 忽略已取消的订单
      [room, seat_number, date, end_time, start_time] // 注意参数顺序: end_time, start_time
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'Seat already booked in this time range' });
    }

    const [result] = await connection.execute(
      `INSERT INTO bookings (room, seat_number, date, start_time, end_time, book_name, book_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [room, seat_number, date, start_time, end_time, book_name, book_id, bookingStatus]
    );

    const [newbooking] = await connection.execute('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
    res.status(201).json(newbooking[0]);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// 更新预订
exports.updatebooking = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const bookingId = req.params.id;
    const [existing] = await connection.execute('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'booking not found' });
    }
    const fields = [];
    const values = [];
    for (const key in req.body) {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    }
    values.push(bookingId);
    const sql = `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`;
    await connection.execute(sql, values);
    const [updatedbooking] = await connection.execute('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    res.json(updatedbooking[0]);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// 删除预订
exports.deletebooking = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const bookingId = req.params.id;
    const [existing] = await connection.execute('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'booking not found' });
    }
    await connection.execute('DELETE FROM bookings WHERE id = ?', [bookingId]);
    res.json({ message: 'booking deleted', booking: existing[0] });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// 🟢 重点修复：获取某一时间段某个房间的已预订座位
exports.getBookedSeats = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { room, date, start_time, end_time } = req.query;

    // 修复逻辑：使用时间段重叠查询 (Overlap)
    // 只要 (现有订单开始时间 < 查询结束时间) 且 (现有订单结束时间 > 查询开始时间) 即视为占用
    const [results] = await connection.execute(
      `SELECT b.*, u.jcu_id
       FROM bookings b
       LEFT JOIN users u ON b.book_id = u.id
       WHERE room = ?
       AND date = ?
       AND start_time < ?
       AND end_time > ?
       AND status != 2`, // 排除已取消(status 2)的订单
      [room, date, end_time, start_time] // ⚠️ 参数顺序：先传查询的结束时间，再传开始时间
    );

    res.json(results);
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// 取消预订（status = 2）
exports.cancelBooking = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const bookingId = req.params.id;
    const [existing] = await connection.execute('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'booking not found' });
    }
    await connection.execute(
      'UPDATE bookings SET status = 2 WHERE id = ?',
      [bookingId]
    );
    const [updatedBooking] = await connection.execute('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    res.json(updatedBooking[0]);
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// 更新当前用户的已过期预订（status 0 -> 1）
exports.updateExpiredBookings = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const [expiredBookings] = await connection.execute(
      'SELECT id FROM bookings WHERE book_id = ? AND status = 0 AND CONCAT(date, " ", start_time) < NOW()',
      [userId]
    );

    if (expiredBookings.length === 0) {
      return res.json({ message: 'No expired bookings to update' });
    }

    const ids = expiredBookings.map(booking => booking.id);
    await connection.execute(
      `UPDATE bookings SET status = 1 WHERE id IN (${ids.join(',')})`,
      []
    );

    const [updatedBookings] = await connection.execute(
      'SELECT * FROM bookings WHERE id IN (?)',
      [ids]
    );

    res.json(updatedBookings);
  } catch (error) {
    console.error('Error updating expired bookings:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// ==================== 工具函数（系统自动占位用） ====================

// 获取中国时间（UTC+8）
const getChinaTime = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const chinaTime = new Date(utc + 8 * 3600000);
  return chinaTime;
};

// 通过检测更新座位状态（系统自动插入一条占用记录）
exports.updateSeatStatusByDetection = async (room, seat_number) => {
  const now = getChinaTime();
  const date = now.toISOString().slice(0,10);
  const hour = now.getHours();
  const start_time = hour.toString().padStart(2,'0') + ':00';
  const end_time = (hour + 1).toString().padStart(2,'0') + ':00';
  let connection;
  try {
    connection = await pool.getConnection();
    const [existing] = await connection.execute(
      `SELECT * FROM bookings WHERE room=? AND seat_number=? AND date=? AND start_time=?`,
      [room, seat_number, date, start_time]
    );
    if (existing.length === 0) {
      await connection.execute(
        `INSERT INTO bookings (room, seat_number, date, start_time, end_time, book_name, book_id, status)
         VALUES (?,?,?,?,?,?,?,?)`,
        [room, seat_number, date, start_time, end_time, 'system', 99999999, 1]
      );
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) connection.release();
  }
};

// 删除系统自动生成的占位记录
exports.deleteDefaultBookingIfExists = async (room, seat_number) => {
  const now = getChinaTime();
  const date = now.toISOString().slice(0,10);
  const hour = now.getHours();
  const start_time = hour.toString().padStart(2,'0') + ':00';
  let connection;
  try {
    connection = await pool.getConnection();
    const [existing] = await connection.execute(
      `SELECT * FROM bookings WHERE room=? AND seat_number=? AND date=? AND start_time=? AND book_name='system' AND book_id=99999999`,
      [room, seat_number, date, start_time]
    );
    if (existing.length > 0) {
      await connection.execute(
        `DELETE FROM bookings WHERE room=? AND seat_number=? AND date=? AND start_time=? AND book_name='system' AND book_id=99999999`,
        [room, seat_number, date, start_time]
      );
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) connection.release();
  }
};

// ==================== 二维码相关 API ====================

/**
 * @description 生成二维码并存储到数据库
 * @route POST /api/bookings/generate-qrcode
 * body: { bookingId }
 */
exports.generateQrCode = async (req, res) => {
  let connection;
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    // 本地开发环境：localhost:5000
    const serverUrl = 'http://localhost:5000';
    const verifyUrl = `${serverUrl}/api/bookings/verify-booking/${bookingId}`;

    // 生成二维码 dataURL（base64）
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);

    connection = await pool.getConnection();

    const [result] = await connection.execute(
      'UPDATE bookings SET qrcode = ? WHERE id = ?',
      [qrCodeDataUrl, bookingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found with the provided ID' });
    }

    res.status(200).json({
      message: 'QR code generated and saved successfully',
      qrcode: qrCodeDataUrl,
      verifyUrl,
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Server error while generating QR code' });
  } finally {
    if (connection) connection.release();
  }
};


/**
 * @description 验证二维码并办理入住
 * @route GET /api/bookings/verify-booking/:bookingId
 */
exports.verifyBooking = async (req, res) => {
  let connection;
  try {
    const { bookingId } = req.params;
    connection = await pool.getConnection();

    const [bookings] = await connection.execute(
      'SELECT date, start_time, if_checkin FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (bookings.length === 0) {
      return res
        .status(404)
        .send('<h1>Booking Not Found</h1><p>The booking ID is invalid.</p>');
    }

    const booking = bookings[0];

    // 已经签到过
    if (booking.if_checkin) {
      return res
        .status(200)
        .send('<h1>Already Checked In</h1><p>This booking has already been checked in.</p>');
    }

    // 组装预定时间（假设 date 是 Date 对象，start_time 是 'HH:MM:SS' 字符串）
    const bookingDateStr = booking.date.toISOString().split('T')[0];
    const bookingStartTimeStr = booking.start_time;

    const bookingTime = new Date(`${bookingDateStr}T${bookingStartTimeStr}`);
    const currentTime = new Date();

    const timeDifference = Math.abs(currentTime - bookingTime);
    const fifteenMinutesInMillis = 15 * 60 * 1000;

    // 在开始时间前后15分钟内允许签到
    if (timeDifference <= fifteenMinutesInMillis) {
      await connection.execute(
        'UPDATE bookings SET if_checkin = 1 WHERE id = ?',
        [bookingId]
      );
      res
        .status(200)
        .send('<h1>Check-in Successful!</h1><p>Your check-in has been confirmed.</p>');
    } else {
      res
        .status(403)
        .send('<h1>Check-in Failed</h1><p>Check-in is only allowed within 15 minutes of the booking start time.</p>');
    }

  } catch (error) {
    console.error('Error verifying booking:', error);
    res
      .status(500)
      .send('<h1>Server Error</h1><p>An error occurred while processing your request.</p>');
  } finally {
    if (connection) connection.release();
  }
};