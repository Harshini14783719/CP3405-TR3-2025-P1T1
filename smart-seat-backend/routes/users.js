const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'asdfgh123',  // 数据库密码
  database: 'smart_seat',
};

// 查询所有用户
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute(`
      SELECT id, email, name, password, role
      FROM users
    `);
    await connection.end();
    res.json(users);
  } catch (error) {
    console.error('读取用户失败:', error);
    res.status(500).json({ error: 'Failed to read users' });
  }
});

// 根据ID查询单个用户
router.get('/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute(`
      SELECT id, email, name, password, role
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

// 更新用户信息
router.put('/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const userId = req.params.id;
    const { email, name, password, role } = req.body;

    // 查询用户是否存在
    const [existingUsers] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'User not found' });
    }

    // 保留旧密码，如果请求中未传密码
    const finalPassword = password || existingUsers[0].password;

    await connection.execute(
      'UPDATE users SET email = ?, name = ?, password = ?, role = ? WHERE id = ?',
      [email, name, finalPassword, role, userId]
    );

    // 查询更新后的用户
    const [updatedUsers] = await connection.execute('SELECT id, email, name, password, role FROM users WHERE id = ?', [userId]);
    await connection.end();

    res.json({ success: true, user: updatedUsers[0] });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
