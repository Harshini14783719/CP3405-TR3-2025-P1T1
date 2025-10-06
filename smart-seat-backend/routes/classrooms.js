const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'asdfgh123',
  database: 'smart_seat',
};

// 获取所有教室及指定小时的座位占用情况
router.get('/', async (req, res) => {
  try {
    const hour = req.query.hour !== undefined ? parseInt(req.query.hour) : null;
    if (hour === null || isNaN(hour) || hour < 0 || hour > 23) {
      return res.status(400).json({ message: 'Invalid or missing hour parameter (0-23)' });
    }

    const date = new Date().toISOString().slice(0, 10);
    const connection = await mysql.createConnection(dbConfig);

    const [classrooms] = await connection.execute('SELECT * FROM classrooms');

    for (const classroom of classrooms) {
      // 初始化二维数组 seats
      const seats = Array.from({ length: classroom.rows }, () =>
        Array.from({ length: classroom.cols }, () => null)
      );

      const [bookings] = await connection.execute(
        'SELECT seatRow, seatCol, startTime, endTime FROM bookings WHERE classroomId = ? AND date = ?',
        [classroom.id, date]
      );

      bookings.forEach(b => {
        const startHour = parseInt(b.startTime.split(':')[0]);
        const endHour = parseInt(b.endTime.split(':')[0]);
        if (hour >= startHour && hour < endHour) {
          const row = b.seatRow - 1;
          const col = b.seatCol - 1;
          if (row >= 0 && row < classroom.rows && col >= 0 && col < classroom.cols) {
            seats[row][col] = true;
          }
        }
      });

      classroom.seats = seats;
    }

    await connection.end();
    res.json({ date, hour, classrooms });
  } catch (error) {
    console.error('获取教室失败:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 根据ID获取单个教室及指定小时的座位占用情况
router.get('/:id', async (req, res) => {
  try {
    const hour = req.query.hour !== undefined ? parseInt(req.query.hour) : null;
    if (hour === null || isNaN(hour) || hour < 0 || hour > 23) {
      return res.status(400).json({ message: 'Invalid or missing hour parameter (0-23)' });
    }

    const date = new Date().toISOString().slice(0, 10);
    const connection = await mysql.createConnection(dbConfig);

    const [classrooms] = await connection.execute('SELECT * FROM classrooms WHERE id = ?', [req.params.id]);
    if (classrooms.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Classroom not found' });
    }

    const classroom = classrooms[0];

    const seats = Array.from({ length: classroom.rows }, () =>
      Array.from({ length: classroom.cols }, () => null)
    );

    const [bookings] = await connection.execute(
      'SELECT seatRow, seatCol, startTime, endTime FROM bookings WHERE classroomId = ? AND date = ?',
      [classroom.id, date]
    );

    bookings.forEach(b => {
      const startHour = parseInt(b.startTime.split(':')[0]);
      const endHour = parseInt(b.endTime.split(':')[0]);
      if (hour >= startHour && hour < endHour) {
        const row = b.seatRow - 1;
        const col = b.seatCol - 1;
        if (row >= 0 && row < classroom.rows && col >= 0 && col < classroom.cols) {
          seats[row][col] = true;
        }
      }
    });

    classroom.seats = seats;

    await connection.end();
    res.json({ date, hour, classroom });
  } catch (error) {
    console.error('获取教室失败:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
