
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const test = () => {
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
        capacity: selectedSite.capacity,
      });
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
    axios.put(`http://localhost:5000/capacity/${selectedSiteId}`, formData)
      .then(() => {
        setCapacityData(prevData =>
          prevData.map(site =>
            site.site_id === selectedSiteId ? { ...site, ...formData } : site
          )
        );
        alert('Site updated successfully!');
      })
      .catch(error => console.error('Error updating site:', error));
  };

  // Delete site
  const handleDelete = () => {
    axios.delete(`http://localhost:5000/capacity/${selectedSiteId}`)
      .then(() => {
        setCapacityData(prevData =>
          prevData.filter(site => site.site_id !== selectedSiteId)
        );
        alert('Site deleted successfully!');
        setSelectedSiteId('');
        setFormData({ site: '', sub_region: '', capacity: '' });
      })
      .catch(error => console.error('Error deleting site:', error));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2 style={{ textAlign: 'center' }}>Update Site Details</h2>

      <form onSubmit={handleUpdate}>
        {/* Select Site ID */}
        <div style={{ marginBottom: '15px' }}>
          <label>Select Site ID:</label>
          <select
            value={selectedSiteId}
            onChange={handleSiteSelection}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          >
            <option value="">-- Select Site ID --</option>
            {capacityData.map(site => (
              <option key={site.site_id} value={site.site_id}>
                {site.site_id}
              </option>
            ))}
          </select>
        </div>

        {/* Site Name */}
        <div style={{ marginBottom: '15px' }}>
          <label>Site Name:</label>
          <input
            type="text"
            name="site"
            placeholder="Site Name"
            value={formData.site}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>

        {/* Sub Region */}
        <div style={{ marginBottom: '15px' }}>
          <label>Sub Region:</label>
          <input
            type="text"
            name="sub_region"
            placeholder="Sub Region"
            value={formData.sub_region}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>

        {/* Capacity */}
        <div style={{ marginBottom: '15px' }}>
          <label>Capacity:</label>
          <input
            type="number"
            name="capacity"
            placeholder="Capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Update
          </button>
          <button
            type="button"
            onClick={handleDelete}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
};

export default test;
