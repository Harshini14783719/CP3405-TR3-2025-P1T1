const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'asdfgh123',
  database: 'smart_seat',
};

// 获取所有预约
exports.getAllBookings = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [bookings] = await connection.execute(`
      SELECT b.id, b.userId, b.classroomId, b.seatRow, b.seatCol, b.date, b.startTime, b.endTime
      FROM bookings b
    `);
    await connection.end();
    res.json(bookings);
  } catch (error) {
    console.error('获取预约失败:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 根据ID获取单个预约
exports.getBookingById = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [bookings] = await connection.execute(`
      SELECT b.id, b.userId, b.classroomId, b.seatRow, b.seatCol, b.date, b.startTime, b.endTime
      FROM bookings b
      WHERE b.id = ?
    `, [req.params.id]);
    await connection.end();

    if (bookings.length === 0) return res.status(404).json({ message: 'Booking not found' });
    res.json(bookings[0]);
  } catch (error) {
    console.error('获取预约失败:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 创建预约
exports.createBooking = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const { userId, classroomId, seatRow, seatCol, date, startTime, endTime } = req.body;

    if (!userId || !classroomId || seatRow === undefined || seatCol === undefined || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 检查该座位在该时间段是否被占用
    const [conflicts] = await connection.execute(
      `SELECT * FROM bookings 
       WHERE classroomId = ? AND seatRow = ? AND seatCol = ? AND date = ? 
         AND NOT (endTime <= ? OR startTime >= ?)`,
      [classroomId, seatRow, seatCol, date, startTime, endTime]
    );
    if (conflicts.length > 0) {
      await connection.end();
      return res.status(409).json({ message: 'Seat already booked in this time range' });
    }

    // 插入预约
    const [result] = await connection.execute(
      `INSERT INTO bookings (userId, classroomId, seatRow, seatCol, date, startTime, endTime) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, classroomId, seatRow, seatCol, date, startTime, endTime]
    );

    const [newBooking] = await connection.execute('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
    await connection.end();
    res.status(201).json(newBooking[0]);
  } catch (error) {
    console.error('创建预约失败:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 更新预约
exports.updateBooking = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const bookingId = req.params.id;

    const [existing] = await connection.execute('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Booking not found' });
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

    const [updatedBooking] = await connection.execute('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    await connection.end();
    res.json(updatedBooking[0]);
  } catch (error) {
    console.error('更新预约失败:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 删除预约
exports.deleteBooking = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const bookingId = req.params.id;

    const [existing] = await connection.execute('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Booking not found' });
    }

    await connection.execute('DELETE FROM bookings WHERE id = ?', [bookingId]);
    await connection.end();
    res.json({ message: 'Booking deleted', booking: existing[0] });
  } catch (error) {
    console.error('删除预约失败:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
