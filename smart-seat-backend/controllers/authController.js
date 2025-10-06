const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'asdfgh123', // 请改成你的数据库密码
  database: 'smart_seat',
};

// 注册用户
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [existing] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );

    const newUserId = result.insertId;

    const [users] = await connection.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [newUserId]
    );

    await connection.end();

    res.json({ success: true, user: users[0] });
  } catch (err) {
    console.error('Register failed:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 登录用户
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Email, password and role required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [users] = await connection.execute(
      'SELECT id, name, email, role FROM users WHERE email = ? AND password = ? AND role = ?',
      [email, password, role]
    );

    await connection.end();

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or role' });
    }

    res.json({ success: true, user: users[0] });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
