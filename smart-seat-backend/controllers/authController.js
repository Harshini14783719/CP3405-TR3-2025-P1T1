const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'cp3405-tr3-2025-p1t1-mysql-1',
  user: 'root',
  password: 'asdfgh123',
  database: 'smart_seat',
};

exports.register = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
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
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, password, role]
    );

    const newUserId = result.insertId;

    const [users] = await connection.execute(
      'SELECT id, email, role FROM users WHERE id = ?',
      [newUserId]
    );

    await connection.end();

    res.json({ success: true, user: users[0] });
  } catch (err) {
    console.error('Register failed:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password ) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [users] = await connection.execute(
      'SELECT id, email, role FROM users WHERE email = ? AND password = ? ',
      [email, password]
    );

    await connection.end();

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, user: { id: users[0].id, email: users[0].email }});
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};