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
      SELECT b.id, b.book_id, b.book_name, b.room, b.seat_number, b.date, b.start_time, b.end_time, b.status
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
      SELECT b.id, b.book_id, b.book_name, b.room, b.seat_number, b.date, b.start_time, b.end_time, b.status
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
    const { book_id, book_name, room, seat_number, date, start_time, end_time } = req.body;

    if (!book_id || !book_name || !room || seat_number === undefined || !date || !start_time || !end_time) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [conflicts] = await connection.execute(
      `SELECT * FROM bookings 
       WHERE room = ? AND seat_number = ? 
         AND date = ? AND start_time = ?`,
      [room, seat_number, date, start_time]
    );

    if (conflicts.length > 0) {
      await connection.end();
      return res.status(409).json({ message: 'Seat already booked in this time range' });
    }

    const [result] = await connection.execute(
      `INSERT INTO bookings (room, seat_number, date, start_time, end_time, book_name, book_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [room, seat_number, date, start_time, end_time, book_name, book_id]
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

exports.getBookedSeats = (req, res) => {
  const { room, date, start_time, end_time } = req.query;
  const sql = `
    SELECT seat_number FROM bookings 
    WHERE room = ? 
    AND date = ? 
    AND status = 1 
    AND start_time < ? 
    AND end_time > ?
  `;
  db.query(sql, [room, date, end_time, start_time], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
  };