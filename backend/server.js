const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'sql107.infinityfree.com', // Replace with your phpMyAdmin host
  user: 'if0_38420686', // Replace with your database username
  password: 'wH0GodKSH7JU', // Replace with your database password
  database: 'if0_38420686_treasurehaunt', // Replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API Endpoints
app.post('/api/submit', (req, res) => {
  const { name, phone, secret } = req.body;
  const query = 'INSERT INTO submissions (name, phone, secret) VALUES (?, ?, ?)';
  db.query(query, [name, phone, secret], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Database error');
      return;
    }
    res.status(200).send('Data inserted successfully');
  });
});

// Endpoint to retrieve submission history
app.get('/api/history', (req, res) => {
  const query = 'SELECT * FROM submissions ORDER BY id DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).send('Database error');
      return;
    }
    res.status(200).json(results);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

});
