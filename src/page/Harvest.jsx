import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '/src/style/Gsl.css';

const Harvest = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [solarData, setSolarData] = useState([]);
  const [capacityData, setCapacityData] = useState([]);
  const [sevenDayData, setSevenDayData] = useState([]);

  // Fetch solar_data from API
  useEffect(() => {
    axios
      .get('http://localhost:5000/getsolardata')
      .then((response) => setSolarData(response.data))
      .catch((error) => console.error('Error fetching solar_data:', error));
  }, []);

  // Fetch capacity data from API
  useEffect(() => {
    axios
      .get('http://localhost:5000/capacity')
      .then((response) => setCapacityData(response.data))
      .catch((error) => console.error('Error fetching capacity data:', error));
  }, []);

  // Generate 7-day data based on selected date
  useEffect(() => {
    if (selectedDate) {
      const selected = new Date(selectedDate);
      const range = [];

      // Generate past 7-day range
      for (let i = 6; i >= 0; i--) {
        const date = new Date(selected);
        date.setDate(selected.getDate() - i);
        range.push(date.toISOString().split('T')[0]);
      }

      // Map data for each site across the 7 days
      const dataWithSevenDays = capacityData.map((site) => {
        const row = { site_id: site.site_id, site: site.site };
        range.forEach((date) => {
          const solarForDate = solarData.find(
            (solar) => solar.site_id === site.site_id && solar.date === date);
            row[date] = solarForDate ? solarForDate.solar_supply : 0;
        });
        return row;
      });

      setSevenDayData({ range, data: dataWithSevenDays });
    }
  }, [selectedDate, solarData, capacityData]);

  return (
    <div>
      <div className="gsl_head">
        <h1>Seven Days Solar Harvest</h1>
        <label>Select Date</label>
        <input type="date" name="SelectedDate" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}/>
      </div>
      <div className="gsl_body">
        <table className="SGSL">
          <thead>
            <tr><th>No:</th>
                <th>Site Id</th>
                {sevenDayData.range?.map((date) => (<th key={date}>{date}</th>))}
            </tr>
          </thead>
          <tbody>
            {sevenDayData.data?.map((row, index) => (
              <tr key={row.site_id}>
                <td>{index + 1}</td>
                <td>{row.site_id}</td>
                {sevenDayData.range.map((date) => (<td key={date}>{row[date]}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Harvest;
