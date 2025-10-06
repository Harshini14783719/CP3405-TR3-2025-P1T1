const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'asdfgh123',
  database: 'smart_seat',
};

exports.getClassroomWithSeats = async (req, res) => {
  try {
    let { classroomId, date, hour } = req.query;

    if (!classroomId) return res.status(400).json({ message: 'Missing classroomId' });
    if (hour === undefined) return res.status(400).json({ message: 'Missing hour parameter' });

    // 默认当天
    if (!date) date = new Date().toISOString().split('T')[0];

    const connection = await mysql.createConnection(dbConfig);

    // 查询教室信息
    const [classrooms] = await connection.execute(
      'SELECT id, name, type, rows, cols FROM classrooms WHERE id = ?',
      [classroomId]
    );

    if (classrooms.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Classroom not found' });
    }

    const classroom = classrooms[0];

    // 初始化座位二维数组
    const seats = Array.from({ length: classroom.rows }, () =>
      Array.from({ length: classroom.cols }, () => null)
    );

    // 查询指定小时的预约
    const sql = `
      SELECT b.seatRow, b.seatCol, u.id AS userId, u.name AS userName
      FROM bookings b
      LEFT JOIN users u ON b.userId = u.id
      WHERE b.classroomId = ? AND b.date = ? AND HOUR(b.startTime) <= ? AND HOUR(b.endTime) > ?
    `;
    const params = [classroomId, date, hour, hour];

    const [bookings] = await connection.execute(sql, params);

    bookings.forEach(b => {
      const row = b.seatRow - 1;
      const col = b.seatCol - 1;
      if (row >= 0 && row < classroom.rows && col >= 0 && col < classroom.cols) {
        seats[row][col] = { userId: b.userId, userName: b.userName };
      }
    });

    await connection.end();

    res.json({
      classroom: {
        id: classroom.id,
        name: classroom.name,
        type: classroom.type,
        rows: classroom.rows,
        cols: classroom.cols,
      },
      seats,
    });
  } catch (error) {
    console.error('获取教室失败:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
