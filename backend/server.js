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

//---------------------------------------------------------------------------------------------------------------
// Upload Excel File
//---------------------------------------------------------------------------------------------------------------
app.post('/upload', (req, res) => {
  const { timeRange, parsedData } = req.body;

  // Validate the data
  if (!Array.isArray(parsedData) || parsedData.length === 0) {
    return res.status(400).json({ message: 'Invalid data format.' });
  }

  // Check if the timeRange already exists in the uploaded_files table
  const checkTimeRangeQuery = 'SELECT * FROM uploaded_files WHERE time_range = ?';
  db.query(checkTimeRangeQuery, [timeRange], (checkErr, results) => {
    if (checkErr) {
      console.error('Error checking time range:', checkErr);
      return res.status(500).json({ message: 'Failed to check time range.' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'This file has already been uploaded.' });
    }

    // Prepare queries and data for insertion
    const solarQuery = `INSERT INTO solar_data(site, site_id, date, solar_supply) VALUES ?`;
    const solarValues = parsedData.map((row) => [
      row.site,
      row.site_id,
      row.date,
      row.solar_supply_kwh,
    ]);

    const harvestQuery = `INSERT INTO solar_harvest(site_id, date, solar_supply) VALUES ?`;
    const validHarvestValues = parsedData
      .filter((row) => row.site_id && row.date && !isNaN(row.solar_supply_kwh))
      .map((row) => [row.site_id, row.date, row.solar_supply_kwh]);

    if (validHarvestValues.length === 0) {
      return res.status(400).json({ message: 'No valid data for solar_harvest.' });
    }

    const TimerangeQuery = 'INSERT INTO uploaded_files(time_range) VALUES (?)';
    const TimerangeValue = [timeRange];

    // Insert into both tables
    db.query(solarQuery, [solarValues], (solarErr) => {
      if (solarErr) {
        console.error('Error inserting into solar_data:', solarErr);
        return res.status(500).json({ message: 'Failed to upload data to solar_data.' });
      }

      db.query(harvestQuery, [validHarvestValues], (harvestErr) => {
        if (harvestErr) {
          console.error('Error inserting into solar_harvest:', harvestErr.sqlMessage || harvestErr);
          return res.status(500).json({ message: 'Failed to upload data to solar_harvest.' });
        }

        db.query(TimerangeQuery, [TimerangeValue], (timerageErr) => {
          if (timerageErr) {
            console.error('Error inserting into Time range:', timerageErr);
            return res.status(500).json({ message: 'Failed to upload the Time Range' });
          }

          // Calculate and update generation after successful data insertion
          calculateAndUpdateGeneration(() => {
            addDisconnectedSites(parsedData, (err) => {
              if (err) {
                console.error('Error processing disconnected sites:', err);
                return res.status(500).json({ message: 'Failed to process disconnected sites.' });
              }
              res.status(200).json({ message: 'Data uploaded successfully to all tables.' });
            });
          });
        });
      });
    });
  });
});

//---------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------

// Calculate maximum and average generation for each site
const calculateAndUpdateGeneration = (callback) => {
  const query = `
    SELECT site_id, MAX(solar_supply) AS max_generation, AVG(solar_supply) AS avg_generation
    FROM solar_data
    GROUP BY site_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error calculating generation:', err);
      return callback(err);
    }

    let completed = 0;
    results.forEach(({ site_id, max_generation, avg_generation }) => {
      const selectQuery = `
        SELECT max FROM capacity WHERE site_id = ?
      `;
      db.query(selectQuery, [site_id], (selectErr, selectResults) => {
        if (selectErr) {
          console.error(`Error selecting max for site_id ${site_id}:`, selectErr);
          return callback(selectErr);
        }

        const currentMax = selectResults[0]?.max || 0;
        if (max_generation > currentMax) {
          const updateQuery = `
            UPDATE capacity
            SET max = ?, avg = ?
            WHERE site_id = ?
          `;
          db.query(updateQuery, [max_generation, avg_generation, site_id], (updateErr) => {
            if (updateErr) {
              console.error(`Error updating capacity for site_id ${site_id}:`, updateErr);
              return callback(updateErr);
            }
            completed++;
            if (completed === results.length) callback(null);
          });
        } else {
          const updateAvgQuery = `
            UPDATE capacity
            SET avg = ?
            WHERE site_id = ?
          `;
          db.query(updateAvgQuery, [avg_generation, site_id], (updateAvgErr) => {
            if (updateAvgErr) {
              console.error(`Error updating avg for site_id ${site_id}:`, updateAvgErr);
              return callback(updateAvgErr);
            }
            completed++;
            if (completed === results.length) callback(null);
          });
        }
      });
    });
  });
};

//--------------------------------------------------------------------------------------------------------------------
// View Capacity Table Data
//--------------------------------------------------------------------------------------------------------------------
app.get('/capacity', (req, res) => {
  db.query('SELECT site_id, site, sub_region, capacity, max, avg FROM capacity', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
//-------CAPACITY TABLE HANDLING----------------------
// API to add a new site to the capacity table
app.post('/cap_insert', (req, res) => {
  const { site_id, site, sub_region, capacity} = req.body;

  console.log('Received data:', { site_id, site, sub_region, capacity });
  if (!site_id || !site || !sub_region || !capacity) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `INSERT INTO capacity(site_id, site, sub_region, capacity) VALUES (?, ?, ?, ?)`;
  db.query(query, [site_id, site, sub_region, capacity], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'New site added successfully!', insertId: result.insertId });
  });
});

// Update Site Details
app.put('/cap_update/:site_id', (req, res) => {
  const { site_id } = req.params;
  const { site, sub_region, capacity } = req.body;

  const query = `UPDATE capacity SET site = ?, sub_region = ?, capacity = ? WHERE site_id = ?`;
  db.query(query, [site, sub_region, capacity, site_id], (err, result) => {
    if (err) {
      console.error('Error updating site:', err);
      res.status(500).send('Error updating site details');
    } else {res.send('Site details updated successfully');}
  });
});

// Delete Site
app.delete('/cap_delete/:site_id', (req, res) => {
  const { site_id } = req.params;
  const query = `DELETE FROM capacity WHERE site_id = ?`;
  db.query(query, [site_id], (err, result) => {
    if (err) {
      console.error('Error deleting site:', err);
      res.status(500).send('Error deleting site');
    } else {res.send('Site deleted successfully');}
  });
});

//Upload Excel capacity table
app.post('/cap-upload', (req, res) => {
  const { summary } = req.body;

  if (!Array.isArray(summary) || summary.length === 0) {
    return res.status(400).json({ message: "No data to insert" });
  }

  const query = `INSERT INTO capacity (site_id, site, sub_region, capacity, max, avg) VALUES ?`;

  // Map the summary array 
  const values = summary.map(row => [ row.site_id, row.site, row.sub_region, row.capacity, row.max, row.avg,]);

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).send({ message: "Database error", error: err });
    }
    res.json({ message: `${result.affectedRows} records added successfully!` });
  });
});

//--------------------------------------------------------------------------------------------------------------------
// Summary Site
//--------------------------------------------------------------------------------------------------------------------
app.get('/getsolardata', (req, res) => {
  db.query('SELECT site, site_id, date, solar_supply FROM solar_data', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

//---------------------------------------------------------------------------------------------------------------------
// Disconnected Sites
//---------------------------------------------------------------------------------------------------------------------
// Function to process disconnected sites
function addDisconnectedSites(parsedData, callback) {
  const capacityQuery = 'SELECT site_id, site FROM capacity';
  db.query(capacityQuery, (err, capresults) => {
    if (err) return callback(err);

    const dailySiteIds = parsedData.map((row) => row.site_id);
    const date = parsedData[0]?.date; 

    const disconnectedSites = capresults.filter(
      (site) => !dailySiteIds.includes(site.site_id)
    );

    if (disconnectedSites.length === 0) {
      console.log('No Disconnected site found.');
      return callback(null, { message: 'No Disconnected sites found.' });
    }

    const values = disconnectedSites.map(site => [site.site_id, site.site, date]);
    const insertQuery = 'INSERT INTO disconnected_sites (site_id, site, date) VALUES ?';

    db.query(insertQuery, [values], (insertErr, result) => {
      if (insertErr) return callback(insertErr);
      console.log(`${result.affectedRows} rows inserted into disconnected_sites.`);
      callback(null, {
        message: `${result.affectedRows} Disconnected site(s) added successfully.`,
        data: disconnectedSites,
      });
    });
  });
}

// Route to get and store disconnected sites
app.get('/disconnected-sites', (req, res) => {
  const parsedData = []; // You need to provide the parsedData here
  addDisconnectedSites(parsedData, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Disconnected sites stored successfully!', data: results });
  });
});

app.get('/disconnectedsite', (req, res) => {
  console.log('Fetching disconnected sites...');
  db.query('SELECT site_id, site, date FROM disconnected_sites', (err, results) => {
    if (err) {
      console.error('Error fetching disconnected sites:', err);
      return res.status(500).json({ message: 'Error fetching disconnected sites' });
    }
    console.log('Disconnected sites fetched:', results);
    res.json(results);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
