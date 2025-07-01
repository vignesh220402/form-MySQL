const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool with promise interface
const db = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'Vignesivam@12',  // Replace with your MySQL password
  database: 'auth_db'
});

// Create users table if not exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createTableQuery)
  .then(() => {
    console.log('Connected to MySQL database and users table is ready');
  })
  .catch((err) => {
    console.error('Error setting up database:', err);
  });
app.get("/",(req,res)=>{
  res.send("You Server is Running now Please check the UI")
})
// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [username, email, hashedPassword]);

    // Generate JWT token with optimized payload
    const token = jwt.sign(
      { userId: result.insertId, username },
      'your-secret-key',
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      userId: result.insertId,
      username
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    console.error('Error in registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    const [results] = await db.execute(query, [email]);
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials user!' });
    }
    
    const user = results[0];
    
    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials user!' });
    }
    
    // Generate JWT token with optimized payload
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      'your-secret-key',
      { expiresIn: '24h', algorithm: 'HS256' }
    );
    
    res.json({
      token,
      userId: user.id,
      username: user.username
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user endpoint with ID reordering
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Delete the user
    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    const [deleteResult] = await connection.execute(deleteQuery, [req.params.id]);
    
    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get all users with higher IDs
    const selectQuery = 'SELECT id FROM users WHERE id > ? ORDER BY id';
    const [users] = await connection.execute(selectQuery, [req.params.id]);
    
    // Update IDs for remaining users
    for (let i = 0; i < users.length; i++) {
      const newId = parseInt(req.params.id) + i;
      const oldId = users[i].id;
      await connection.execute('UPDATE users SET id = ? WHERE id = ?', [newId, oldId]);
    }
    
    // Reset auto-increment value
    const [maxResult] = await connection.execute('SELECT MAX(id) as maxId FROM users');
    const maxId = maxResult[0].maxId || 0;
    await connection.execute('ALTER TABLE users AUTO_INCREMENT = ?', [maxId + 1]);
    
    await connection.commit();
    res.json({ message: 'User deleted and IDs reordered successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error in user deletion:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Protected route example
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
    const [results] = await db.execute(query, [req.user.userId]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});