const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize the Express app
const app = express();
app.use(express.json());
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Wicki123@',
  database: 'solar_management',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// API endpoint to handle the file upload
app.post('/upload', (req, res) => {
  const parsedData = req.body;

  // Log received data for debugging
  console.log('Received data:', parsedData);

  // Validate the data
  if (!Array.isArray(parsedData) || parsedData.length === 0) {
    return res.status(400).json({ message: 'Invalid data format.' });
  }
  // Prepare the query and values for bulk insertion
  const query = `INSERT INTO solar_data(site, site_id, date, solar_supply) VALUES ?`;
  const values = parsedData.map((row) => [
    row.site,
    row.site_id,
    row.date,
    row.solar_supply_kwh,
  ]);
   console.log()

  // Insert data into the database
  db.query(query, [values], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ message: 'Failed to upload data.' });
    }
    console.log('Data inserted successfully:', result);
    res.status(200).json({ message: 'Data uploaded successfully.' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
