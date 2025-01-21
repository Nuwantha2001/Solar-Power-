import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles = {
  container: {padding: '20px',maxWidth: '500px',margin: 'auto',border: '1px solid #ccc',borderRadius: '10px',},
  heading: {textAlign: 'center',},
  formGroup: {marginBottom: '15px',},
  select: {width: '100%',padding: '10px',fontSize: '16px',border: '1px solid #ccc',borderRadius: '5px',},
  input: {width: '100%',padding: '10px',fontSize: '16px',border: '1px solid #ccc',borderRadius: '5px',},
  buttonContainer: {display: 'flex',justifyContent: 'space-between',},
  button: {padding: '10px 20px',fontSize: '16px',color: '#fff',border: 'none',borderRadius: '5px',cursor: 'pointer',},
  updateButton: {backgroundColor: '#28a745',},
  deleteButton: {backgroundColor: '#dc3545',},
};

const Edit_site = () => {
  const [capacityData, setCapacityData] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [formData, setFormData] = useState({
    site: '',
    sub_region: '',
    capacity: '',
  });

  // Fetch existing capacity data
  useEffect(() => {
    axios.get('http://localhost:5000/capacity')
      .then(response => setCapacityData(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  // Handle site selection
  const handleSiteSelection = (e) => {
    const siteId = e.target.value;
    setSelectedSiteId(siteId);

    // Populate form data based on selected site_id
    const selectedSite = capacityData.find(site => site.site_id === siteId);
    if (selectedSite) {
      setFormData({
        site: selectedSite.site,
        sub_region: selectedSite.sub_region,
        capacity: selectedSite.capacity, });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
  };

  // Update site details
  const handleUpdate = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/cap_update/${selectedSiteId}`, formData)
      .then(() => {
        setCapacityData(prevData =>
          prevData.map(site => site.site_id === selectedSiteId ? { ...site, ...formData } : site));
        alert('Site updated successfully!');
      })
      .catch(error => console.error('Error updating site:', error));
  };

  // Delete site
  const handleDelete = () => {
    axios.delete(`http://localhost:5000/cap_delete/${selectedSiteId}`)
      .then(() => {
        setCapacityData(prevData => prevData.filter(site => site.site_id !== selectedSiteId));
        alert('Site deleted successfully!');
        setSelectedSiteId('');
        setFormData({ site: '', sub_region: '', capacity: '' });
      })
      .catch(error => console.error('Error deleting site:', error));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Update Site Details</h2>

      <form onSubmit={handleUpdate}>
        {/* Select Site ID */}
        <div style={styles.formGroup}>
          <label>Select Site ID:</label>
          <select value={selectedSiteId}onChange={handleSiteSelection}style={styles.select}>
            <option value="">-- Select Site ID --</option>
            {capacityData.map(site => (
              <option key={site.site_id} value={site.site_id}>{site.site_id}</option>
            ))}
          </select>
        </div>

        {/* Site Name */}
        <div style={styles.formGroup}>
          <label>Site Name:</label>
          <input type="text" name="site" placeholder="Site Name" value={formData.site}nChange={handleInputChange}
            style={styles.input} />
        </div>

        {/* Sub Region */}
        <div style={styles.formGroup}>
          <label>Sub Region:</label>
          <input type="text"name="sub_region"placeholder="Sub Region"value={formData.sub_region} onChange={handleInputChange}
            style={styles.input}/>
        </div>

        {/* Capacity */}
        <div style={styles.formGroup}>
          <label>Capacity:</label>
          <input type="number"name="capacity"placeholder="Capacity"value={formData.capacity} onChange={handleInputChange}
            style={styles.input}/>
        </div>

        {/* Buttons */}
        <div style={styles.buttonContainer}>
          <button type="submit" style={{ ...styles.button, ...styles.updateButton }}>Update</button>
          <button type="button" onClick={handleDelete} style={{ ...styles.button, ...styles.deleteButton }}>Delete</button>
        </div>
      </form>
    </div>
  );
};

export default Edit_site;