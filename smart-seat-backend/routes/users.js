const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

const dbConfig = {
  host: 'cp3405-tr3-2025-p1t1-mysql-1',
  user: 'root',
  password: 'asdfgh123',
  database: 'smart_seat',
};

router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute(`
      SELECT id, email, name, password, role, birthday, gender, major
      FROM users
    `);
    await connection.end();
    res.json(users);
  } catch (error) {
    console.error('读取用户失败:', error);
    res.status(500).json({ error: 'Failed to read users' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute(`
      SELECT id, email, name, password, role, birthday, gender, major
      FROM users
      WHERE id = ?
    `, [req.params.id]);
    await connection.end();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('读取用户失败:', error);
    res.status(500).json({ error: 'Failed to read user' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const userId = req.params.id;
    const { email, name, password, role, birthday, gender, major } = req.body;

    const [existingUsers] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'User not found' });
    }

    const finalPassword = password || existingUsers[0].password;

    await connection.execute(
      'UPDATE users SET email = ?, name = ?, password = ?, role = ?, birthday = ?, gender = ?, major = ? WHERE id = ?',
      [email || existingUsers[0].email, 
       name || existingUsers[0].name, 
       finalPassword, 
       role || existingUsers[0].role,
       birthday || existingUsers[0].birthday,
       gender || existingUsers[0].gender,
       major || existingUsers[0].major,
       userId]
    );

    const [updatedUsers] = await connection.execute(
      'SELECT id, email, name, role, birthday, gender, major FROM users WHERE id = ?', 
      [userId]
    );
    await connection.end();

    res.json({ success: true, user: updatedUsers[0] });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const userId = req.headers['user-id'];
    const sql = userId ? 
      'SELECT id, email, role, birthday, gender, major FROM users WHERE id = ?' : 
      'SELECT id, email, role, birthday, gender, major FROM users LIMIT 1';
    const [users] = await connection.execute(sql, userId ? [userId] : []);
    
    await connection.end();
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('fail to load user:', error);
    res.status(500).json({ error: 'Failed to get current user' });
  }
});

module.exports = router;