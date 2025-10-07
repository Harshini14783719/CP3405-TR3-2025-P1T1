const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'cp3405-tr3-2025-p1t1-mysql-1',
  user: 'root',
  password: 'asdfgh123',
  database: 'smart_seat',
};

exports.getClassroomWithSeats = async (req, res) => {
  try {
    let { classroom, date, hour } = req.query;

    if (!classroom) return res.status(400).json({ message: 'Missing classroom' });
    if (hour === undefined) return res.status(400).json({ message: 'Missing hour parameter' });

    if (!date) date = new Date().toISOString().split('T')[0];
    
    const startTime = `${date}T${hour.toString().padStart(2, '0')}:00`;

    const connection = await mysql.createConnection(dbConfig);

    const [classrooms] = await connection.execute(
      'SELECT id, name, type, totalSeats FROM classrooms WHERE name = ?',
      [classroom]
    );

    if (classrooms.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Classroom not found' });
    }

    const classroomData = classrooms[0];
    const seats = {};

    const sql = `
      SELECT b.seatNumber, u.id AS userId, u.name AS userName
      FROM bookings b
      LEFT JOIN users u ON b.userId = u.id
      WHERE b.classroom = ? AND b.startTime = ?
    `;
    const params = [classroom, startTime];

    const [bookings] = await connection.execute(sql, params);

    bookings.forEach(b => {
      seats[b.seatNumber] = { userId: b.userId, userName: b.userName };
    });

    await connection.end();

    res.json({
      classroom: {
        id: classroomData.id,
        name: classroomData.name,
        type: classroomData.type,
        totalSeats: classroomData.totalSeats,
      },
      seats,
      startTime
    });
  } catch (error) {
    console.error('Error fetching classroom:', error);
    res.status(500).json({ message: 'Server error' });
  }
};