import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Add_site from './capacity/Add_site';
import Capa_excel from './capacity/capa_excel';
import Edit_site from './capacity/Edit_site';

const Site = () => {
  const [capacityData, setCapacityData] = useState([]);
  const [showAddSite, setShowAddSite] = useState(false);
  const [showUploadExcel, setShowUploadExcel] = useState(false);
  const [showEdit, setShowEdit] = useState(false);


  // Fetch capacity data
  useEffect(() => {
    axios.get('http://localhost:5000/capacity')
      .then(response => setCapacityData(response.data))
      .catch(error => console.error('Error fetching capacity data:', error));
  }, []);

   // Toggle Add_site visibility
   const toggleAddSite = () => {
    setShowAddSite(prevState => !prevState);
  };
  // upload capacity excel file
  const toggleUploadExcel = () => {
    setShowUploadExcel(prevState => !prevState);
  };
   // upload capacity excel file
   const toggleEdit = () => {
    setShowEdit(prevState => !prevState);
  };

  return (
    <div style={styles.container}>
      <style>
        {`button {padding: 10px 20px;margin-left: 2%;margin-top:5%;font-size: 16px;background-color: #007BFF;
            color: white;border: none;border-radius: 4px;cursor: pointer;transition: background-color 0.3s;}
          button:hover {background-color: #0056b3;}
          table {width: 100%;border-collapse: collapse;margin-top: 20px;}
          th, td {border: 3px solid white;text-align: left;padding: 8px;}
          th {background-color:rgb(73, 119, 245);}
          tr:nth-child(even) {background-color:rgb(17, 150, 190);}
          h1 {color: #333;text-align: center;} `}
      </style>
      <h1>Site Capacity Details</h1>
      <button onClick={toggleUploadExcel}>{showUploadExcel ? 'Back' : 'Upload Excel'}
      </button>{showUploadExcel && <Capa_excel />}
      <button onClick={toggleEdit}>{showEdit ? 'Back' : 'Edit Site'}
      </button>{showEdit && <Edit_site />}
      <button onClick={toggleAddSite}>{showAddSite ? 'Back' : 'Add Site'}
      </button>{showAddSite && <Add_site />}
      <table>
        <thead>
          <tr>
            <th>Site ID</th>
            <th>Sub Region</th>
            <th>Capacity</th>
            <th>Max</th>
            <th>Avg</th>
          </tr>
        </thead>
        <tbody>
          {capacityData.map(row => (
            <tr key={row.id}>
              <td>{row.site_id}</td>
              <td>{row.sub_region}</td>
              <td>{row.capacity}</td>
              <td>{row.max}</td>
              <td>{row.avg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
const styles = {container: {padding: '20px',fontFamily: 'Arial, sans-serif', maxWidth: '800px',margin: 'auto',},};

export default Site;

