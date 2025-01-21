import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '/src/style/Gsl.css';

const Disconnected_site = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [solarData, setSolarData] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/disconnectedsite')
      .then((response) => {
        console.log('API Response:', response.data);
        setSolarData(response.data || []);
      })
      .catch((error) => console.error('Error fetching solar_data:', error));
  }, []);

  const filteredData = solarData.filter((data) => data.date === selectedDate);

  return (
    <div>
      <div className="gsl_head">
        <h1>Disconnected Site Details</h1>
        <label>Select Date</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>
      <div className="gsl_body">
        <table className="SGSL">
          <thead>
            <tr>
              <th>No:</th>
              <th>Site Id</th>
              <th>Site Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((data, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{data.site_id}</td>
                  <td>{data.site}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No data available for the selected date.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Disconnected_site;
