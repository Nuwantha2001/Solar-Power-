import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '/src/style/Gsl.css';

const Generation_SL = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [solarData, setSolarData] = useState([]);
  const [capacityData, setCapacityData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(''); // State for error message

  // Set selectedDate to current date on component mount
  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    setSelectedDate(currentDate);
  }, []);

  // Fetch solar_data from API
  useEffect(() => {
    axios
      .get('http://localhost:5000/getsolardata')
      .then((response) => setSolarData(response.data || []))
      .catch((error) => console.error('Error fetching solar_data:', error));
  }, []);

  // Fetch capacity data from API
  useEffect(() => {
    axios
      .get('http://localhost:5000/capacity')
      .then((response) => setCapacityData(response.data || []))
      .catch((error) => console.error('Error fetching capacity data:', error));
  }, []);

  // Filter data based on selectedDate
  useEffect(() => {
    if (selectedDate) {
      const filtered = solarData.filter(data => data.date === selectedDate).map(data => {
        const capacity = capacityData.find((cap) => cap.site_id === data.site_id) || {};
        const theoreticalMaxGeneration = (capacity.capacity || 0) * 4; 
        const realMaxGeneration = capacity.max || 0;
        const averageGeneration = (capacity.avg || 0);
        
        return {
          ...data,
          ...capacity,
          theoreticalMaxGeneration,
          generationTodayPercent: ((data.solar_supply / theoreticalMaxGeneration) * 100).toFixed(2),
          realMaxGeneration,
          realMaxGenerationPercent: ((data.solar_supply / realMaxGeneration) * 100).toFixed(2),
          averageGeneration,
        };
      });
      setFilteredData(filtered);
    } else {
      setErrorMessage(''); // Clear error message if no date is selected
      setFilteredData([]); // Clear filtered data
    }
  }, [selectedDate, solarData, capacityData]);

  return (
    <div>
      <div className="gsl_head">
        <h1>Solar Generation Site List Summary</h1>
        <label>Select Date</label>
        <input type="date" name="Date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}/>
      </div>
      <div className="gsl_body">
        {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Display error message */}
        <table className="SGSL">
          <thead>
            <tr>
              <th>No:</th>
              <th>Site</th>
              <th>Site Id</th>
              <th>Date</th>
              <th>Solar Supply (kWh)</th>
              <th>Solar Capacity (kW)</th>
              <th>Theoretical Max Generation (kWh)</th>
              <th>Generation (Today / Theoretical) %</th>
              <th>Real Max Generation (kWh)</th>
              <th>Generation (Today / Real Max Generation) %</th>
              <th>Average Generation (kWh)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((data, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{data.site}</td>
                  <td>{data.site_id}</td>
                  <td>{data.date}</td>
                  <td>{data.solar_supply}</td>
                  <td>{data.capacity}</td>
                  <td>{data.theoreticalMaxGeneration}</td>
                  <td>{data.generationTodayPercent}</td>
                  <td>{data.realMaxGeneration}</td>
                  <td>{data.realMaxGenerationPercent}</td>
                  <td>{data.averageGeneration}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11">No data available for the selected date.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Generation_SL;