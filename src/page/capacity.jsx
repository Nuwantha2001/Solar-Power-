import React from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
//import './capacity.css';

const Capacity = () => {
  const [summary, setSummary] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Select the "Site Capacity Details" sheet by name
        const sheetName = 'Site Capacity Details';
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
          alert(`Sheet "${sheetName}" not found!`);
          setLoading(false);
          return;
        }

        // Parse the sheet into JSON format, keeping only the first 5 columns
        const parsedCapacity = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const parsedSummary = parsedCapacity
        .filter( (row) => row['Site ID']?.trim().toLowerCase() !== null && row['Capacity(kw)'] !== null)
        .map((row, index) => ({
          index: index + 1, // Add row index
          site_id: row['Site ID'] || 'N/A',
          sub_region: row['Sub Region'] || 'N/A',
          capacity: row['Capacity(kW)'] || 'N/A',
          max_generation: row['Max Generated'] || 'N/A',
          avg_generation: row['Average Generated'] || 'N/A',

          
        }));

        setSummary(parsedSummary);
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Failed to process the file.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    try {
      await axios.post('http://localhost:5000/upload', summary);
      alert('Data uploaded successfully');
    } catch (error) {
      console.error('Error uploading data:', error);
      alert('Failed to upload the data to the server');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      handleFileUpload(file);
    }
  };

  return (
    <div>
      <h1>Site Capacity Upload</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      {loading && <div className="loading-bar">Processing...</div>}
      <button onClick={handleUpload} disabled={loading || summary.length === 0}>
        Check & Upload
      </button>
      <div>
        <table border="1">
          <thead>
            <tr>
              <th>No:</th>
              <th>Site ID</th>
              <th>Sub Region</th>
              <th>Capacity</th>
              <th>Max Generation</th>
              <th>Avg Generation</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row) => (
              <tr key={row.index}>
                <td>{row.index}</td>
                <td>{row.site_id}</td>
                <td>{row.sub_region}</td>
                <td>{row.capacity}</td>
                <td>{row.max_generation}</td>
                <td>{row.avg_generation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Capacity;
