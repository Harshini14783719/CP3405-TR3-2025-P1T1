const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'cp3405-tr3-2025-p1t1-mysql-1',
  user: 'root',
  password: 'asdfgh123',
  database: 'smart_seat',
};

exports.getAllBookings = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [bookings] = await connection.execute(`
      SELECT b.id, b.userId, b.classroom, b.seatNumber, b.startTime
      FROM bookings b
    `);
    await connection.end();
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [bookings] = await connection.execute(`
      SELECT b.id, b.userId, b.classroom, b.seatNumber, b.startTime
      FROM bookings b
      WHERE b.id = ?
    `, [req.params.id]);
    await connection.end();

    if (bookings.length === 0) return res.status(404).json({ message: 'Booking not found' });
    res.json(bookings[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const { userId, classroom, seatNumber, startTime } = req.body;

    if (!userId || !classroom || seatNumber === undefined || !startTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [conflicts] = await connection.execute(
      `SELECT * FROM bookings 
       WHERE classroom = ? AND seatNumber = ? 
         AND startTime = ?`,
      [classroom, seatNumber, startTime]
    );

    if (conflicts.length > 0) {
      await connection.end();
      return res.status(409).json({ message: 'Seat already booked in this time range' });
    }

    const [result] = await connection.execute(
      `INSERT INTO bookings (userId, classroom, seatNumber, startTime) 
       VALUES (?, ?, ?, ?)`,
      [userId, classroom, seatNumber, startTime]
    );

    const [newBooking] = await connection.execute('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
    await connection.end();
    res.status(201).json(newBooking[0]);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};